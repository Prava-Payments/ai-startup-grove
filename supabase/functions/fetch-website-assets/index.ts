import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import puppeteer from 'https://deno.land/x/puppeteer@16.2.0/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 200 })
  }

  try {
    const { websiteUrl, uniqueId } = await req.json()
    console.log(`Processing website: ${websiteUrl} for ID: ${uniqueId}`)

    if (!websiteUrl || !uniqueId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Launch browser
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    
    try {
      // Set viewport and timeout
      await page.setViewport({ width: 1280, height: 800 })
      await page.setDefaultNavigationTimeout(30000)

      // Navigate to the website
      console.log(`Navigating to ${websiteUrl}`)
      await page.goto(websiteUrl, { waitUntil: 'networkidle0' })
      
      // Take screenshot
      const screenshot = await page.screenshot({ type: 'jpeg', quality: 80 })
      
      // Generate unique filename
      const timestamp = new Date().toISOString()
      const screenshotPath = `${uniqueId}_${timestamp}.jpg`
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('screenshots')
        .upload(screenshotPath, screenshot, {
          contentType: 'image/jpeg',
          upsert: true
        })

      if (uploadError) {
        throw new Error(`Failed to upload screenshot: ${uploadError.message}`)
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('screenshots')
        .getPublicUrl(screenshotPath)

      // Update the websites table
      const { error: websiteError } = await supabase
        .from('websites')
        .upsert({
          unique_id: uniqueId,
          website_url: websiteUrl,
          screenshot_url: publicUrl,
          status: 'completed',
          updated_at: new Date().toISOString()
        })

      if (websiteError) {
        throw new Error(`Failed to update website record: ${websiteError.message}`)
      }

      // Update AI Agent Data table through trigger
      console.log('Screenshot processed successfully:', publicUrl)
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          screenshotUrl: publicUrl 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )

    } finally {
      await browser.close()
    }

  } catch (error) {
    console.error('Error processing screenshot:', error)
    
    // Update status to error in websites table
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    try {
      await supabase
        .from('websites')
        .update({ 
          status: 'error',
          error_message: error.message,
          updated_at: new Date().toISOString()
        })
        .eq('website_url', req.websiteUrl)
    } catch (dbError) {
      console.error('Failed to update error status:', dbError)
    }

    return new Response(
      JSON.stringify({ 
        error: 'Failed to process screenshot',
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  }
})