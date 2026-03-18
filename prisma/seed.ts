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

  const supplier = await prisma.supplier.upsert({
    where: { email: "proveedor@ejemplo.com" },
    update: {},
    create: {
      name: "Maderas García S.L.",
      email: "proveedor@ejemplo.com",
      slug: "maderas-garcia",
      phone: "+34 600 000 001",
      description: "Proveedor de tableros y madera para construcción e industria",
      products: {
        create: [
          { name: "MDF 19mm", description: "Tablero MDF crudo de 19mm, formato 2440x1220mm", unit: "m²", basePrice: 18.5, leadTimeDays: 3, category: "BOM" },
          { name: "Melamina blanca 16mm", description: "Tablero melamina blanca doble cara 16mm", unit: "m²", basePrice: 22.0, leadTimeDays: 2, category: "BOM" },
          { name: "Contrachapado marino 18mm", description: "Contrachapado marino de alta calidad", unit: "m²", basePrice: 35.0, leadTimeDays: 5, category: "BOM" },
        ],
      },
    },
    include: { products: true },
  });
  console.log(`✅ Supplier: ${supplier.name} con ${supplier.products.length} productos`);

  await prisma.organizationSupplier.upsert({
    where: { organizationId_supplierId: { organizationId: org.id, supplierId: supplier.id } },
    update: {},
    create: { organizationId: org.id, supplierId: supplier.id, isPreferred: true },
  });
  console.log("✅ Supplier vinculado a la organización");

  console.log("\n🎉 Seed completado. OWNER_ORG_ID=seed-org-id");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
