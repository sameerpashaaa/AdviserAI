import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

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

// ── Exponential Backoff & Timeout Wrapper ───────────────────────────────────
async function withRetryAndTimeout<T>(
  fn: (signal?: AbortSignal) => Promise<T>,
  maxAttempts = 3,
  baseDelayMs = 1000,
  timeoutMs = 30000
): Promise<T> {
  let attempt = 0;
  while (attempt < maxAttempts) {
    attempt++;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const result = await fn(controller.signal);
      clearTimeout(timer);
      return result;
    } catch (error) {
      clearTimeout(timer);

      const errObj = error as Record<string, unknown>;
      const status = Number(errObj?.status || errObj?.statusCode || 0);
      const isTransient =
        status === 429 ||
        (status >= 500 && status < 600) ||
        String(errObj?.name || "") === "AbortError" ||
        String(errObj?.message || "").includes("timeout");

      if (!isTransient || attempt >= maxAttempts) {
        throw error;
      }

      const delay = baseDelayMs * Math.pow(2, attempt - 1) * (0.5 + Math.random());
      console.warn(
        `[Gemini API] Transient error (status ${status || "unknown"}). ` +
          `Retrying attempt ${attempt}/${maxAttempts} in ${Math.round(delay)}ms...`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error("API call failed after max retrying attempts.");
}

export interface GeminiUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface GeminiResponse {
  text: string;
  usage: GeminiUsage;
  model: string;
}

/**
 * Generate text and return token usage metadata. Supports model fallback.
 */
export async function generateTextWithMetadata(
  systemPrompt: string,
  userMessage: string,
  modelName = "gemini-2.5-flash"
): Promise<GeminiResponse> {
  const resolvedModel = modelName;
  try {
    const result = await withRetryAndTimeout(async (signal) => {
      const model = getModel(modelName);
      return await model.generateContent(
        {
          contents: [{ role: "user", parts: [{ text: userMessage }] }],
          systemInstruction: { role: "user", parts: [{ text: systemPrompt }] },
        },
        { signal }
      );
    });

    const metadata = result.response.usageMetadata;
    return {
      text: result.response.text(),
      usage: {
        promptTokens: metadata?.promptTokenCount ?? 0,
        completionTokens: metadata?.candidatesTokenCount ?? 0,
        totalTokens: metadata?.totalTokenCount ?? 0,
      },
      model: resolvedModel,
    };
  } catch (error) {
    if (modelName === "gemini-2.5-flash") {
      console.warn("[Gemini API] Primary model gemini-2.5-flash failed. Falling back to gemini-1.5-flash...");
      return generateTextWithMetadata(systemPrompt, userMessage, "gemini-1.5-flash");
    }
    throw error;
  }
}

/**
 * Generate a single text completion (backward compatible, returns string).
 */
export async function generateText(
  systemPrompt: string,
  userMessage: string,
  modelName = "gemini-2.5-flash"
): Promise<string> {
  const response = await generateTextWithMetadata(systemPrompt, userMessage, modelName);
  return response.text;
}

/**
 * Streaming variant — token-by-token async generator.
 * Emits text chunks as they arrive.
 */
export async function* generateStream(
  systemPrompt: string,
  userMessage: string,
  modelName = "gemini-2.5-flash"
): AsyncGenerator<{ token: string; usage?: GeminiUsage; model: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000); // connection start timeout

  const resolvedModel = modelName;

  try {
    const model = getModel(modelName);
    const result = await model.generateContentStream(
      {
        contents: [{ role: "user", parts: [{ text: userMessage }] }],
        systemInstruction: { role: "user", parts: [{ text: systemPrompt }] },
      },
      { signal: controller.signal }
    );

    clearTimeout(timer);

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        yield { token: text, model: resolvedModel };
      }
    }

    // After stream completes, try to retrieve usage metadata
    const response = await result.response;
    const metadata = response.usageMetadata;
    if (metadata) {
      yield {
        token: "",
        model: resolvedModel,
        usage: {
          promptTokens: metadata.promptTokenCount ?? 0,
          completionTokens: metadata.candidatesTokenCount ?? 0,
          totalTokens: metadata.totalTokenCount ?? 0,
        },
      };
    }
  } catch (error) {
    clearTimeout(timer);
    if (modelName === "gemini-2.5-flash") {
      console.warn(
        "[Gemini API] Primary model gemini-2.5-flash streaming failed. Falling back to gemini-1.5-flash..."
      );
      yield* generateStream(systemPrompt, userMessage, "gemini-1.5-flash");
    } else {
      throw error;
    }
  }
}

export default getClient;
