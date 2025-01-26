import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const MAX_RETRIES = 3;
const TIMEOUT = 10000; // 10 seconds

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 200
    });
  }

  try {
    console.log('Received request to fetch-website-assets');
    
    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (error) {
      console.error('Error parsing request body:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request body',
          details: error.message 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    const { websiteUrl, uniqueId } = body;
    console.log('Processing request for:', { websiteUrl, uniqueId });

    if (!websiteUrl || !uniqueId) {
      return new Response(
        JSON.stringify({ 
          error: 'Website URL and unique ID are required',
          faviconUrl: null 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let formattedUrl = websiteUrl;
    if (!formattedUrl.startsWith('http')) {
      formattedUrl = `https://${formattedUrl}`;
    }
    
    let hostname;
    try {
      hostname = new URL(formattedUrl).hostname;
    } catch (e) {
      console.error('Invalid URL:', formattedUrl, e);
      return new Response(
        JSON.stringify({ 
          error: `Invalid URL: ${formattedUrl}`,
          faviconUrl: null 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    const faviconUrls = [
      `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`,
      `${formattedUrl}/favicon.ico`,
      `${formattedUrl}/favicon.png`,
      `https://icon.horse/icon/${hostname}`,
      `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${hostname}&size=128`
    ];

    let faviconBlob = null;
    let successfulUrl = null;
    let lastError = null;

    for (let retry = 0; retry < MAX_RETRIES; retry++) {
      for (const url of faviconUrls) {
        try {
          console.log(`Attempt ${retry + 1} - Trying URL: ${url}`);
          
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), TIMEOUT);
          
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
          lastError = error;
          console.log(`Failed to fetch from ${url}:`, error.message);
          continue;
        }
      }

      if (faviconBlob) break;
      
      if (retry < MAX_RETRIES - 1) {
        const delay = Math.pow(2, retry) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    if (!faviconBlob) {
      console.log('No valid favicon found after all retries');
      return new Response(
        JSON.stringify({ 
          error: lastError?.message || 'Could not fetch a valid favicon',
          faviconUrl: null 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 // Return 200 even for business logic failures
        }
      );
    }

    console.log('Successfully fetched favicon from:', successfulUrl);
    
    const fileName = `${uniqueId}.png`;
    const { error: uploadError } = await supabase.storage
      .from('favicons')
      .upload(fileName, faviconBlob, {
        contentType: 'image/png',
        upsert: true
      });

    if (uploadError) {
      console.error('Failed to upload favicon:', uploadError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to upload favicon',
          details: uploadError.message,
          faviconUrl: null 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 // Return 200 even for business logic failures
        }
      );
    }

    const { data: { publicUrl } } = supabase.storage
      .from('favicons')
      .getPublicUrl(fileName);

    const { error: updateError } = await supabase
      .from('AI Agent Data')
      .update({ favicon_url: publicUrl })
      .eq('unique_id', uniqueId);

    if (updateError) {
      console.error('Failed to update database:', updateError);
    }

    console.log('Successfully processed favicon:', publicUrl);
    return new Response(
      JSON.stringify({ 
        faviconUrl: publicUrl,
        message: 'Favicon processed successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Unhandled error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message,
        faviconUrl: null
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 200 // Return 200 even for internal errors to prevent CORS issues
      }
    );
  }
});