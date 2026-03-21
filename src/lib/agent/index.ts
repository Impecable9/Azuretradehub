import Anthropic from "@anthropic-ai/sdk";
import type { ChatMessage } from "@/types";

export async function streamAgentResponse(
  messages: ChatMessage[],
  systemPrompt: string,
  onChunk: (text: string) => void,
  apiKey?: string // clave del usuario si tiene configurada
): Promise<string> {
  const client = new Anthropic({ apiKey: apiKey ?? process.env.ANTHROPIC_API_KEY });
  let fullResponse = "";

  const stream = await client.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: systemPrompt,
    messages: messages.map((m) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.content,
    })),
  });

  for await (const chunk of stream) {
    if (
      chunk.type === "content_block_delta" &&
      chunk.delta.type === "text_delta"
    ) {
      onChunk(chunk.delta.text);
      fullResponse += chunk.delta.text;
    }
  }

  return fullResponse;
}

export function extractQuoteFromResponse(response: string): object | null {
  const match = response.match(/<quote>([\s\S]*?)<\/quote>/);
  if (!match) return null;
  try {
    return JSON.parse(match[1].trim());
  } catch {
    return null;
  }
}
