export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/crypto";
import { streamAgentResponse, extractQuoteFromResponse } from "@/lib/agent";
import { buildSystemPrompt } from "@/lib/agent/system-prompt";
import { z } from "zod";

const schema = z.object({
  conversationId: z.string().optional(),
  message: z.string().min(1),
  organizationId: z.string(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = schema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { conversationId, message, organizationId } = body.data;

  // Obtener API key del usuario si tiene configurada
  let userApiKey: string | undefined;
  try {
    const settings = await prisma.organizationSettings.findUnique({ where: { organizationId } });
    if (settings?.encryptedApiKey) userApiKey = decrypt(settings.encryptedApiKey);
  } catch { /* usa key de plataforma */ }

  // Load or create conversation
  let conversation;
  if (conversationId) {
    conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
  }

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { organizationId, title: message.slice(0, 60) },
      include: { messages: true },
    });
  }

  // Save user message
  await prisma.message.create({
    data: { conversationId: conversation.id, role: "user", content: message },
  });

  // Load supplier catalog + shared memory for system prompt
  const [suppliers, memories] = await Promise.all([
    prisma.supplier.findMany({ include: { products: true } }),
    prisma.sharedMemory.findMany({ orderBy: { updatedAt: "desc" } }),
  ]);

  const catalogText = suppliers.length === 0
    ? "No hay proveedores registrados aún. Indica al usuario que añada proveedores en el panel de gestión."
    : suppliers
        .map((s) => {
          const products = s.products
            .map((p) => `  - ${p.name} (${p.category}): ${p.basePrice ? `${p.basePrice}€/${p.unit}` : "precio a consultar"}, plazo: ${p.leadTimeDays ?? "?"}d`)
            .join("\n");
          return `Proveedor: ${s.name} (${s.email})\nID: ${s.id}\nProductos:\n${products || "  Sin productos registrados"}`;
        })
        .join("\n\n");

  const memoryText = memories.length > 0
    ? memories.map(m => `[${m.key}]: ${m.content}`).join("\n\n")
    : undefined;

  const systemPrompt = buildSystemPrompt(catalogText, memoryText);

  const history = conversation.messages.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  // Stream response
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let fullResponse = "";

      try {
        await streamAgentResponse(
          [...history, { role: "user", content: message }],
          systemPrompt,
          (chunk) => {
            fullResponse += chunk;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`));
          },
          userApiKey
        );

        // Save assistant message
        await prisma.message.create({
          data: {
            conversationId: conversation.id,
            role: "assistant",
            content: fullResponse,
          },
        });

        // Extract quote if present
        const quote = extractQuoteFromResponse(fullResponse);
        if (quote) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ quote, conversationId: conversation.id })}\n\n`)
          );
        }

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ done: true, conversationId: conversation.id })}\n\n`)
        );
      } catch (err) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: "Error del agente" })}\n\n`)
        );
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
