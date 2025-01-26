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
        JSON.stringify({ error: 'Website URL and unique ID are required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 400 
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
        throw new Error(`Invalid URL: ${formattedUrl}`)
      }

      // Array of possible favicon URLs to try
      const faviconUrls = [
        `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`,
        `${formattedUrl}/favicon.ico`,
        `${formattedUrl}/favicon.png`,
        `https://icon.horse/icon/${hostname}`,
      ];

      let faviconBlob = null;
      let successfulUrl = null;

      // Try each URL until we get a valid favicon
      for (const url of faviconUrls) {
        console.log('Attempting to fetch favicon from:', url);
        
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 5000);
          
          const response = await fetch(url, { signal: controller.signal })
            .finally(() => clearTimeout(timeout));

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
        throw new Error('Could not fetch a valid favicon from any source');
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
        throw new Error(`Failed to upload favicon: ${uploadError.message}`)
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('favicons')
        .getPublicUrl(fileName)

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
          details: 'Failed to process favicon'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 500 
        }
      )
    }

  } catch (error) {
    console.error('Unhandled error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    )
  }
})