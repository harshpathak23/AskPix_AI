import { GoogleGenerativeAI } from "@google/generative-ai";

// API Key from environment (.env)
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function generateContentGemini(input: any) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const result = await model.generateContent(input);

      return result;
      }