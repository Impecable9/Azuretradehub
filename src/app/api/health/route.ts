import { NextResponse } from "next/server";

export async function GET() {
  const info: Record<string, unknown> = {
    env: {
      TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL ? "✓ set" : "✗ missing",
      TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN ? "✓ set" : "✗ missing",
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ? "✓ set" : "✗ missing",
      OWNER_ORG_ID: process.env.OWNER_ORG_ID ?? "missing",
    },
  };

  try {
    const { prisma } = await import("@/lib/db");
    const count = await prisma.organization.count();
    info.db = { status: "✓ connected", organizations: count };
  } catch (e) {
    info.db = { status: "✗ error", message: String(e) };
  }

  return NextResponse.json(info, { status: 200 });
}
