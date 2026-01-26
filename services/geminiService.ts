
import { GoogleGenAI } from "@google/genai";

export const geminiService = {
  async generateNotice(topic: string) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Draft a formal school notice for teachers at "A/Nikawewa Muslim Vidyalaya" about: ${topic}. 
        The tone should be professional and include a heading, body, and sign-off.`,
      });
      return response.text;
    } catch (error) {
      console.error("Gemini Rpc Error:", error);
      return null;
    }
  },

  async summarizeLeaveReport(leaves: any[]) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const context = JSON.stringify(leaves);
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze this list of teacher leave requests for A/Nikawewa Muslim Vidyalaya and provide a 3-sentence summary of trends or concerns: ${context}`,
      });
      return response.text;
    } catch (error) {
      console.error("Gemini Rpc Error:", error);
      return "AI analysis is temporarily unavailable due to a service error.";
    }
  }
};
