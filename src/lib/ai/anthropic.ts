// src/ai/providers/anthropic.ts
import { AIProvider, ChatRequest, StreamChunk } from "./types.js";
import { Anthropic } from "@anthropic-ai/sdk";
import { env } from "../../env.js";

export class AnthropicProvider implements AIProvider {
  name = "anthropic";
  private client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

  async *chatStream(req: ChatRequest): AsyncIterable<StreamChunk> {
    if (!env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY missing");

    const stream = await this.client.messages.create({
      model: req.model, // e.g. "claude-3-5-sonnet-latest"
      max_tokens: req.max_tokens ?? 4096,
      temperature: req.temperature ?? 0.2,
      messages: req.messages.map((m) => ({ role: m.role, content: m.content })),
      stream: true,
    });

    for await (const evt of stream) {
      if (
        evt.type === "content_block_delta" &&
        "delta" in evt &&
        "text" in evt.delta
      ) {
        yield { content: evt.delta.text as string };
      }
    }
    yield { content: "", done: true };
  }
}
