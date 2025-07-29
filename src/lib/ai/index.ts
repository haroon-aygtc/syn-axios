import { handleOpenRouter } from "./openrouter";
import { handleOpenAI } from "./openai";
import { handleClaude } from "./anthropic";
// ... other imports

type Provider = "openrouter" | "openai" | "claude" | "gemini" | "mistral";

export const callAIProvider = async (params: {
  provider: Provider;
  prompt: string;
  options?: Record<string, any>;
}) => {
  const { provider, prompt, options } = params;

  switch (provider) {
    case "openrouter":
      return handleOpenRouter(prompt, options);
    case "openai":
      return handleOpenAI(prompt, options);
    case "claude":
      return handleClaude(prompt, options);
    // add more
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
};
