import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

/**
 * Lazy-initialised client so that module-level side effects don't throw at
 * import-time when the env var is missing.
 */
let _genAI: GoogleGenerativeAI | null = null;
function getClient(): GoogleGenerativeAI {
  if (_genAI) return _genAI;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY environment variable is not set. " +
        "Please add it to your .env.local file. " +
        "See .env.example for the expected format."
    );
  }
  _genAI = new GoogleGenerativeAI(apiKey);
  return _genAI;
}

export function getModel(modelName = "gemini-2.5-flash") {
  return getClient().getGenerativeModel({ model: modelName });
}

/**
 * Generate a single text completion.
 *
 * The system prompt is passed through Gemini's privileged `systemInstruction`
 * slot so it is isolated from user input — this improves prompt-injection
 * resistance compared to concatenating system + user into a single text part.
 */
export async function generateText(
  systemPrompt: string,
  userMessage: string,
  modelName = "gemini-2.5-flash"
): Promise<string> {
  const model = getModel(modelName);
  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: userMessage }] }],
    systemInstruction: { role: "user", parts: [{ text: systemPrompt }] },
  });
  return result.response.text();
}

/**
 * Streaming variant — token-by-token async generator.
 * Wired but unused in Phase 1 (the UI doesn't consume SSE yet).
 * Phase 2 can wire this to the adviser chat for real-time typing.
 */
export async function* generateStream(
  systemPrompt: string,
  userMessage: string,
  modelName = "gemini-2.5-flash"
): AsyncGenerator<string> {
  const model = getModel(modelName);
  const result = await model.generateContentStream({
    contents: [{ role: "user", parts: [{ text: userMessage }] }],
    systemInstruction: { role: "user", parts: [{ text: systemPrompt }] },
  });
  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) yield text;
  }
}

export default getClient;
