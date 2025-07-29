// src/ai/providers/gemini.ts
import { AIProvider, ChatRequest, StreamChunk } from "./types.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../../env.js";

export class GeminiProvider implements AIProvider {
  name = "gemini";
  private client = new GoogleGenerativeAI(env.GEMINI_API_KEY!);

  async *chatStream(req: ChatRequest): AsyncIterable<StreamChunk> {
    if (!env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY missing");

    const model = this.client.getGenerativeModel({ model: req.model }); // e.g. "gemini-1.5-pro"
    const stream = await model.generateContentStream({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: req.messages
                .map((m) => `${m.role}: ${m.content}`)
                .join("\n"),
            },
          ],
        },
      ],
      generationConfig: {
        temperature: req.temperature ?? 0.2,
        maxOutputTokens: req.max_tokens,
      },
    });

    for await (const chunk of stream.stream) {
      const text = chunk?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      if (text) yield { content: text };
    }
    yield { content: "", done: true };
  }
}
