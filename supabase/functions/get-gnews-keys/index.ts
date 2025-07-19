import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get API keys from environment variables
    const keys = [
      Deno.env.get('GNEWS_API_KEY_1'),
      Deno.env.get('GNEWS_API_KEY_2'),
      Deno.env.get('GNEWS_API_KEY_3'),
      Deno.env.get('GNEWS_API_KEY_4'),
    ].filter(Boolean) // Remove any undefined keys

    if (keys.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No API keys configured' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    return new Response(
      JSON.stringify({ keys }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})