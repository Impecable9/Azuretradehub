import * as dotenv from "dotenv";
dotenv.config();

import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

function cuid() {
  return "c" + Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
}

async function main() {
  console.log("🌱 Seeding Turso...");

  // Organization
  await client.execute({
    sql: `INSERT OR IGNORE INTO Organization (id, name, slug, createdAt) VALUES (?, ?, ?, ?)`,
    args: ["seed-org-id", "Mi Empresa", "mi-empresa", new Date().toISOString()],
  });
  console.log("✅ Organization creada");

  // User
  await client.execute({
    sql: `INSERT OR IGNORE INTO User (id, email, name, organizationId, createdAt) VALUES (?, ?, ?, ?, ?)`,
    args: [cuid(), "admin@miempresa.com", "Admin", "seed-org-id", new Date().toISOString()],
  });
  console.log("✅ User creado");

  // Supplier
  const supplierId = cuid();
  await client.execute({
    sql: `INSERT OR IGNORE INTO Supplier (id, name, email, slug, phone, description, isVerified, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      supplierId,
      "Maderas García S.L.",
      "proveedor@ejemplo.com",
      "maderas-garcia",
      "+34 600 000 001",
      "Proveedor de tableros y madera para construcción e industria",
      0,
      new Date().toISOString(),
    ],
  });

  // Products
  const products = [
    { name: "MDF 19mm", desc: "Tablero MDF crudo 19mm, formato 2440x1220mm", unit: "m²", price: 18.5, days: 3 },
    { name: "Melamina blanca 16mm", desc: "Tablero melamina blanca doble cara 16mm", unit: "m²", price: 22.0, days: 2 },
    { name: "Contrachapado marino 18mm", desc: "Contrachapado marino de alta calidad", unit: "m²", price: 35.0, days: 5 },
  ];

  for (const p of products) {
    await client.execute({
      sql: `INSERT OR IGNORE INTO SupplierProduct (id, supplierId, name, description, unit, basePrice, currency, leadTimeDays, category, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [cuid(), supplierId, p.name, p.desc, p.unit, p.price, "EUR", p.days, "BOM", new Date().toISOString()],
    });
  }
  console.log("✅ Supplier + 3 productos creados");

  // OrganizationSupplier link
  await client.execute({
    sql: `INSERT OR IGNORE INTO OrganizationSupplier (organizationId, supplierId, isPreferred, createdAt) VALUES (?, ?, ?, ?)`,
    args: ["seed-org-id", supplierId, 1, new Date().toISOString()],
  });
  console.log("✅ Supplier vinculado a la organización");

  console.log("\n🎉 Seed completado en Turso");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => client.close());
