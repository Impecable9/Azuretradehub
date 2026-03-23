// ─────────────────────────────────────────────────────────────────────────────
// STRATEGY CALCULATIONS — Phoenix Wall
// All costs in EUR unless noted. USD → EUR at 0.92
// ─────────────────────────────────────────────────────────────────────────────

export const USD_EUR = 0.92;

// ── MAGNET DATA ───────────────────────────────────────────────────────────────
// Source: Zetar/Wendy WI-25001 (confirmed)
export const MAGNET_D5x2_USD  = 0.06;   // D5×2mm N52 — panel ALIGN (surface-mounted)
export const MAGNET_D5x6_USD  = 0.098;  // D5×6mm N52 — Heartframe alt.
export const MAGNET_D5x3_EUR  = 0.069;  // D5×3mm — accessories (Zetar confirmed)

// Magnets per product
export const MAGNETS_PER_PANEL = 336;   // ALIGN Brilliant (1 tablero 780×390mm, 26×13 grid)
export const MAGNETS_PANEL_SIZES = [336, 672, 1008, 2016, 2688, 4032]; // Brilliant→Gea

// Local alternative price (Spain, unconfirmed estimate)
export const MAGNET_LOCAL_EUR = 0.22;

// ── TABLERO BASE — nueva construcción (sin perforar) ──────────────────────────
// MDF 8mm plano (no perforado — más barato que el WI-25001 de Zetar)
// Chapa magnética 0.5mm bonded con VHB → imanes se auto-alinean magnéticamente
// Molde posicionador impreso en Bambu (30mm grid, 336 huecos) — coste único ~€5 filamento
export const MDF_8MM_EUR    = 2.50;  // estimado — necesita cotización real (sin agujeros)
export const CHAPA_EUR      = 5.50;  // estimado — chapa magnética 780×390mm (confirmar)
export const EPOXY_PER_PANEL = 0.80; // epoxy rápido por tablero (~336 puntos, pistola)
export const MOLD_AMORT_EUR  = 0.10; // molde Bambu ~€5, amortizado a 50 usos

// ── MOQ SCENARIOS — D5×2mm ────────────────────────────────────────────────────
const MOQ_SCENARIOS = [1000, 5000, 10000, 50000, 100000];

export const MAGNET_MOQ_TABLE = MOQ_SCENARIOS.map((qty) => {
  const costUSD       = qty * MAGNET_D5x2_USD;
  const costEUR       = costUSD * USD_EUR;
  const brilliantPanels = Math.floor(qty / MAGNETS_PER_PANEL);
  const savingVsLocal = (MAGNET_LOCAL_EUR - MAGNET_D5x2_USD * USD_EUR) * qty;
  // How many Brilliant ALIGN units to "pay back" the investment (magnets already paid per unit anyway)
  // Real question: panels covered = how many you can produce from this batch
  return {
    qty,
    costEUR: Math.round(costEUR),
    brilliantPanels,
    costPerPanel: Math.round((costEUR / brilliantPanels) * 100) / 100,
    savingVsLocal: Math.round(savingVsLocal),
    tag: qty === 5000 ? "recomendado" : qty === 10000 ? "ideal" : undefined,
  };
});

// ── SOURCING BREAKEVEN — ES profile vs CN ─────────────────────────────────────
// Per Joy size (2 panels) as reference unit
const PERFIL_JOY_ES_EUR  = 41.60; // Impretienda (confirmed)
const PERFIL_JOY_CN_USD  = 4.60;  // MESCO @MOQ40 (confirmed)
const PERFIL_JOY_CN_EUR  = PERFIL_JOY_CN_USD * USD_EUR;
const SAVING_PER_JOY     = PERFIL_JOY_ES_EUR - PERFIL_JOY_CN_EUR;

// CN sourcing fixed costs (one-time per order batch)
const LOGISTICS_CN_EUR   = 350;  // freight + customs estimate (FYI: Joy 40 sets ~15kg)
const MOQ_40_INVEST_EUR  = 40 * PERFIL_JOY_CN_EUR; // must buy 40 sets min

export const PROFILE_BREAKEVEN = {
  esPricePerSet:   PERFIL_JOY_ES_EUR,
  cnPricePerSet:   Math.round(PERFIL_JOY_CN_EUR * 100) / 100,
  savingPerSet:    Math.round(SAVING_PER_JOY * 100) / 100,
  moqInvestEUR:    Math.round(MOQ_40_INVEST_EUR),
  logisticsCN:     LOGISTICS_CN_EUR,
  totalFixedCN:    Math.round(MOQ_40_INVEST_EUR + LOGISTICS_CN_EUR),
  breakevenUnits:  Math.ceil((MOQ_40_INVEST_EUR + LOGISTICS_CN_EUR) / SAVING_PER_JOY),
  netSavingAt40:   Math.round(40 * SAVING_PER_JOY - LOGISTICS_CN_EUR),
  netSavingAt100:  Math.round(100 * SAVING_PER_JOY - LOGISTICS_CN_EUR),
};

// ── LAUNCH CAPITAL REQUIREMENTS ───────────────────────────────────────────────
// Minimum viable stock to start selling (Brilliant + Joy ALIGN)
export const LAUNCH_CAPITAL = [
  {
    item: "Imanes D5×2mm × 10,000",
    supplier: "Zetar/Wendy",
    costEUR: Math.round(10000 * MAGNET_D5x2_USD * USD_EUR),
    covers: "~29 tableros ALIGN",
    critical: true,
    note: "MOQ estimado. Confirmar con Wendy.",
  },
  {
    item: "Perfil SEG ES — Joy × 10 sets",
    supplier: "Impretienda",
    costEUR: Math.round(10 * PERFIL_JOY_ES_EUR),
    covers: "10 tableros Joy",
    critical: true,
    note: "Sin MOQ. Se puede pedir 1 a 1.",
  },
  {
    item: "Tela SEG Joy × 50 ud",
    supplier: "Changzhou Phoneto",
    costEUR: Math.round(50 * 6.00 * USD_EUR),
    covers: "50 tableros",
    critical: true,
    note: "MOQ ~300. Negociar muestra o MOQ reducido.",
  },
  {
    item: "NFC IDN7645 × 1 rollo (1000 ud)",
    supplier: "IDRFID Shenzhen",
    costEUR: Math.round(1000 * 0.12 * USD_EUR),
    covers: "1000 tableros",
    critical: false,
    note: "MOQ 1 rollo = 1000 ud.",
  },
  {
    item: "Chapa magnética 780×390mm × 20 ud",
    supplier: "Local / ferretería industrial",
    costEUR: Math.round(20 * CHAPA_EUR),
    covers: "20 tableros base (ALIGN y FREE)",
    critical: true,
    note: "Estimado €5.50/ud. Conseguir cotización real. Puede ser chapa galvanizada 0.5mm.",
  },
  {
    item: "MDF 8mm plano — formato 780×390mm × 20 ud",
    supplier: "Local / Leroy Merlin / online",
    costEUR: Math.round(20 * MDF_8MM_EUR),
    covers: "20 tableros",
    critical: true,
    note: "Estimado €2.50/ud cortado a medida. Sin agujeros.",
  },
  {
    item: "Molde posicionador Bambu (PLA, 30mm grid × 336 huecos)",
    supplier: "Producción propia — Bambu Lab",
    costEUR: 5,
    covers: "Reutilizable indefinidamente",
    critical: true,
    note: "Imprimir en PLA rígido. ~2h impresión, ~€2 filamento. Clave para reproducibilidad.",
  },
  {
    item: "VHB 3M + epoxy rápido (stock inicial)",
    supplier: "Local / Amazon",
    costEUR: 45,
    covers: "~50 tableros",
    critical: false,
    note: "Estimado.",
  },
  {
    item: "Heartframe PLA (filamento Bambu)",
    supplier: "Bambu Lab (propia)",
    costEUR: 25,
    covers: "~50 Heartframes",
    critical: false,
    note: "Producción propia. Coste filamento estimado.",
  },
  {
    item: "Accesorios Wing×5 + Nest×5 + Craw×5 + Pins×10",
    supplier: "Terrence (CIF Málaga)",
    costEUR: Math.round((5 * 2.80 + 5 * 4.14 + 5 * 1.07 + 10 * 0.84) * USD_EUR),
    covers: "Stock inicial accesorios",
    critical: false,
    note: "MOQ 50/pieza. Revisar si arrancar con PLA artesanal.",
  },
];

export const LAUNCH_TOTAL_CRITICAL = LAUNCH_CAPITAL
  .filter(i => i.critical)
  .reduce((s, i) => s + i.costEUR, 0);

export const LAUNCH_TOTAL_ALL = LAUNCH_CAPITAL.reduce((s, i) => s + i.costEUR, 0);

// ── PROFITABILITY PROJECTION ──────────────────────────────────────────────────
const SIZES_SHORT  = ["Brilliant", "Joy", "Abundant", "Nova", "Luna", "Gea"];
const PANELS_COUNT = [1, 2, 3, 6, 8, 12];
const PERFIL_ES    = [26.50, 41.60, 52.00, 72.80, 83.20, 93.60];
const TELA_EUR     = [3.22, 6.08, 9.12, 18.00, 29.00, 43.00];
const PACKAGING    = [4, 5, 6, 8, 10, 15];
const PVP_ALIGN    = [299, 499, 699, 1299, 1699, 2499];
const PVP_FREE     = [199, 299, 449, 899, 1199, 1799];

// ── Nueva construcción: MDF 8mm + chapa + molde Bambu ────────────────────────
// ALIGN: base común (MDF+chapa+VHB) + 336 imanes por molde + epoxy
// FREE:  base común (MDF+chapa+VHB) — sin imanes
// Assembly time revised: no drilling (~50 min/panel vs 68 min antes)
export const PRODUCT_ECONOMICS = SIZES_SHORT.map((size, i) => {
  const basePerPanel = MDF_8MM_EUR + CHAPA_EUR + MOLD_AMORT_EUR; // €8.10/tablero
  const vhb          = PANELS_COUNT[i] * 0.64;
  const nfc          = PANELS_COUNT[i] * 0.11;
  const magnets      = PANELS_COUNT[i] * MAGNETS_PER_PANEL * MAGNET_D5x2_USD * USD_EUR;
  const epoxy        = PANELS_COUNT[i] * EPOXY_PER_PANEL;
  // Assembly: 50 min/panel @ €15/h (no drilling — mold method)
  const assembly     = PANELS_COUNT[i] * (50 / 60) * 15;

  const cogAlign  = PANELS_COUNT[i] * basePerPanel + vhb + nfc + magnets + epoxy
                  + PERFIL_ES[i] + TELA_EUR[i] + assembly + PACKAGING[i];
  const marginAlign = ((PVP_ALIGN[i] - cogAlign) / PVP_ALIGN[i]) * 100;

  // FREE: misma base, sin imanes ni epoxy
  const cogFree   = PANELS_COUNT[i] * basePerPanel + vhb + nfc
                  + PERFIL_ES[i] + TELA_EUR[i] + assembly + PACKAGING[i];
  const marginFree = ((PVP_FREE[i] - cogFree) / PVP_FREE[i]) * 100;

  return {
    size,
    panels:      PANELS_COUNT[i],
    cogAlign:    Math.round(cogAlign),
    pvpAlign:    PVP_ALIGN[i],
    marginAlign: Math.round(marginAlign),
    cogFree:     Math.round(cogFree),
    pvpFree:     PVP_FREE[i],
    marginFree:  Math.round(marginFree),
    assemblyMin: PANELS_COUNT[i] * 50,          // minutos totales
    assemblyH:   (PANELS_COUNT[i] * 50) / 60,   // horas
  };
});

// Monthly projections
export const MONTHLY_PROJECTIONS = [1, 5, 10, 20, 50, 100].map((orders) => {
  // Assume mix: 60% Brilliant, 30% Joy, 10% Abundant — all ALIGN ES
  const mix = [
    { idx: 0, share: 0.60 },
    { idx: 1, share: 0.30 },
    { idx: 2, share: 0.10 },
  ];
  const revenue = mix.reduce((s, m) => s + m.share * orders * PVP_ALIGN[m.idx], 0);
  const cog     = mix.reduce((s, m) => s + m.share * orders * PRODUCT_ECONOMICS[m.idx].cogAlign, 0);
  const grossProfit = revenue - cog;
  const grossMarginPct = (grossProfit / revenue) * 100;
  const assemblyHours  = mix.reduce((s, m) => s + m.share * orders * (PRODUCT_ECONOMICS[m.idx].assemblyH), 0);
  const assemblyDays   = assemblyHours / 4; // 4h productive/day

  return {
    orders,
    revenue:      Math.round(revenue),
    cog:          Math.round(cog),
    grossProfit:  Math.round(grossProfit),
    grossMarginPct: Math.round(grossMarginPct),
    assemblyHours:  Math.round(assemblyHours * 10) / 10,
    assemblyDays:   Math.round(assemblyDays * 10) / 10,
  };
});

// ── PENDING DECISIONS ─────────────────────────────────────────────────────────
export const PENDING_DECISIONS = [
  {
    id: "magnet-moq",
    title: "MOQ exacto imanes D5×2mm",
    desc: "La cotización Zetar dice $0.06/ud pero no especifica MOQ mínimo. Confirmar con Wendy si hay lote mínimo de 1k, 5k o 10k.",
    impact: "alto",
    action: "Preguntar a Wendy directamente en el próximo email",
  },
  {
    id: "tela-moq",
    title: "Tela SEG — negociar MOQ reducido",
    desc: "Phoneto exige ~300 ud pero para lanzamiento solo necesitas 20-50. Pedir muestra productiva o MOQ 50 para launch.",
    impact: "alto",
    action: "Enviar RFQ a Phoneto con volumen escalonado: 50 / 100 / 300",
  },
  {
    id: "accessories-launch",
    title: "Accesorios: PLA vs metal para lanzamiento",
    desc: "Metal (Terrence) requiere MOQ 50/pieza = inversión ~€300. PLA con Bambu: coste marginal ~€0.50 pero tiempo de impresión.",
    impact: "medio",
    action: "Decidir: ¿lanzar con PLA artesanal y ofrecer metal solo bajo pedido?",
  },
  {
    id: "heartframe-magnets",
    title: "Heartframe: D5×3mm vs D5×6mm vs D5×12mm",
    desc: "D5×12mm da más fuerza para colgar objetos pesados pero más grosor. D5×6mm es el equilibrio. Confirmar grosor de MDF/PLA.",
    impact: "medio",
    action: "Hacer prueba física con la Bambu antes de comprometer al proveedor",
  },
  {
    id: "mdf-local",
    title: "MDF 8mm plano — cotización real en España",
    desc: "Con el nuevo método sin perforar, ya no necesitas el MDF de Zetar. Solo MDF 8mm liso cortado a 780×390mm. Leroy Merlin / online puede bastar para el lanzamiento.",
    impact: "alto",
    action: "Pedir precio MDF 8mm cortado a medida en 3 sitios locales. Objetivo: <€3/ud",
  },
  {
    id: "chapa-supplier",
    title: "Chapa magnética — cotización urgente (ahora crítica para ALIGN y FREE)",
    desc: "Con el nuevo proceso, la chapa es necesaria en AMBAS variantes. Chapa de acero magnético 0.5–0.8mm, 780×390mm. Solo estimado €5.50/ud — sin cotización real.",
    impact: "alto",
    action: "Buscar proveedor chapas/laminados en Málaga o pedir cotización a Zetar. Objetivo: <€6/ud",
  },
  {
    id: "mold-design",
    title: "Diseñar e imprimir molde posicionador en Bambu",
    desc: "El molde 30mm grid × 336 huecos D5 es la clave del nuevo proceso. PLA rígido, 780×390mm (o varios segmentos encajables). Tolerancia: ±0.5mm en hueco D5 para que los imanes encajen y salgan limpio.",
    impact: "alto",
    action: "Modelar en Fusion 360 / FreeCAD. Hacer prueba de ajuste con imanes reales antes de escalar.",
  },
];
