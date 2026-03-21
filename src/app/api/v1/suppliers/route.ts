import { NextRequest, NextResponse } from "next/server";
import { requireApiKey } from "@/lib/api-auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  if (!requireApiKey(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const suppliers = await prisma.supplier.findMany({
    include: { products: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ suppliers });
}

export async function POST(req: NextRequest) {
  if (!requireApiKey(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, email, phone, website, description } = await req.json();
  if (!name || !email) return NextResponse.json({ error: "name and email are required" }, { status: 400 });

  const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const supplier = await prisma.supplier.upsert({
    where: { email },
    update: { name, phone, website, description },
    create: { name, email, slug, phone, website, description },
  });

  return NextResponse.json({ supplier }, { status: 201 });
}
