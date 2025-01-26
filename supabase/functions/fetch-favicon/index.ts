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
    console.log('Received request to fetch-favicon')
    
    // Parse request body
    const { websiteUrl, uniqueId } = await req.json().catch(error => {
      console.error('Error parsing request body:', error)
      throw new Error('Invalid request body')
    })

    console.log('Processing request for:', { websiteUrl, uniqueId })

    // Validate required parameters
    if (!websiteUrl || !uniqueId) {
      console.error('Missing required parameters:', { websiteUrl, uniqueId })
      return new Response(
        JSON.stringify({ 
          error: 'Website URL and unique ID are required' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
    }

    // Skip invalid URLs early
    if (!websiteUrl || websiteUrl === '#' || !websiteUrl.includes('.')) {
      console.log('Invalid URL format:', websiteUrl)
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
      new URL(formattedUrl) // Validate URL format
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

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check if favicon already exists in storage
    const { data: existingFile } = await supabase.storage
      .from('favicons')
      .getPublicUrl(`${uniqueId}.png`)

    if (existingFile?.publicUrl) {
      console.log('Returning existing favicon:', existingFile.publicUrl)
      return new Response(
        JSON.stringify({ faviconUrl: existingFile.publicUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get favicon using Google's favicon service
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${new URL(formattedUrl).hostname}&sz=128`
    console.log('Fetching favicon from:', faviconUrl)

    try {
      // Fetch the favicon with timeout
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)
      
      const faviconResponse = await fetch(faviconUrl, { 
        signal: controller.signal 
      }).finally(() => clearTimeout(timeout))

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

      console.log('Successfully processed favicon:', publicUrl)
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