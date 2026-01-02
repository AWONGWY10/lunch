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
  // Always initialize fresh to ensure we use the injected API key from the build process
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "undefined") {
    throw new Error("API Key is missing. Please check your GitHub repository secrets and ensure 'API_KEY' is set.");
  }
  
  const ai = new GoogleGenAI({ apiKey });
  const modelId = "gemini-2.5-flash";

  // Using a cleaner prompt to focus the model on the Maps tool grounding.
  // We rely on the toolConfig latLng to handle the precise location.
  const prompt = `
    Search for food spots and restaurants near Latitude ${coords.latitude}, Longitude ${coords.longitude}.
    The user is looking for spots within ${filters.radius} meters.
    Target Budget: ${filters.budget}.
    
    CRITICAL: 
    1. Use the Google Maps tool for ALL results. 
    2. Provide a short, funny Gen-Z style 'vibe check' for each restaurant found.
    3. Return local results only.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: "You are a local food guide. You use Google Maps to find restaurants near the user. Your tone is funny, high-energy, and Gen-Z (using words like 'bussing', 'no cap', 'vibe', 'lowkey'). Always prioritize grounding results from the Maps tool.",
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
