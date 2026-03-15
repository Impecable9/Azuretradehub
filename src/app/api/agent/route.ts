import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { streamAgentResponse, extractQuoteFromResponse } from "@/lib/agent";
import { buildSystemPrompt } from "@/lib/agent/system-prompt";
import { z } from "zod";

const schema = z.object({
  conversationId: z.string().optional(),
  message: z.string().min(1),
  organizationId: z.string(),
});

export async function POST(req: NextRequest) {
  const body = schema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { conversationId, message, organizationId } = body.data;

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

  // Load supplier catalog for system prompt
  const suppliers = await prisma.supplier.findMany({
    include: { products: true },
  });

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

  const systemPrompt = buildSystemPrompt(catalogText);

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
          }
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
