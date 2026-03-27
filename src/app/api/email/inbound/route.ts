import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Webhook secret para verificar que viene de Cloudflare Worker o Resend
const WEBHOOK_SECRET = process.env.EMAIL_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  // Verificar secret si está configurado
  if (WEBHOOK_SECRET) {
    const secret = req.headers.get("x-webhook-secret");
    if (secret !== WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const body = await req.json();

    const { from, to, subject, bodyText, bodyHtml } = body;

    if (!from || !to || !subject) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await prisma.emailLog.create({
      data: {
        direction: "received",
        from,
        to,
        subject,
        bodyText: bodyText ?? null,
        bodyHtml: bodyHtml ?? null,
        status: "ok",
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Inbound email error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
