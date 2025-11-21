import { GoogleGenAI } from "@google/genai";

// Note: API Key must be in environment variables.
// In a real app, this call would likely happen on the backend (Node.js) to protect the key,
// but strictly following the "frontend" request, we include the structure here.

const apiKey = process.env.API_KEY || 'mock_key'; 
const ai = new GoogleGenAI({ apiKey });

export const summarizeComplaint = async (description: string): Promise<string> => {
  if (apiKey === 'mock_key') {
    return "AI Summary: This is a mock summary because no API key is configured. The user is complaining about infrastructure issues.";
  }

  try {
    const model = 'gemini-2.5-flash';
    const prompt = `Summarize this complaint into one concise sentence for a dashboard view. Complaint: "${description}"`;
    
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "No summary available.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating summary.";
  }
};
