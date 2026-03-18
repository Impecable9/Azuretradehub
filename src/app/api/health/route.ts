import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  const info: Record<string, unknown> = {
    env: {
      TURSO_DATABASE_URL: url ? `✓ (${url.slice(0, 25)}...)` : "✗ MISSING",
      TURSO_AUTH_TOKEN: authToken ? "✓ set" : "✗ MISSING",
    },
  };

  // Test 1: raw libsql
  try {
    const client = createClient({ url: url!, authToken });
    const result = await client.execute("SELECT COUNT(*) as n FROM Organization");
    info.rawLibsql = { status: "✓", rows: result.rows[0] };
  } catch (e) {
    info.rawLibsql = { status: "✗", error: String(e) };
  }

  // Test 2: Prisma creado aquí mismo (sin usar @/lib/db)
  try {
    const libsql = createClient({ url: url!, authToken });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const adapter = new PrismaLibSql(libsql as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prisma = new PrismaClient({ adapter } as any);
    const count = await prisma.organization.count();
    info.localPrisma = { status: "✓", count };
  } catch (e) {
    info.localPrisma = { status: "✗", error: String(e) };
  }

  // Test 3: via módulo @/lib/db
  try {
    const { prisma } = await import("@/lib/db");
    const count = await prisma.organization.count();
    info.modulePrisma = { status: "✓", count };
  } catch (e) {
    info.modulePrisma = { status: "✗", error: String(e) };
  }

  return NextResponse.json(info);
}
