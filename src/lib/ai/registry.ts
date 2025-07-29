// src/ai/registry.ts
import { AIProvider, ChatRequest, StreamChunk } from "./providers/types.js";
import { OpenRouterProvider } from "./providers/openrouter.js";
import { OpenAIProvider } from "./providers/openai.js";
import { AnthropicProvider } from "./providers/anthropic.js";
import { GeminiProvider } from "./providers/gemini.js";
import pRetry from "p-retry";

const providers: Record<string, AIProvider> = {
  openrouter: new OpenRouterProvider(),
  openai: new OpenAIProvider(),
  anthropic: new AnthropicProvider(),
  gemini: new GeminiProvider(),
};

export type ProviderName = keyof typeof providers;

export function getProvider(name: ProviderName): AIProvider {
  const p = providers[name];
  if (!p) throw new Error(`Unknown provider: ${name}`);
  return p;
}

// Fallback chain by priority (customize per agent/task)
export async function* withFallback(
  chain: ProviderName[],
  req: ChatRequest,
): AsyncIterable<StreamChunk> {
  let lastError: unknown;
  for (const name of chain) {
    try {
      // retry transient errors per provider
      const stream = await pRetry(
        async function* () {
          const provider = getProvider(name);
          for await (const chunk of provider.chatStream(req)) yield chunk;
        } as any,
        {
          retries: 2,
          onFailedAttempt: (e) => {
            // log e, increment metrics, etc.
          },
        },
      );

      // pRetry wraps the iterable; just yield what comes
      for await (const chunk of stream as AsyncIterable<StreamChunk>)
        yield chunk;
      return;
    } catch (e) {
      lastError = e;
      // continue to next provider
    }
  }
  throw lastError ?? new Error("All providers failed");
}
