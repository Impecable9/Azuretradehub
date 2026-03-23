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

  // Real supplier quote defaults (updated 2026-03):
  // mdf: Zetar/Wendy WI25001, 8mm MDF @500pcs EXW China, $4.70 = €4.33
  // chapa: steel sheet estimate (not yet quoted)
  // iman: 336× D5×2mm N52 @$0.06 = $20.16 = €18.55 per ALIGN panel
  // epoxy: 3M VHB adhesive from Zetar, $0.70 = €0.64
  // perfil: Impretienda 19mm ~2.55ml/panel @€10.40/ml (Spanish no-MOQ)
  // silicona: SEG bead cord estimate
  // nfc: NTAG213 IDRFID IDN7645, ~$0.12 = €0.11
  // tela: Changzhou Phoneto Joy size @300pcs, $6.60 = €6.08 (per panel, tela_m2 ≈ 0.368 m²)
  const DEFAULTS = {
    mdf_panel:   4.33,
    chapa_m2:    5.50,
    perfil_m:   10.40,
    tela_m2:    16.52, // €6.08 / 0.368 m² ≈ €16.52/m²
    iman_ud:     0.055, // D5×2mm N52 @$0.06
    epoxy_kg:    0.64,  // 3M VHB per panel (not per kg — used as flat cost)
    nfc_chip:    0.11,
    silicona_m:  0.50,
  };

  const unitCosts = {
    mdf_panel:      extractCost(["mdf", "tablero", "madera"])     ?? DEFAULTS.mdf_panel,
    chapa_m2:       extractCost(["chapa", "acero"])               ?? DEFAULTS.chapa_m2,
    perfil_m:       extractCost(["perfil", "seg", "aluminio"])    ?? DEFAULTS.perfil_m,
    tela_m2:        extractCost(["tela", "textil", "sublim"])     ?? DEFAULTS.tela_m2,
    iman_ud:        extractCost(["imán", "iman", "neodimio", "magnet"]) ?? DEFAULTS.iman_ud,
    epoxy_kg:       extractCost(["epoxy", "epoxi", "adhesivo"])   ?? DEFAULTS.epoxy_kg,
    nfc_chip:       extractCost(["nfc", "chip", "ntag"])          ?? DEFAULTS.nfc_chip,
    silicona_m:     extractCost(["silicona"])                      ?? DEFAULTS.silicona_m,
  };

  // ALIGN: 336 imanes N52 D5×2mm por panel (38×78cm = 0.2964 m²)
  const IMANES_PER_PANEL = 336;
  const EPOXY_KG_PER_M2 = 0.05; // 2mm layer ≈ 50g/m²

  return (
    <PricingClient
      sizes={SIZES as unknown as typeof SIZES}
      unitCosts={unitCosts}
      imanesPerPanel={IMANES_PER_PANEL}
      epoxyKgPerM2={EPOXY_KG_PER_M2}
    />
  );
}
