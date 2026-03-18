import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";

export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  const info: Record<string, unknown> = {
    env: {
      TURSO_DATABASE_URL: url ? `✓ set (${url.slice(0, 25)}...)` : "✗ MISSING",
      TURSO_AUTH_TOKEN: authToken ? "✓ set" : "✗ MISSING",
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ? "✓ set" : "✗ missing",
      OWNER_ORG_ID: process.env.OWNER_ORG_ID ?? "missing",
    },
  };

  // Test 1: raw libsql (sin Prisma)
  try {
    const client = createClient({ url: url!, authToken });
    const result = await client.execute("SELECT COUNT(*) as n FROM Organization");
    info.rawLibsql = { status: "✓ ok", count: result.rows[0] };
  } catch (e) {
    info.rawLibsql = { status: "✗ error", message: String(e) };
  }

  // Test 2: via Prisma
  try {
    const { prisma } = await import("@/lib/db");
    const count = await prisma.organization.count();
    info.prisma = { status: "✓ ok", organizations: count };
  } catch (e) {
    info.prisma = { status: "✗ error", message: String(e) };
  }

  return NextResponse.json(info, { status: 200 });
}
