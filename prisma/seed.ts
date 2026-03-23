import * as dotenv from "dotenv";
dotenv.config();
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

// Prisma 7: PrismaLibSql es factory — pasar config directamente
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adapter = new PrismaLibSql({
  url: process.env.TURSO_DATABASE_URL ?? "file:./dev.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
// eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log("🌱 Seeding database...");

  const org = await prisma.organization.upsert({
    where: { slug: "mi-empresa" },
    update: {},
    create: {
      id: "seed-org-id",
      name: "Mi Empresa",
      slug: "mi-empresa",
    },
  });
  console.log(`✅ Organization: ${org.name} (${org.id})`);

  const user = await prisma.user.upsert({
    where: { email: "admin@miempresa.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@miempresa.com",
      organizationId: org.id,
    },
  });
  console.log(`✅ User: ${user.email}`);

  const supplierData = [
    {
      name: "Impretienda",
      email: "info@impretienda.com",
      slug: "impretienda",
      phone: "+34 900 000 001",
      address: "España",
      website: "https://impretienda.com",
      description: "Perfil SEG 19mm para pared (sin retroiluminación). Sin MOQ. Entrega 24/48h. Proveedor preferido para lanzamiento.",
      isPreferred: true,
      products: [
        { name: "Perfil SEG 19mm – Joy (4ml)", unit: "set", basePrice: 41.60, currency: "EUR", leadTimeDays: 2, category: "BOM" },
        { name: "Perfil SEG 19mm – Abundant (5ml)", unit: "set", basePrice: 52.00, currency: "EUR", leadTimeDays: 2, category: "BOM" },
        { name: "Perfil SEG 19mm – Nova (7ml)", unit: "set", basePrice: 72.80, currency: "EUR", leadTimeDays: 2, category: "BOM" },
        { name: "Perfil SEG 19mm – Luna (8ml)", unit: "set", basePrice: 83.20, currency: "EUR", leadTimeDays: 2, category: "BOM" },
      ],
    },
    {
      name: "MESCO Steel HK",
      email: "sales@mescosteel.com",
      slug: "mesco-steel",
      phone: "+86 755 0000001",
      address: "Hong Kong / China (EXW)",
      description: "Marco aluminio SEG completo. MOQ 40 ud/talla. 10× más barato que España pero requiere logística de importación.",
      isPreferred: false,
      products: [
        { name: "Marco SEG aluminio – Brilliant", unit: "set", basePrice: 2.76, currency: "USD", leadTimeDays: 20, category: "BOM" },
        { name: "Marco SEG aluminio – Joy", unit: "set", basePrice: 4.60, currency: "USD", leadTimeDays: 20, category: "BOM" },
        { name: "Marco SEG aluminio – Abundant", unit: "set", basePrice: 5.52, currency: "USD", leadTimeDays: 20, category: "BOM" },
        { name: "Marco SEG aluminio – Nova", unit: "set", basePrice: 7.36, currency: "USD", leadTimeDays: 20, category: "BOM" },
        { name: "Marco SEG aluminio – Luna", unit: "set", basePrice: 9.20, currency: "USD", leadTimeDays: 20, category: "BOM" },
        { name: "Marco SEG aluminio – Gea", unit: "set", basePrice: 11.96, currency: "USD", leadTimeDays: 20, category: "BOM" },
      ],
    },
    {
      name: "Zetar Industry (Wendy)",
      email: "wendy@zetarindustry.com",
      slug: "zetar-industry",
      phone: "+86 139 0000001",
      address: "China (EXW)",
      description: "Tablero MDF perforado + imanes N52 + acrílico + VHB 3M. Proveedor clave para ALIGN. MOQ 500 tableros.",
      isPreferred: false,
      products: [
        { name: "Tablero MDF perforado 780×390mm", unit: "ud", basePrice: 4.70, currency: "USD", leadTimeDays: 35, category: "BOM" },
        { name: "Imán N52 D5×2mm", unit: "ud", basePrice: 0.06, currency: "USD", leadTimeDays: 35, category: "BOM" },
        { name: "Imán N52 D5×6mm", unit: "ud", basePrice: 0.098, currency: "USD", leadTimeDays: 35, category: "BOM" },
        { name: "Adhesivo 3M VHB por panel", unit: "ud", basePrice: 0.64, currency: "EUR", leadTimeDays: 35, category: "BOM" },
      ],
    },
    {
      name: "Kamy Kung (GUNGI)",
      email: "kamykung@gungi.com",
      slug: "kamy-kung",
      phone: "+86 138 0000002",
      address: "China (EXW)",
      description: "Heartframe MDF 8×8cm + 9 imanes D5×12mm + VHB + laser engraving. MOQ 1000 ud.",
      isPreferred: false,
      products: [
        { name: "Heartframe MDF 8×8cm completo", unit: "ud", basePrice: 3.58, currency: "USD", leadTimeDays: 15, category: "BOM" },
      ],
    },
    {
      name: "Terrence Metal (Ningbo)",
      email: "terrence@ningbometal.com",
      slug: "terrence-metal",
      phone: "+86 574 0000001",
      address: "Ningbo, China (CIF Málaga)",
      description: "Accesorios metálicos: Wing, Nest, Craw, Pins. Chapa 1.2mm negro polvo + trasera acrílico. MOQ 50 ud/pieza.",
      isPreferred: false,
      products: [
        { name: "The Wing (metal + acrílico + 45 imanes)", unit: "ud", basePrice: 2.80, currency: "USD", leadTimeDays: 45, category: "BOM" },
        { name: "The Nest L21H (metal + acrílico + 21 imanes)", unit: "ud", basePrice: 4.14, currency: "USD", leadTimeDays: 45, category: "BOM" },
        { name: "The Craw L21H (metal + acrílico + 21 imanes)", unit: "ud", basePrice: 1.07, currency: "USD", leadTimeDays: 45, category: "BOM" },
        { name: "The Pins L9 (metal + acrílico + 1 imán)", unit: "ud", basePrice: 0.84, currency: "USD", leadTimeDays: 45, category: "BOM" },
      ],
    },
    {
      name: "Changzhou Phoneto",
      email: "sales@phoneto.com",
      slug: "changzhou-phoneto",
      phone: "+86 519 0000001",
      address: "Changzhou, China (EXW)",
      description: "Tela SEG con impresión sublimación + cordón silicona 4mm cosido incluido. MOQ ~300 ud.",
      isPreferred: false,
      products: [
        { name: "Tela SEG impresa – Joy", unit: "ud", basePrice: 6.00, currency: "USD", leadTimeDays: 7, category: "BOM" },
        { name: "Tela SEG impresa – Abundant", unit: "ud", basePrice: 9.90, currency: "USD", leadTimeDays: 7, category: "BOM" },
      ],
    },
    {
      name: "Dongguan Xingfenglin",
      email: "sales@xingfenglin.com",
      slug: "xingfenglin",
      phone: "+86 769 0000001",
      address: "Dongguan, China (EXW)",
      description: "Planchas acrílicas traseras para accesorios CNC ±0.1mm. Transparente/negro/espejo. MOQ 100 ud.",
      isPreferred: false,
      products: [
        { name: "Plancha acrílica CNC trasera accesorio", unit: "ud", basePrice: 0.60, currency: "USD", leadTimeDays: 25, category: "BOM" },
      ],
    },
    {
      name: "Shenzhen IDRFID",
      email: "sales@idrfid.com",
      slug: "idrfid",
      phone: "+86 755 0000002",
      address: "Shenzhen, China",
      description: "NFC Chip IDN7645 = NXP NTAG213 (144 bytes). Antena 76×45mm, 100k ciclos escritura. CE+RoHS. MOQ 1000/rollo.",
      isPreferred: false,
      products: [
        { name: "NFC IDN7645 NTAG213 (rollo 1000 ud)", unit: "rollo", basePrice: 0.12, currency: "USD", leadTimeDays: 10, category: "BOM" },
      ],
    },
    {
      name: "Yes Lab 82+",
      email: "info@yeslab.com",
      slug: "yes-lab",
      phone: "+49 000 0000001",
      address: "Alemania / Colombia",
      description: "Packaging: cajas kraft microcorrugado, insertos, fundas, esquineros con impresión 4 tintas. MOQ 500 ud/referencia.",
      isPreferred: false,
      products: [
        { name: "Caja kraft Phoenix Wall – Brilliant/Joy", unit: "ud", basePrice: 0.26, currency: "EUR", leadTimeDays: 30, category: "BOM" },
        { name: "Caja kraft Phoenix Wall – Abundant/Nova", unit: "ud", basePrice: 1.20, currency: "EUR", leadTimeDays: 30, category: "BOM" },
        { name: "Caja kraft Phoenix Wall – Luna/Gea", unit: "ud", basePrice: 3.61, currency: "EUR", leadTimeDays: 30, category: "BOM" },
      ],
    },
  ];

  for (const s of supplierData) {
    const { isPreferred, products, ...supplierFields } = s;
    const supplier = await prisma.supplier.upsert({
      where: { email: supplierFields.email },
      update: { ...supplierFields },
      create: {
        ...supplierFields,
        products: { create: products },
      },
      include: { products: true },
    });
    console.log(`✅ Supplier: ${supplier.name} (${supplier.products.length} productos)`);

    await prisma.organizationSupplier.upsert({
      where: { organizationId_supplierId: { organizationId: org.id, supplierId: supplier.id } },
      update: {},
      create: { organizationId: org.id, supplierId: supplier.id, isPreferred: isPreferred },
    });
  }
  console.log("✅ Todos los proveedores vinculados a la organización");

  console.log("\n🎉 Seed completado. OWNER_ORG_ID=seed-org-id");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
