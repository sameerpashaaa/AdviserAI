import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);

export function getModel(modelName = "gemini-2.5-flash") {
  return genAI.getGenerativeModel({ model: modelName });
}

export async function generateText(
  systemPrompt: string,
  userMessage: string,
  modelName = "gemini-2.5-flash"
): Promise<string> {
  const model = getModel(modelName);
  const result = await model.generateContent([
    { text: systemPrompt + "\n\nUser: " + userMessage },
  ]);
  return result.response.text();
}

export async function* generateStream(
  systemPrompt: string,
  userMessage: string,
  modelName = "gemini-2.5-flash"
): AsyncGenerator<string> {
  const model = getModel(modelName);
  const result = await model.generateContentStream([
    { text: systemPrompt + "\n\nUser: " + userMessage },
  ]);
  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) yield text;
  }
}

export default genAI;
