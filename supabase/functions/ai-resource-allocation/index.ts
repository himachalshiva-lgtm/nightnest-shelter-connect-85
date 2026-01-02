import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ShelterData {
  id: string;
  name: string;
  totalBeds: number;
  currentOccupancy: number;
  coordinates: { lat: number; lng: number };
}

interface NGOStock {
  ngoName: string;
  itemType: string;
  quantity: number;
}

interface AllocationRequest {
  shelters: ShelterData[];
  ngoStock: NGOStock[];
  resourceType: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { shelters, ngoStock, resourceType } = await req.json() as AllocationRequest;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an AI resource allocation expert for homeless shelter management in Delhi, India. 
Your task is to optimally distribute NGO resources (blankets, food kits, hygiene kits, clothing, medical supplies) across government school night shelters.

Consider these factors when allocating:
1. Current occupancy vs capacity (prioritize shelters with higher occupancy)
2. Existing stock levels at each shelter
3. Geographic distribution to ensure fair coverage
4. Urgency based on weather conditions (winter = more blankets needed)
5. Special needs of each shelter

Provide allocation recommendations in JSON format with reasoning.`;

    const userPrompt = `Please analyze and provide optimal allocation for the following:

SHELTERS:
${JSON.stringify(shelters, null, 2)}

AVAILABLE NGO STOCK:
${JSON.stringify(ngoStock, null, 2)}

RESOURCE TYPE TO ALLOCATE: ${resourceType}

Provide your response as a JSON object with:
1. "allocations": array of { shelterId, shelterName, quantity, priority, reason }
2. "summary": brief explanation of the allocation strategy
3. "totalAllocated": total items distributed
4. "recommendations": any additional recommendations`;

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
    let allocation;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = aiResponse.match(/```json\n?([\s\S]*?)\n?```/) || 
                        aiResponse.match(/```\n?([\s\S]*?)\n?```/) ||
                        [null, aiResponse];
      allocation = JSON.parse(jsonMatch[1] || aiResponse);
    } catch {
      allocation = { rawResponse: aiResponse, parseError: true };
    }

    return new Response(JSON.stringify({ allocation, success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in ai-resource-allocation:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error",
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
