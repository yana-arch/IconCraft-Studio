import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function suggestIcons(theme: string): Promise<string[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are an expert UI/UX icon designer. Suggest 12 essential icon names for an app with a "${theme}" theme.
      
      Requirements:
      - Include a mix of primary actions, navigation items, and thematic metaphors.
      - Use standard noun-based names that exist in major icon libraries (Lucide, Material, Phosphor).
      - Ensure the icons are stylistically cohesive for the given theme.
      
      Return only a JSON object with an "icons" array of lowercase strings.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            icons: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Array of exactly 12 standard icon names"
            }
          },
          required: ["icons"]
        }
      }
    });

    const data = JSON.parse(response.text);
    return data.icons || [];
  } catch (error) {
    console.error("Failed to suggest icons:", error);
    return [];
  }
}
