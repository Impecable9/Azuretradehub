import { NextRequest, NextResponse } from "next/server";
import { requireApiKey } from "@/lib/api-auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  if (!requireApiKey(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rfqs = await prisma.rFQ.findMany({
    include: { responses: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({ rfqs });
}
