import { NextRequest, NextResponse } from "next/server";
import { requireApiKey } from "@/lib/api-auth";
import { prisma } from "@/lib/db";

// GET — obtener toda la memoria compartida
export async function GET(req: NextRequest) {
  if (!requireApiKey(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const memories = await prisma.sharedMemory.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ memories });
}

// POST — guardar o actualizar un recuerdo
export async function POST(req: NextRequest) {
  if (!requireApiKey(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { key, content, source } = await req.json();
  if (!key || !content) return NextResponse.json({ error: "key and content are required" }, { status: 400 });

  const memory = await prisma.sharedMemory.upsert({
    where: { key },
    update: { content, source: source ?? "manual", updatedAt: new Date() },
    create: { key, content, source: source ?? "manual", updatedAt: new Date() },
  });

  return NextResponse.json({ memory });
}

// DELETE — eliminar un recuerdo por key
export async function DELETE(req: NextRequest) {
  if (!requireApiKey(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { key } = await req.json();
  if (!key) return NextResponse.json({ error: "key is required" }, { status: 400 });

  await prisma.sharedMemory.deleteMany({ where: { key } });
  return NextResponse.json({ ok: true });
}
