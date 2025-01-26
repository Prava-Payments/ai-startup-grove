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

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    try {
      // Get favicon using Google's favicon service
      const faviconUrl = `https://www.google.com/s2/favicons?domain=${new URL(websiteUrl).hostname}&sz=128`
      console.log('Fetching favicon from:', faviconUrl)

      // Fetch the favicon with timeout
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000) // 10 second timeout
      
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

      // Update the database with the favicon URL
      const { error: updateError } = await supabase
        .from('AI Agent Data')
        .update({ favicon_url: publicUrl })
        .eq('unique_id', uniqueId)

      if (updateError) {
        throw new Error(`Failed to update database: ${updateError.message}`)
      }

      console.log('Successfully processed favicon:', publicUrl)
      return new Response(
        JSON.stringify({ 
          faviconUrl: publicUrl,
          message: 'Favicon processed successfully' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } catch (error) {
      console.error('Error processing favicon:', error)
      return new Response(
        JSON.stringify({ 
          error: error.message 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
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