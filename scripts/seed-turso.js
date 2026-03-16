const { createClient } = require("@libsql/client");

const client = createClient({
  url: "libsql://azuretradehub-impecable9.aws-eu-west-1.turso.io",
  authToken:
    "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzM2MDc5NDEsImlkIjoiMDE5Y2YzNDMtNDgwMS03ZmM3LWFlN2ItOTQ5Zjg1ZjdkYjMzIiwicmlkIjoiNGViZjVkMDctOWU5NC00YTQyLWI1ZTQtNzIyMGUwOTIzZGU2In0.wxzki6s6kFZHMnjIzHPzeZUJdk5ZKohKmmXp7rTNfXIdBM8u5SfQo18pCGkjwl4MaUNl_Iv6MdWXqhY6rUF1Ag",
});

async function seed() {
  console.log("🌱 Seeding Turso...");

  // Org
  await client.execute({
    sql: `INSERT OR IGNORE INTO Organization (id, name, slug, createdAt) VALUES (?, ?, ?, ?)`,
    args: ["seed-org-id", "Mi Empresa", "mi-empresa", new Date().toISOString()],
  });
  console.log("✅ Organization creada");

  // User
  await client.execute({
    sql: `INSERT OR IGNORE INTO User (id, email, name, organizationId, createdAt) VALUES (?, ?, ?, ?, ?)`,
    args: ["seed-user-id", "admin@miempresa.com", "Admin", "seed-org-id", new Date().toISOString()],
  });
  console.log("✅ User creado");

  // Supplier
  await client.execute({
    sql: `INSERT OR IGNORE INTO Supplier (id, name, email, slug, phone, description, isVerified, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      "supplier-maderas-1",
      "Maderas García S.L.",
      "proveedor@ejemplo.com",
      "maderas-garcia",
      "+34 600 000 001",
      "Proveedor de tableros y madera para construcción e industria",
      0,
      new Date().toISOString(),
    ],
  });
  console.log("✅ Supplier creado");

  // Products
  const products = [
    ["prod-1", "supplier-maderas-1", "MDF 19mm", "Tablero MDF crudo 19mm", "m²", 18.5, 3, "BOM"],
    ["prod-2", "supplier-maderas-1", "Melamina blanca 16mm", "Tablero melamina blanca doble cara 16mm", "m²", 22.0, 2, "BOM"],
    ["prod-3", "supplier-maderas-1", "Contrachapado marino 18mm", "Contrachapado marino de alta calidad", "m²", 35.0, 5, "BOM"],
  ];

  // Disable FK checks temporarily
  await client.execute("PRAGMA foreign_keys = OFF");

  for (const [id, supplierId, name, description, unit, basePrice, leadTimeDays, category] of products) {
    await client.execute({
      sql: `INSERT OR IGNORE INTO SupplierProduct (id, supplierId, name, description, unit, basePrice, currency, leadTimeDays, category, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, supplierId, name, description, unit, basePrice, "EUR", leadTimeDays, category, new Date().toISOString()],
    });
  }

  await client.execute("PRAGMA foreign_keys = ON");
  console.log("✅ Productos creados");

  // Link supplier to org
  await client.execute({
    sql: `INSERT OR IGNORE INTO OrganizationSupplier (organizationId, supplierId, isPreferred, createdAt) VALUES (?, ?, ?, ?)`,
    args: ["seed-org-id", "supplier-maderas-1", 1, new Date().toISOString()],
  });
  console.log("✅ Supplier vinculado a la organización");

  console.log("\n🎉 Turso seeded correctamente");
  process.exit(0);
}

seed().catch((e) => {
  console.error("❌ Error:", e.message);
  process.exit(1);
});
