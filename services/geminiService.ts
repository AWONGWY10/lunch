import { GoogleGenAI } from "@google/genai";
import { Coordinates, Place, SearchFilters, GroundingChunk } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
  const modelId = "gemini-2.5-flash";

  // Using a very aggressive prompt to prevent USA/SF hallucinations
  const prompt = `
    CURRENT USER COORDINATES: Latitude ${coords.latitude}, Longitude ${coords.longitude}.
    SEARCH RADIUS: ${filters.radius} meters.
    TARGET BUDGET: ${filters.budget}.
    
    CRITICAL LOCALITY GUARD:
    - You are currently searching EXCLUSIVELY near the coordinates provided above.
    - DO NOT return "San Francisco", "Mountain View", or "Palo Alto" unless the coordinates are actually there.
    - If the tool returns results from a different country or city than the user's coordinates, DISCARD THEM.
    - Focus on results within walking distance (${filters.radius}m).
    
    OUTPUT SCHEMA:
    For every valid local restaurant, write exactly one line in this format:
    PLACE_METADATA|[Name]|[Distance in Meters]|[1-sentence Brainrot/Gen-Z Review]|END_METADATA
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: "You are a hyper-local food scout. You use Google Maps to find restaurants strictly within the user's walking radius. You avoid hallucinations of distant cities. Your tone is funny, Gen-Z, and meme-heavy.",
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

    const text = safeString(response.text);
    const parsedMetadata = new Map<string, { distance: string, description: string }>();
    
    // Parse the custom metadata lines
    const metaRegex = /PLACE_METADATA\|(.*?)\|(.*?)\|(.*?)\|END_METADATA/g;
    let match;
    while ((match = metaRegex.exec(text)) !== null) {
        parsedMetadata.set(match[1].trim().toLowerCase(), { 
            distance: match[2].trim(), 
            description: match[3].trim() 
        });
    }

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] || [];
    const places: Place[] = [];
    
    chunks.forEach((chunk) => {
      if (chunk.maps && chunk.maps.title) {
        const title = safeString(chunk.maps.title);
        const metadata = parsedMetadata.get(title.toLowerCase());
        
        // Prevent duplicates and ensure basic valid data
        if (!places.find(p => p.title === title)) {
            places.push({
                title: title,
                uri: chunk.maps.uri,
                distance: metadata?.distance ? safeString(metadata.distance) : "Nearby",
                description: metadata?.description ? safeString(metadata.description) : "Lowkey bussing, no cap.",
            });
        }
      }
    });

    return { text, places };
  } catch (error: any) {
    console.error("Gemini Search Error:", error);
    // Return empty results instead of throwing to prevent UI crashes
    return { text: "", places: [] };
  }
};
