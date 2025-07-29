// src/ai/providers/openrouter.ts
import { AIProvider, ChatRequest, StreamChunk } from "./types.js";
import { env } from "../../env.js";
import { fetch } from "undici";

export class OpenRouterProvider implements AIProvider {
  name = "openrouter";

  private base = "https://openrouter.ai/api/v1";

  async *chatStream(req: ChatRequest): AsyncIterable<StreamChunk> {
    if (!env.OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY missing");

    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      req.timeoutMs ?? 60000,
    );

    try {
      const res = await fetch(`${this.base}/chat/completions`, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
          // Optional but good practice:
          "HTTP-Referer": env.APP_URL,
          "X-Title": "SynapseAI",
        },
        body: JSON.stringify({
          model: req.model, // e.g. "openai/gpt-4o-mini" or "anthropic/claude-3-5-sonnet"
          messages: req.messages,
          temperature: req.temperature ?? 0.2,
          top_p: req.top_p,
          max_tokens: req.max_tokens,
          stream: true,
        }),
      });

      if (!res.ok || !res.body) {
        const text = await res.text().catch(() => "");
        throw new Error(`OpenRouter HTTP ${res.status}: ${text}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (payload === "[DONE]") {
            yield { content: "", done: true };
            return;
          }
          try {
            const json = JSON.parse(payload);
            const delta = json.choices?.[0]?.delta?.content ?? "";
            if (delta) yield { content: String(delta) };
          } catch {
            // ignore malformed SSE lines
          }
        }
      }

      yield { content: "", done: true };
    } finally {
      clearTimeout(timeout);
    }
  }
}
