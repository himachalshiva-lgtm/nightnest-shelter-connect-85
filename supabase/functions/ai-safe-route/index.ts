import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RouteRequest {
  userLocation: { lat: number; lng: number };
  shelters: Array<{
    id: string;
    name: string;
    address: string;
    availableBeds: number;
    coordinates: { lat: number; lng: number };
    amenities: string[];
  }>;
  timeOfDay: string;
  userNeeds?: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userLocation, shelters, timeOfDay, userNeeds } = await req.json() as RouteRequest;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an AI safety advisor for homeless individuals in Delhi, India. 
Your task is to recommend the safest route to reach night shelters (government schools converted to shelters).

Consider these safety factors:
1. Time of day (night travel is riskier)
2. Well-lit main roads vs dark alleys
3. Police stations and public areas along the route
4. Distance and walking time for elderly/disabled
5. Weather conditions
6. Available amenities at destination (meals, medical aid, etc.)

Delhi-specific safety considerations:
- Major roads like Ring Road, Mathura Road are generally safer
- Areas near metro stations have better lighting
- ISBT bus terminals have security presence
- Railway station areas can be crowded but have police

Provide route recommendations with safety scores and specific guidance.`;

    const userPrompt = `Find the safest route for a homeless person at these coordinates:
CURRENT LOCATION: Latitude ${userLocation.lat}, Longitude ${userLocation.lng}

AVAILABLE SHELTERS:
${JSON.stringify(shelters, null, 2)}

TIME OF DAY: ${timeOfDay}
${userNeeds?.length ? `SPECIAL NEEDS: ${userNeeds.join(', ')}` : ''}

Provide your response as a JSON object with:
1. "recommendedShelter": { id, name, reason, safetyScore (1-10) }
2. "routeGuidance": step-by-step directions emphasizing safety
3. "safetyTips": array of safety tips for the journey
4. "estimatedWalkTime": in minutes
5. "alternativeShelters": array of backup options with reasons
6. "emergencyContacts": relevant helpline numbers for Delhi`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    // Try to parse JSON from the response
    let routeData;
    try {
      const jsonMatch = aiResponse.match(/```json\n?([\s\S]*?)\n?```/) || 
                        aiResponse.match(/```\n?([\s\S]*?)\n?```/) ||
                        [null, aiResponse];
      routeData = JSON.parse(jsonMatch[1] || aiResponse);
    } catch {
      routeData = { rawResponse: aiResponse, parseError: true };
    }

    return new Response(JSON.stringify({ routeData, success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in ai-safe-route:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error",
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
