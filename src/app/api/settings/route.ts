import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { encrypt, decrypt } from "@/lib/crypto";

const ORG_ID = process.env.OWNER_ORG_ID ?? "seed-org-id";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const settings = await prisma.organizationSettings.findUnique({
    where: { organizationId: ORG_ID },
  });

  return NextResponse.json({
    hasApiKey: !!settings?.encryptedApiKey,
    // Nunca devolvemos la key, solo si existe
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { apiKey } = await req.json();

  if (!apiKey || typeof apiKey !== "string" || !apiKey.startsWith("sk-ant-")) {
    return NextResponse.json({ error: "API key inválida (debe empezar por sk-ant-)" }, { status: 400 });
  }

  const encryptedApiKey = encrypt(apiKey);

  await prisma.organizationSettings.upsert({
    where: { organizationId: ORG_ID },
    update: { encryptedApiKey, updatedAt: new Date() },
    create: { organizationId: ORG_ID, encryptedApiKey, updatedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.organizationSettings.updateMany({
    where: { organizationId: ORG_ID },
    data: { encryptedApiKey: null },
  });

  return NextResponse.json({ ok: true });
}

// Exportar función para uso interno del agente
export async function getOrgApiKey(orgId: string): Promise<string | null> {
  const settings = await prisma.organizationSettings.findUnique({
    where: { organizationId: orgId },
  });
  if (!settings?.encryptedApiKey) return null;
  try {
    return decrypt(settings.encryptedApiKey);
  } catch {
    return null;
  }
}
