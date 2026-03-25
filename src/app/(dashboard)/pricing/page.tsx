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

  // Costes actualizados 2026-03 — nuevo proceso: MDF plano local + chapa 0.5mm + molde Bambu (sin perforar)
  // NFC chip va en los Heartframes, NO en el tablero base.
  // mdf: local/TOSIZE.es ~€2.50/ud (sin agujeros — más barato que Zetar perforado)
  // chapa: chapa magnética 0.5mm 780×390mm ~€5.50 (cotización pendiente Evek.red)
  // iman: 336× D5×2mm N52 Zetar @$0.06 = €18.55 per ALIGN panel
  // epoxy: bicomponente pistola ~€0.80/tablero
  // perfil: Impretienda 19mm ~2.55ml/panel @€10.40/ml (España sin MOQ)
  // tela: Changzhou Phoneto @€6.08/panel (estimado)
  const DEFAULTS = {
    mdf_panel:   2.50,   // local/TOSIZE — sin agujeros (vs €4.33 Zetar perforado)
    chapa_m2:    5.50,   // chapa magnética 0.5mm — estimado, pendiente cotizar
    perfil_m:   10.40,   // Impretienda ES sin MOQ
    tela_m2:    16.52,   // €6.08 / 0.368 m² ≈ €16.52/m²
    iman_ud:     0.055,  // D5×2mm N52 Zetar @$0.06
    epoxy_panel: 0.80,   // epoxy bicomponente por tablero ALIGN
    silicona_m:  0.50,
  };

  const unitCosts = {
    mdf_panel:      extractCost(["mdf", "tablero", "madera"])           ?? DEFAULTS.mdf_panel,
    chapa_m2:       extractCost(["chapa", "acero"])                     ?? DEFAULTS.chapa_m2,
    perfil_m:       extractCost(["perfil", "seg", "aluminio"])          ?? DEFAULTS.perfil_m,
    tela_m2:        extractCost(["tela", "textil", "sublim"])           ?? DEFAULTS.tela_m2,
    iman_ud:        extractCost(["imán", "iman", "neodimio", "magnet"]) ?? DEFAULTS.iman_ud,
    epoxy_panel:    extractCost(["epoxy", "epoxi", "adhesivo"])         ?? DEFAULTS.epoxy_panel,
    silicona_m:     extractCost(["silicona"])                           ?? DEFAULTS.silicona_m,
  };

  // ALIGN: 336 imanes N52 D5×2mm por panel (780×390mm)
  const IMANES_PER_PANEL = 336;

  return (
    <PricingClient
      sizes={SIZES as unknown as typeof SIZES}
      unitCosts={unitCosts}
      imanesPerPanel={IMANES_PER_PANEL}
    />
  );
}
