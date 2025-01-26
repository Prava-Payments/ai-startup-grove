import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Received request to fetch-website-assets')
    
    // Parse request body
    const { websiteUrl, uniqueId } = await req.json()
    console.log('Processing request for:', { websiteUrl, uniqueId })

    // Validate required parameters
    if (!websiteUrl || !uniqueId) {
      console.error('Missing required parameters:', { websiteUrl, uniqueId })
      return new Response(
        JSON.stringify({ 
          error: 'Website URL and unique ID are required',
          faviconUrl: null 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 200 
        }
      )
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    try {
      // Format URL properly
      let formattedUrl = websiteUrl
      if (!formattedUrl.startsWith('http')) {
        formattedUrl = `https://${formattedUrl}`
      }
      
      // Get hostname safely
      let hostname
      try {
        hostname = new URL(formattedUrl).hostname
      } catch (e) {
        console.error('Invalid URL:', formattedUrl, e)
        return new Response(
          JSON.stringify({ 
            error: `Invalid URL: ${formattedUrl}`,
            faviconUrl: null 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        )
      }

      // Array of possible favicon URLs to try
      const faviconUrls = [
        `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`,
        `${formattedUrl}/favicon.ico`,
        `${formattedUrl}/favicon.png`,
        `https://icon.horse/icon/${hostname}`,
        `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${hostname}&size=128`
      ];

      let faviconBlob = null;
      let successfulUrl = null;

      // Try each URL until we get a valid favicon
      for (const url of faviconUrls) {
        console.log('Attempting to fetch favicon from:', url);
        
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 10000); // Increased timeout to 10 seconds
          
          const response = await fetch(url, { 
            signal: controller.signal,
            headers: {
              'Accept': 'image/*'
            }
          }).finally(() => clearTimeout(timeout));

          if (response.ok) {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('image')) {
              const blob = await response.blob();
              if (blob.size > 0) {
                faviconBlob = blob;
                successfulUrl = url;
                break;
              }
            }
          }
        } catch (error) {
          console.log(`Failed to fetch from ${url}:`, error.message);
          continue;
        }
      }

      if (!faviconBlob) {
        console.log('No valid favicon found for:', hostname);
        return new Response(
          JSON.stringify({ 
            faviconUrl: null,
            message: 'No valid favicon found for the website' 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        );
      }

      console.log('Successfully fetched favicon from:', successfulUrl);
      
      // Upload to Supabase Storage
      const fileName = `${uniqueId}.png`
      const { error: uploadError } = await supabase.storage
        .from('favicons')
        .upload(fileName, faviconBlob, {
          contentType: 'image/png',
          upsert: true
        })

      if (uploadError) {
        console.error('Failed to upload favicon:', uploadError);
        return new Response(
          JSON.stringify({ 
            error: 'Failed to upload favicon',
            faviconUrl: null 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        )
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('favicons')
        .getPublicUrl(fileName)

      // Update the database with the favicon URL
      const { error: updateError } = await supabase
        .from('AI Agent Data')
        .update({ favicon_url: publicUrl })
        .eq('unique_id', uniqueId)

      if (updateError) {
        console.error('Failed to update database:', updateError);
        // Continue execution even if database update fails
      }

      console.log('Successfully processed favicon:', publicUrl)
      return new Response(
        JSON.stringify({ 
          faviconUrl: publicUrl,
          message: 'Favicon processed successfully' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )

    } catch (error) {
      console.error('Error processing favicon:', error)
      return new Response(
        JSON.stringify({ 
          error: error.message,
          details: 'Failed to process favicon',
          faviconUrl: null
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 200
        }
      )
    }

  } catch (error) {
    console.error('Unhandled error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message,
        faviconUrl: null
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 200
      }
    )
  }
})