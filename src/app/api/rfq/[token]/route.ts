import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { nanoid } from "nanoid";

const responseSchema = z.object({
  items: z.array(
    z.object({
      description: z.string(),
      quantity: z.number(),
      unit: z.string(),
      type: z.enum(["BOM", "BOS"]),
      unitPrice: z.number().min(0),
      leadTimeDays: z.number().min(1),
      notes: z.string().optional(),
    })
  ),
  totalPrice: z.number().min(0),
  supplierName: z.string().min(1),
  supplierEmail: z.string().email(),
  supplierPhone: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const rfq = await prisma.rFQ.findUnique({
    where: { token },
    include: { quote: { include: { organization: true } } },
  });
  if (!rfq) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(rfq);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const rfq = await prisma.rFQ.findUnique({
    where: { token },
    include: { responses: true },
  });

  if (!rfq) return NextResponse.json({ error: "RFQ no encontrado" }, { status: 404 });
  if (rfq.expiresAt < new Date()) return NextResponse.json({ error: "RFQ vencido" }, { status: 410 });
  if (rfq.responses.length > 0) return NextResponse.json({ error: "Ya respondiste esta solicitud" }, { status: 409 });

  const body = responseSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Datos inválidos", details: body.error.flatten() }, { status: 400 });
  }

  const { items, totalPrice, supplierName, supplierEmail, supplierPhone, notes } = body.data;

  // Upsert supplier — create profile automatically
  const slug = supplierEmail
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    + "-" + nanoid(4);

  let supplier = await prisma.supplier.findUnique({ where: { email: supplierEmail } });

  if (!supplier) {
    supplier = await prisma.supplier.create({
      data: {
        name: supplierName,
        email: supplierEmail,
        slug,
        phone: supplierPhone,
      },
    });
  }

  // Save response
  await prisma.rFQResponse.create({
    data: {
      rfqId: rfq.id,
      supplierId: supplier.id,
      items: JSON.stringify(items),
      notes,
      totalPrice,
      supplierName,
      supplierEmail,
      supplierPhone,
    },
  });

  // Mark RFQ as responded
  await prisma.rFQ.update({
    where: { id: rfq.id },
    data: { status: "responded" },
  });

  return NextResponse.json({ success: true, supplierSlug: supplier.slug });
}
