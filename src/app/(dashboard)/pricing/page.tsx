export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { PricingClient } from "@/components/pricing/PricingClient";

const ORG_ID = process.env.OWNER_ORG_ID ?? "seed-org-id";

// Phoenix Wall sizes with component multipliers
// Each "unit" = 1 panel (442×832mm base)
export const SIZES = [
  { name: "Brilliant", dims: "442×832mm",   panels: 1,  mdfUnits: 1,  chapaMm2: 367936,  perfil_m: 2.548, tela_m2: 0.368 },
  { name: "Joy",       dims: "832×832mm",   panels: 2,  mdfUnits: 2,  chapaMm2: 692224,  perfil_m: 3.328, tela_m2: 0.692 },
  { name: "Abundant",  dims: "1222×832mm",  panels: 3,  mdfUnits: 3,  chapaMm2: 1016512, perfil_m: 4.108, tela_m2: 1.017 },
  { name: "Nova",      dims: "1222×1612mm", panels: 6,  mdfUnits: 6,  chapaMm2: 1969864, perfil_m: 5.668, tela_m2: 1.970 },
  { name: "Luna",      dims: "1612×2002mm", panels: 8,  mdfUnits: 8,  chapaMm2: 3227224, perfil_m: 7.228, tela_m2: 3.227 },
  { name: "Gea",       dims: "2002×2392mm", panels: 12, mdfUnits: 12, chapaMm2: 4788784, perfil_m: 8.788, tela_m2: 4.789 },
] as const;

// Component costs will be fetched from supplier products
export default async function PricingPage() {
  // Load known supplier products to get unit costs
  const products = await prisma.supplierProduct.findMany({
    where: { basePrice: { not: null } },
    include: { supplier: true },
    orderBy: { basePrice: "asc" },
  });

  // Load Phoenix Wall quote lines for cost data
  const phoenixQuote = await prisma.quote.findFirst({
    where: { organizationId: ORG_ID, title: { contains: "Phoenix" } },
    include: { lines: true },
    orderBy: { createdAt: "desc" },
  });

  const lines = phoenixQuote?.lines ?? [];

  // Extract best known unit costs from quote lines
  function extractCost(keywords: string[]): number | null {
    for (const line of lines) {
      const desc = line.description.toLowerCase();
      if (keywords.some((kw) => desc.includes(kw)) && line.unitCost) {
        return line.unitCost;
      }
    }
    // Fallback: search in supplier products
    for (const p of products) {
      const name = p.name.toLowerCase();
      if (keywords.some((kw) => name.includes(kw)) && p.basePrice) {
        return p.basePrice;
      }
    }
    return null;
  }

  const unitCosts = {
    mdf_panel:      extractCost(["mdf", "tablero", "madera"]),     // € per panel
    chapa_m2:       extractCost(["chapa", "acero"]),               // € per m²
    perfil_m:       extractCost(["perfil", "seg", "aluminio"]),    // € per m
    tela_m2:        extractCost(["tela", "textil", "sublim"]),     // € per m²
    iman_ud:        extractCost(["imán", "iman", "neodimio", "magnet"]), // € per unit
    epoxy_kg:       extractCost(["epoxy", "epoxi", "adhesivo"]),   // € per kg
    nfc_chip:       extractCost(["nfc", "chip", "ntag"]),          // € per chip
    silicona_m:     extractCost(["silicona"]),                      // € per m
  };

  // ALIGN: N52 D5×2mm magnets every 3cm = ~33 imanes/m²
  const IMANES_PER_M2 = 33;
  const EPOXY_KG_PER_M2 = 0.05; // 2mm layer ≈ 50g/m²

  return (
    <PricingClient
      sizes={SIZES as unknown as typeof SIZES}
      unitCosts={unitCosts}
      imanesPerM2={IMANES_PER_M2}
      epoxyKgPerM2={EPOXY_KG_PER_M2}
    />
  );
}
