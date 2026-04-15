import { GoogleGenAI, Type } from "@google/genai";
import { Program, ProgramType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function searchPrograms(country: string, type: ProgramType | 'all'): Promise<Program[]> {
  const typeQuery = type === 'all' ? "incubators, accelerators, and startup awards" : `${type}s`;
  
  // Step 1: Search for information using Google Search
  const searchPrompt = `Find a comprehensive list of at least 15-20 of the most prominent ${typeQuery} in ${country}. 
  It is important to find as many as possible, up to 20.
  For each program, find:
  - Name of the program
  - Type (incubator, accelerator, or award)
  - Vertical/Industry focus (e.g., food, life sciences, circularity, fintech, etc.)
  - Current/recent batch name and dates
  - 3-5 notable startups from previous batches
  - City where it's based
  - Website URL
  - LinkedIn profile URL
  - A brief description (max 2 sentences).
  
  Provide the information in a clear, structured text format.`;

  try {
    // Call 1: Search (No controlled generation)
    const searchResponse = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: searchPrompt }] }],
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const rawData = searchResponse.text;
    if (!rawData) {
      throw new Error("No search results found");
    }

    // Step 2: Format the raw data into JSON (Controlled generation, no search)
    const formatPrompt = `Convert the following information about startup programs into a JSON array. 
    Ensure all fields are present and correctly typed.
    
    Information:
    ${rawData}`;

    const formatResponse = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: formatPrompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              type: { type: Type.STRING, description: "One of: incubator, accelerator, award" },
              verticals: { type: Type.ARRAY, items: { type: Type.STRING } },
              batchName: { type: Type.STRING },
              dates: { type: Type.STRING },
              previousStartups: { type: Type.ARRAY, items: { type: Type.STRING } },
              city: { type: Type.STRING },
              website: { type: Type.STRING },
              linkedin: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ["name", "type", "verticals", "batchName", "city", "website", "linkedin", "description"]
          }
        }
      }
    });

    if (!formatResponse.text) {
      throw new Error("Failed to format data into JSON");
    }

    const programs = JSON.parse(formatResponse.text) as Program[];
    return programs;
  } catch (error) {
    console.error("Error searching programs:", error);
    throw error;
  }
}
