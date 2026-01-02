import { GoogleGenAI } from "@google/genai";
import { Coordinates, Place, SearchFilters, GroundingChunk } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const findRestaurants = async (
  coords: Coordinates,
  filters: SearchFilters
): Promise<{ text: string; places: Place[] }> => {
  const modelId = "gemini-2.5-flash"; // Required for Maps Grounding

  // formatting instruction
  const prompt = `
    I am currently located at LATITUDE: ${coords.latitude}, LONGITUDE: ${coords.longitude}.
    
    Using the Google Maps tool, find 8 REAL restaurants strictly within ${filters.radius} meters of my location.
    
    CRITICAL INSTRUCTIONS:
    1. DO NOT return places from the USA, San Francisco, or Mountain View unless I am actually there.
    2. Verify the distance. If a place is > ${filters.radius} meters away, discard it.
    3. Filter by budget: ${filters.budget}.
    
    For each valid restaurant, provide the output in this EXACT format per line:
    PLACE_START|[Name]|[Estimated Walking Distance]|[Funny/Meme-style 1-sentence description]|PLACE_END

    Example:
    PLACE_START|Joe's Pizza|300m|Pizza so good it slaps harder than my mom.|PLACE_END
    
    If no places are found within the radius, return nothing.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: coords.latitude,
              longitude: coords.longitude,
            },
          },
        },
      },
    });

    const text = response.text || "";
    
    // Parse the text response to get metadata
    const parsedMetadata = new Map<string, { distance: string, description: string }>();
    const regex = /PLACE_START\|(.*?)\|(.*?)\|(.*?)\|PLACE_END/g;
    let match;
    
    while ((match = regex.exec(text)) !== null) {
        const name = match[1].trim();
        const distance = match[2].trim();
        const description = match[3].trim();
        // Create a normalized key (lowercase, simple) for matching
        parsedMetadata.set(name.toLowerCase(), { distance, description });
    }

    // Extract places from grounding metadata
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] || [];
    
    const places: Place[] = [];
    
    // We filter specifically for MAPS chunks
    chunks.forEach((chunk) => {
      if (chunk.maps) {
        const title = chunk.maps.title;
        // Try to find matching metadata from the text response
        // We use loose matching because Maps title might differ slightly from Text title
        let metadata = parsedMetadata.get(title.toLowerCase());
        
        if (!metadata) {
            // Fallback fuzzy match
            for (const [key, val] of parsedMetadata.entries()) {
                if (title.toLowerCase().includes(key) || key.includes(title.toLowerCase())) {
                    metadata = val;
                    break;
                }
            }
        }

        // Avoid duplicates
        if (!places.find(p => p.title === title)) {
            places.push({
                title: title,
                uri: chunk.maps.uri,
                distance: metadata?.distance || "Nearby",
                description: metadata?.description || "Food so good, no cap.",
            });
        }
      }
    });

    return { text, places };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};