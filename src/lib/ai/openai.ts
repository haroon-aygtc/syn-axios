// src/ai/providers/openai.ts
import { AIProvider, ChatRequest, StreamChunk } from "./types.js";
import OpenAI from "openai";
import { env } from "../../env.js";

export class OpenAIProvider implements AIProvider {
  name = "openai";
  private client = new OpenAI({ apiKey: env.OPENAI_API_KEY });

  async *chatStream(req: ChatRequest): AsyncIterable<StreamChunk> {
    if (!env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY missing");

    const stream = await this.client.chat.completions.create({
      model: req.model, // e.g. "gpt-4o-mini", "gpt-4.1-mini"
      messages: req.messages,
      temperature: req.temperature ?? 0.2,
      top_p: req.top_p,
      max_tokens: req.max_tokens,
      stream: true,
    });

    for await (const part of stream) {
      const delta = part.choices?.[0]?.delta?.content ?? "";
      if (delta) yield { content: delta };
    }

    yield { content: "", done: true };
  }
}
