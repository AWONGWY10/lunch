import { GoogleGenAI } from "@google/genai";
import { Coordinates, Place, SearchFilters, GroundingChunk } from "../types";

/**
 * Defensive utility to ensure we never render a raw object in JSX.
 */
const safeString = (val: any, fallback: string = ""): string => {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'string') return val;
  if (typeof val === 'object') {
    try {
      return val.message || val.title || JSON.stringify(val);
    } catch {
      return fallback;
    }
  }
  return String(val);
};

export const findRestaurants = async (
  coords: Coordinates,
  filters: SearchFilters
): Promise<{ text: string; places: Place[] }> => {
  // Use Vite's standard env variable access
  const apiKey = import.meta.env.VITE_API_KEY;
  
  if (!apiKey || apiKey === "undefined") {
    console.error("API Key Check Failed. Available env keys:", Object.keys(import.meta.env));
    throw new Error("API Key is missing. Please check your GitHub repository secrets and ensure 'VITE_API_KEY' is set.");
  }
  
  const ai = new GoogleGenAI({ apiKey });
  const modelId = "gemini-2.5-flash";

  // Refined prompt to strictly enforce Malaysia and distance
  const prompt = `
    Find at least 5 distinct food spots or restaurants in Malaysia.
    Center your search strictly around Latitude ${coords.latitude}, Longitude ${coords.longitude}.
    Search Radius: ${filters.radius} meters.
    Budget Vibe: ${filters.budget}.
    
    CRITICAL INSTRUCTIONS:
    1. You MUST use the 'googleMaps' tool to verify locations.
    2. ONLY return places located in Malaysia. Do NOT return places in the USA or other countries.
    3. Ensure places are physically within ${filters.radius} meters of the user.
    4. For each place, write a short, funny Gen-Z style 'vibe check' description.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: "You are a local Malaysian food guide. You MUST ONLY recommend places inside Malaysia. If a location is not in Malaysia, ignore it. Describe places with high-energy, funny Gen-Z slang (e.g. 'bussing', 'no cap', 'mid', 'goated').",
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: Number(coords.latitude),
              longitude: Number(coords.longitude),
            }
          }
        },
      },
    });

    const text = safeString(response.text);
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] || [];
    const places: Place[] = [];
    
    // We iterate through the grounding chunks to get the actual Google Maps entities
    chunks.forEach((chunk) => {
      if (chunk.maps && chunk.maps.title) {
        const title = safeString(chunk.maps.title);
        
        // Extract a snippet if available from grounding data
        const snippet = chunk.maps.placeAnswerSources?.[0]?.reviewSnippets?.[0] 
                      || "Vibe check: Certified bussing. 100% no cap.";

        // Prevent duplicates
        if (!places.find(p => p.title === title)) {
            places.push({
                title: title,
                uri: chunk.maps.uri,
                distance: "Nearby",
                description: safeString(snippet),
            });
        }
      }
    });

    console.debug("Grounding Chunks received:", chunks);

    return { text, places };
  } catch (error: any) {
    console.error("Gemini Search Error Details:", error);
    
    const message = error?.message || String(error);
    if (message.includes("403") || message.includes("API_KEY_INVALID")) {
        throw new Error("Invalid or Restricted API Key. Ensure the key has Gemini API and Google Maps grounding access.");
    }
    
    // For other errors, we throw so the UI can show the specific issue
    throw error;
  }
};
