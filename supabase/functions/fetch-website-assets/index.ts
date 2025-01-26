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
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Skip invalid URLs early
    if (!websiteUrl || websiteUrl === '#' || !websiteUrl.includes('.')) {
      console.log('Invalid URL format:', websiteUrl)
      return new Response(
        JSON.stringify({ 
          faviconUrl: null,
          screenshotUrl: null,
          message: 'Invalid URL format' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // Format and validate URL
    let formattedUrl: string
    try {
      formattedUrl = websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`
      new URL(formattedUrl)
    } catch (error) {
      console.error('URL validation error:', error)
      return new Response(
        JSON.stringify({ 
          faviconUrl: null,
          screenshotUrl: null,
          error: 'Invalid URL format' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get favicon using Google's favicon service
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${new URL(formattedUrl).hostname}&sz=128`
    console.log('Fetching favicon from:', faviconUrl)

    try {
      // Fetch the favicon
      const faviconResponse = await fetch(faviconUrl)
      if (!faviconResponse.ok) {
        throw new Error(`Failed to fetch favicon: ${faviconResponse.statusText}`)
      }

      const faviconBlob = await faviconResponse.blob()
      
      // Upload favicon to Supabase Storage
      const faviconFileName = `${uniqueId}-favicon.png`
      const { error: faviconUploadError } = await supabase.storage
        .from('favicons')
        .upload(faviconFileName, faviconBlob, {
          contentType: 'image/png',
          upsert: true
        })

      if (faviconUploadError) {
        throw new Error(`Failed to upload favicon: ${faviconUploadError.message}`)
      }

      // Get favicon public URL
      const { data: { publicUrl: faviconPublicUrl } } = supabase.storage
        .from('favicons')
        .getPublicUrl(faviconFileName)

      // Update the database with the favicon URL
      const { error: updateError } = await supabase
        .from('AI Agent Data')
        .update({ favicon_url: faviconPublicUrl })
        .eq('unique_id', uniqueId)

      if (updateError) {
        throw new Error(`Failed to update database: ${updateError.message}`)
      }

      console.log('Successfully processed favicon:', faviconPublicUrl)
      return new Response(
        JSON.stringify({ 
          faviconUrl: faviconPublicUrl,
          message: 'Assets processed successfully' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } catch (error) {
      console.error('Error processing assets:', error)
      return new Response(
        JSON.stringify({ 
          faviconUrl: null,
          error: error.message 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

  } catch (error) {
    console.error('Unhandled error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})