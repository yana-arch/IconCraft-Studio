import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function suggestIcons(theme: string): Promise<string[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Suggest a list of exactly 10 essential icon names for a "${theme}" theme. Return only a comma-separated list of lowercase icon names suitable for searching in an icon library (e.g. "home, settings, user").`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            icons: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of icon names"
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
