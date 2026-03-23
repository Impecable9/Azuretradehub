// ─────────────────────────────────────────────────────────────────────────────
// STRATEGY CALCULATIONS — Phoenix Wall
// All costs in EUR unless noted. USD → EUR at 0.92
// ─────────────────────────────────────────────────────────────────────────────

export const USD_EUR = 0.92;

// ── MAGNET DATA ───────────────────────────────────────────────────────────────
// Source: Zetar/Wendy WI-25001 (confirmed)
export const MAGNET_D5x2_USD  = 0.06;   // D5×2mm N52 — panel ALIGN
export const MAGNET_D5x6_USD  = 0.098;  // D5×6mm N52 — Heartframe alt.
export const MAGNET_D5x3_EUR  = 0.069;  // D5×3mm — accessories (Zetar confirmed)

// Magnets per product
export const MAGNETS_PER_PANEL = 336;   // ALIGN Brilliant (1 tablero 780×390mm, 26×13 grid)
export const MAGNETS_PANEL_SIZES = [336, 672, 1008, 2016, 2688, 4032]; // Brilliant→Gea

// Local alternative price (Spain, unconfirmed estimate)
export const MAGNET_LOCAL_EUR = 0.22;

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
    item: "VHB 3M + epoxy (stock inicial)",
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

export const PRODUCT_ECONOMICS = SIZES_SHORT.map((size, i) => {
  const magnets   = PANELS_COUNT[i] * MAGNETS_PER_PANEL * MAGNET_D5x2_USD * USD_EUR;
  const mdf       = PANELS_COUNT[i] * 4.33; // Zetar @500 confirmed
  const vhb       = PANELS_COUNT[i] * 0.64;
  const nfc       = PANELS_COUNT[i] * 0.11;
  const assembly  = PANELS_COUNT[i] * 7.50;
  const cogAlign  = magnets + mdf + vhb + nfc + PERFIL_ES[i] + TELA_EUR[i] + assembly + PACKAGING[i];
  const marginAlign = ((PVP_ALIGN[i] - cogAlign) / PVP_ALIGN[i]) * 100;

  const mdfFree   = PANELS_COUNT[i] * 9.25; // sin imanes, chapa estimada
  const cogFree   = mdfFree + vhb + nfc + PERFIL_ES[i] + TELA_EUR[i] + assembly + PACKAGING[i];
  const marginFree = ((PVP_FREE[i] - cogFree) / PVP_FREE[i]) * 100;

  return {
    size,
    panels: PANELS_COUNT[i],
    cogAlign:    Math.round(cogAlign),
    pvpAlign:    PVP_ALIGN[i],
    marginAlign: Math.round(marginAlign),
    cogFree:     Math.round(cogFree),
    pvpFree:     PVP_FREE[i],
    marginFree:  Math.round(marginFree),
    assemblyH:   (PANELS_COUNT[i] * 7.50) / 15, // hours @ €15/h
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
  const assemblyHours  = mix.reduce((s, m) => s + m.share * orders * PRODUCT_ECONOMICS[m.idx].assemblyH, 0);
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
    id: "mdf-moq",
    title: "MDF Zetar — ¿vale la pena MOQ 500 al lanzar?",
    desc: "500 tableros × $4.70 = $2,350. Si vendes 1-2/mes al principio, ese stock dura 250 meses. Alternativa: MDF local hasta validar demanda.",
    impact: "alto",
    action: "Buscar proveedor MDF local en España para primeras 20-50 unidades",
  },
  {
    id: "chapa-supplier",
    title: "Chapa acero (FREE variant) — sin cotización confirmada",
    desc: "Solo tenemos estimado ~€5.50/panel. Necesitas cotización real de chapa magnética 0.5-1mm en formato 780×390mm.",
    impact: "bajo",
    action: "Buscar proveedor chapa en España o pedir cotización a Zetar/Wendy",
  },
];
