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
    // Parse request body
    const body = await req.json().catch(error => {
      console.error('Error parsing request body:', error)
      throw new Error('Invalid request body')
    })

    const { websiteUrl, uniqueId } = body

    // Validate required parameters
    if (!websiteUrl || !uniqueId) {
      console.error('Missing required parameters:', { websiteUrl, uniqueId })
      throw new Error('Website URL and unique ID are required')
    }

    // Skip invalid URLs early
    if (websiteUrl === '#' || !websiteUrl.includes('.')) {
      console.log('Skipping invalid URL:', websiteUrl)
      return new Response(
        JSON.stringify({ 
          faviconUrl: null,
          message: 'Invalid URL format' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    }

    // Format and validate URL
    let formattedUrl: string
    try {
      formattedUrl = websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`
      new URL(formattedUrl) // This will throw if URL is invalid
    } catch (error) {
      console.error('URL validation error:', error)
      return new Response(
        JSON.stringify({ 
          faviconUrl: null,
          error: 'Invalid URL format' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    }

    // Get favicon using Google's favicon service
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${new URL(formattedUrl).hostname}&sz=128`
    
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    try {
      // Fetch the favicon
      const faviconResponse = await fetch(faviconUrl)
      if (!faviconResponse.ok) {
        throw new Error(`Failed to fetch favicon: ${faviconResponse.statusText}`)
      }

      const faviconBlob = await faviconResponse.blob()
      
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

      return new Response(
        JSON.stringify({ faviconUrl: publicUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } catch (error) {
      console.error('Error processing favicon:', error)
      return new Response(
        JSON.stringify({ 
          faviconUrl: null,
          error: error.message 
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
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})