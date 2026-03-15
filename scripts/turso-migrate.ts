import * as dotenv from "dotenv";
dotenv.config();

import { createClient } from "@libsql/client";
import fs from "fs";
import path from "path";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function main() {
  console.log("🔌 Conectando a Turso...");

  const migrationsDir = path.join(process.cwd(), "prisma", "migrations");
  const folders = fs
    .readdirSync(migrationsDir)
    .filter((f) => fs.statSync(path.join(migrationsDir, f)).isDirectory())
    .sort();

  for (const folder of folders) {
    const sqlPath = path.join(migrationsDir, folder, "migration.sql");
    if (!fs.existsSync(sqlPath)) continue;

    console.log(`📦 Aplicando: ${folder}`);
    const sql = fs.readFileSync(sqlPath, "utf-8");

    try {
      await client.executeMultiple(sql);
      console.log(`  ✅ Hecho`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("already exists")) {
        console.log(`  ⏭️  Ya aplicada`);
      } else {
        console.error(`  ❌ ${msg}`);
      }
    }
  }

  console.log("\n✅ Migraciones aplicadas en Turso");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => client.close());
