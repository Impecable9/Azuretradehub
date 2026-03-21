import { NextRequest, NextResponse } from "next/server";
import { requireApiKey } from "@/lib/api-auth";
import { prisma } from "@/lib/db";

const ORG_ID = process.env.OWNER_ORG_ID ?? "seed-org-id";

export async function GET(req: NextRequest) {
  if (!requireApiKey(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const quotes = await prisma.quote.findMany({
    where: { organizationId: ORG_ID },
    include: { lines: true, rfqs: { include: { responses: true } } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({ quotes });
}

export async function POST(req: NextRequest) {
  if (!requireApiKey(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, clientName, notes, lines } = body;

  if (!title) return NextResponse.json({ error: "title is required" }, { status: 400 });

  const quote = await prisma.quote.create({
    data: {
      organizationId: ORG_ID,
      title,
      clientName,
      notes,
      lines: lines ? {
        create: lines.map((l: { type: string; description: string; quantity: number; unit: string; unitCost?: number }) => ({
          type: l.type ?? "BOM",
          description: l.description,
          quantity: l.quantity,
          unit: l.unit,
          unitCost: l.unitCost,
          totalCost: l.unitCost ? l.unitCost * l.quantity : null,
        })),
      } : undefined,
    },
    include: { lines: true },
  });

  return NextResponse.json({ quote }, { status: 201 });
}
