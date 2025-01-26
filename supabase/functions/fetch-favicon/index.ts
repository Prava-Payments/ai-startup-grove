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
    const { websiteUrl, uniqueId } = await req.json()

    if (!websiteUrl || !uniqueId) {
      throw new Error('Website URL and unique ID are required')
    }

    // Ensure URL is properly formatted
    const formattedUrl = websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`
    const url = new URL(formattedUrl)
    
    // Get favicon using Google's favicon service
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=128`
    
    // Fetch the favicon
    const faviconResponse = await fetch(faviconUrl)
    if (!faviconResponse.ok) {
      throw new Error('Failed to fetch favicon')
    }

    const faviconBlob = await faviconResponse.blob()
    
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Upload to Supabase Storage
    const fileName = `${uniqueId}.png`
    const { data: uploadData, error: uploadError } = await supabase.storage
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

    // Update database
    const { error: updateError } = await supabase
      .from('websites')
      .update({ 
        favicon_url: publicUrl,
        status: 'favicon_completed',
        updated_at: new Date().toISOString()
      })
      .eq('unique_id', uniqueId)

    if (updateError) {
      throw new Error(`Failed to update database: ${updateError.message}`)
    }

    return new Response(
      JSON.stringify({ success: true, faviconUrl: publicUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in fetch-favicon function:', error)
    
    // Update database with error
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    try {
      const { websiteUrl, uniqueId } = await req.json()
      if (uniqueId) {
        await supabase
          .from('websites')
          .update({ 
            error_message: error.message,
            status: 'favicon_error',
            retry_count: supabase.sql`retry_count + 1`,
            updated_at: new Date().toISOString()
          })
          .eq('unique_id', uniqueId)
      }
    } catch (dbError) {
      console.error('Error updating database with error status:', dbError)
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})