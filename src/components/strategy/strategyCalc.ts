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

// ── NFC ───────────────────────────────────────────────────────────────────────
// NFC chip goes in Heartframes (cuadros magnéticos), NOT in base panels.
// Each Heartframe embeds 1 chip. Not a standalone product — internal component.
export const NFC_CHIP_USD = 0.12;  // IDN7645 · IDRFID Shenzhen
export const NFC_CHIP_EUR = NFC_CHIP_USD * USD_EUR;

// ── MAGNET PHYSICS — VERTICAL HOLDING FORCE ───────────────────────────────────
// Sources: supermagnete.de FAQ, supreme magnets N52 data, JC magnetics N52 specs
// All forces are magnet-to-ALIGN-board (steel sheet + D5×2mm surface magnets).
// The steel sheet acts as flux concentrator → effective pull ~70% of pure-steel value.
// Shear on vertical surface with rubber/felt pad: ~65% of pull force.
// Safety factor applied: 2.5× (picture hanging, public spaces).
//
// Safe working load per magnet (vertical, rubber pad, SF 2.5×):
//   D5×3mm N52: 0.82 kg (pull/steel) × 0.70 × 0.65 / 2.5 = 0.149 kg ≈ 0.15 kg
//   D5×6mm N52: 1.30 kg (pull/steel) × 0.70 × 0.65 / 2.5 = 0.236 kg ≈ 0.24 kg
export const MAGNET_PHYSICS = {
  // Confirmed pull force to mild steel (N52, manufacturer data)
  D5x3_pullSteel: 0.82,  // kg · confirmed supermagnete / supreme magnets
  D5x6_pullSteel: 1.30,  // kg · estimated (~1.2–1.5 range), use conservative
  // Correction factors for ALIGN board surface
  boardFactor:   0.70,   // steel sheet + embedded magnets ≈ 70% of pure steel
  shearRubber:   0.65,   // shear/pull ratio with rubber pad on vertical surface
  safetyFactor:  2.5,    // required for picture hanging
  // Safe working load per magnet (final)
  safePerD5x3:   0.15,   // kg per D5×3mm magnet on ALIGN board, vertical
  safePerD5x6:   0.24,   // kg per D5×6mm magnet on ALIGN board, vertical
};

// ── HEARTFRAME VARIANTS ────────────────────────────────────────────────────────
// All variants: PLA (Bambu) + 1 NFC chip IDN7645.
// Grid spacing: 30mm — aligns perfectly with ALIGN board's 30mm magnet grid.
// Rubber pad on back face MANDATORY for rated holding force.
export const HEARTFRAME_VARIANTS = [
  {
    id:       "hf-s",
    name:     "HF Standard",
    grid:     "3×3",
    count:    9,
    magnet:   "D5×3mm N52",
    magnetEUR: MAGNET_D5x3_EUR,
    footprint: "60×60 mm",
    safeLoad:  Math.round(9 * MAGNET_PHYSICS.safePerD5x3 * 1000),  // gramos
    maxFrame:  Math.round(9 * MAGNET_PHYSICS.safePerD5x3 * 1000 / 1.6), // con margen 1.6×
    costEUR:   parseFloat((1.50 + NFC_CHIP_EUR + 9 * MAGNET_D5x3_EUR).toFixed(2)),
    pvp:       35,
    compatFrames: "hasta ~25×30 cm · peso max ~800 g",
    examples: ["13×18 foto", "20×20 cuadro", "21×30 (A4)"],
    note: "El más compacto. Recomendado para fotos y cuadros ligeros de madera/MDF. Carga útil para marcos con cristal acrílico.",
  },
  {
    id:       "hf-m",
    name:     "HF Medium",
    grid:     "3×3",
    count:    9,
    magnet:   "D5×6mm N52",
    magnetEUR: parseFloat((MAGNET_D5x6_USD * USD_EUR).toFixed(3)),
    footprint: "60×60 mm",
    safeLoad:  Math.round(9 * MAGNET_PHYSICS.safePerD5x6 * 1000),
    maxFrame:  Math.round(9 * MAGNET_PHYSICS.safePerD5x6 * 1000 / 1.6),
    costEUR:   parseFloat((1.50 + NFC_CHIP_EUR + 9 * MAGNET_D5x6_USD * USD_EUR).toFixed(2)),
    pvp:       42,
    compatFrames: "hasta ~35×45 cm · peso max ~1.3 kg",
    examples: ["30×30 madera", "30×40 cuadro", "A3 enmarcado"],
    note: "Mismo footprint que HF Standard. Solo cambia la altura del imán (3mm→6mm): más fuerza, misma superficie impresa.",
  },
  {
    id:       "hf-l",
    name:     "HF Large",
    grid:     "4×4",
    count:    16,
    magnet:   "D5×3mm N52",
    magnetEUR: MAGNET_D5x3_EUR,
    footprint: "90×90 mm",
    safeLoad:  Math.round(16 * MAGNET_PHYSICS.safePerD5x3 * 1000),
    maxFrame:  Math.round(16 * MAGNET_PHYSICS.safePerD5x3 * 1000 / 1.6),
    costEUR:   parseFloat((2.00 + NFC_CHIP_EUR + 16 * MAGNET_D5x3_EUR).toFixed(2)),
    pvp:       55,
    compatFrames: "hasta ~50×60 cm · peso max ~1.5 kg",
    examples: ["40×40 espejo ligero", "40×50 cuadro", "50×60 lámina"],
    note: "Para cuadros grandes o espejos. La huella 4×4 distribuye la carga en un área mayor, evitando el tirón en un punto.",
  },
  {
    id:       "hf-xl",
    name:     "HF XL",
    grid:     "4×4",
    count:    16,
    magnet:   "D5×6mm N52",
    magnetEUR: parseFloat((MAGNET_D5x6_USD * USD_EUR).toFixed(3)),
    footprint: "90×90 mm",
    safeLoad:  Math.round(16 * MAGNET_PHYSICS.safePerD5x6 * 1000),
    maxFrame:  Math.round(16 * MAGNET_PHYSICS.safePerD5x6 * 1000 / 1.6),
    costEUR:   parseFloat((2.00 + NFC_CHIP_EUR + 16 * MAGNET_D5x6_USD * USD_EUR).toFixed(2)),
    pvp:       69,
    compatFrames: "hasta ~60×70 cm · peso max ~2.4 kg",
    examples: ["50×70 cuadro grande", "espejo 50×70", "obra en marco macizo"],
    note: "Máxima sujeción. Para cuadros grandes con cristal real o espejos medianos. Encima de 2.4 kg recomendamos instalación con taco + colgador tradicional como seguro adicional.",
  },
];

// Peso típico de marcos por tamaño (estimación para guía al cliente)
export const FRAME_WEIGHT_GUIDE = [
  { dims: "13×18 cm", type: "Foto plástico/madera", weightG: 150, hf: "HF Standard" },
  { dims: "20×20 cm", type: "Madera fina + acrílico", weightG: 350, hf: "HF Standard" },
  { dims: "21×30 cm", type: "A4 · madera + acrílico", weightG: 420, hf: "HF Standard" },
  { dims: "30×30 cm", type: "Madera sólida + acrílico", weightG: 700, hf: "HF Standard (límite)" },
  { dims: "30×40 cm", type: "Madera sólida + acrílico", weightG: 850, hf: "HF Medium" },
  { dims: "30×40 cm", type: "Madera + cristal real", weightG: 1100, hf: "HF Medium" },
  { dims: "40×50 cm", type: "Madera + acrílico", weightG: 1100, hf: "HF Large" },
  { dims: "40×50 cm", type: "Madera + cristal real", weightG: 1600, hf: "HF XL" },
  { dims: "50×70 cm", type: "Madera + acrílico", weightG: 1800, hf: "HF XL" },
  { dims: "50×70 cm", type: "Madera + cristal real", weightG: 2800, hf: "No recomendado (>2.4 kg)" },
];

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
  // NFC goes in Heartframes, not in base panels — removed from ALIGN cost
  const magnets      = PANELS_COUNT[i] * MAGNETS_PER_PANEL * MAGNET_D5x2_USD * USD_EUR;
  const epoxy        = PANELS_COUNT[i] * EPOXY_PER_PANEL;
  // Assembly: 50 min/panel @ €15/h (no drilling — mold method)
  const assembly     = PANELS_COUNT[i] * (50 / 60) * 15;

  const cogAlign  = PANELS_COUNT[i] * basePerPanel + vhb + magnets + epoxy
                  + PERFIL_ES[i] + TELA_EUR[i] + assembly + PACKAGING[i];
  const marginAlign = ((PVP_ALIGN[i] - cogAlign) / PVP_ALIGN[i]) * 100;

  // FREE: misma base, sin imanes ni epoxy
  const cogFree   = PANELS_COUNT[i] * basePerPanel + vhb
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

// ── INSTALLATION SERVICE — PRECIO Y MARGEN ────────────────────────────────────
// "Servicio de instalación white-glove" — equipo externo colaborador va a cliente.
// Se cobra aparte del producto. Target: B2B (hoteles, oficinas, retail, interioristas).
//
// Tarifas de mercado España 2026 (colaborador externo):
//   Solo: €30/h — instalaciones pequeñas (≤3 paneles)
//   Dúo (2 personas): €55/h combinado — instalaciones medianas/grandes (≥6 paneles)
//   Dúo más rápido: cada panel tarda ~12 min (vs 20 min solo) porque uno nivela y otro taladra
//
// Estructura de tiempo:
//   Setup en local: 20 min fijos (herramientas, nivelación pared, organización)
//   Instalación por panel: 20 min/panel (solo) · 12 min/panel (dúo)
//   Cierre + walkthrough: 15 min fijos
//
// Zonas de desplazamiento (base: Málaga):
//   Local   0–50 km:  1h ida+vuelta · €12 combustible
//   Regional 50–200 km: 3h ida+vuelta · €35 combustible
//   Nacional 200+ km: precio a medida + alojamiento

export const INSTALL_RATES = {
  soloPerH:     30,   // €/h colaborador solo
  duoPerH:      55,   // €/h equipo 2 personas (combinado)
  setupMin:     20,   // minutos setup fijo (independiente de tamaño)
  closeMin:     15,   // minutos cierre + walkthrough
  panelMinSolo: 20,   // minutos por panel (solo)
  panelMinDuo:  12,   // minutos por panel (dúo)
  zones: [
    { id: "local",    label: "Local (0–50 km)",      travelH: 1.0, fuelEUR: 12,  surcharge: 0   },
    { id: "regional", label: "Regional (50–200 km)", travelH: 3.0, fuelEUR: 35,  surcharge: 80  },
    { id: "national", label: "Nacional (200+ km)",   travelH: 0,   fuelEUR: 0,   surcharge: 0,
      note: "Presupuesto a medida — incluir alojamiento y desplazamiento" },
  ],
};

// Tipo de resultado de cálculo de instalación por tamaño
export interface InstallCalc {
  size:             string;
  panels:           number;
  team:             "solo" | "dúo";
  onSiteMin:        number;    // tiempo en local (sin viaje)
  totalCostLocal:   number;    // coste total zona local (labor + viaje)
  totalCostRegional:number;    // coste zona regional
  pvpLocal:         number;    // precio sugerido al cliente (zona local)
  pvpRegional:      number;    // precio sugerido (zona regional)
  marginPctLocal:   number;    // margen sobre pvpLocal
  combinedTicket:   number;    // PVP producto ALIGN + instalación local
  combinedMarginPct:number;    // margen combinado producto + servicio
}

function calcInstall(size: string, panels: number, pvpAlign: number, cogAlign: number): InstallCalc {
  // ≤3 paneles: solo. ≥6 paneles: dúo.
  const useDuo    = panels >= 6;
  const rate      = useDuo ? INSTALL_RATES.duoPerH : INSTALL_RATES.soloPerH;
  const panelMin  = useDuo ? INSTALL_RATES.panelMinDuo : INSTALL_RATES.panelMinSolo;
  const onSiteMin = INSTALL_RATES.setupMin + panels * panelMin + INSTALL_RATES.closeMin;

  const zoneLocal    = INSTALL_RATES.zones[0];
  const zoneRegional = INSTALL_RATES.zones[1];

  // Coste total zona local = (horas en local + horas viaje) × tarifa + combustible
  const laborHLocal = (onSiteMin / 60) + zoneLocal.travelH;
  const totalCostLocal = laborHLocal * rate + zoneLocal.fuelEUR;

  // Coste zona regional
  const laborHRegional = (onSiteMin / 60) + zoneRegional.travelH;
  const totalCostRegional = laborHRegional * rate + zoneRegional.fuelEUR;

  // PVP sugerido: coste × 2.2 mínimo, redondeado a múltiplo de €10, con floor razonable
  const pvpLocal    = Math.max(Math.round((totalCostLocal    * 2.2) / 10) * 10, 99);
  const pvpRegional = Math.max(Math.round((totalCostRegional * 2.2) / 10) * 10, 149);
  const marginPctLocal = Math.round(((pvpLocal - totalCostLocal) / pvpLocal) * 100);

  // Ticket combinado (producto + instalación)
  const combinedTicket    = pvpAlign + pvpLocal;
  const combinedCost      = cogAlign + totalCostLocal;
  const combinedMarginPct = Math.round(((combinedTicket - combinedCost) / combinedTicket) * 100);

  return {
    size, panels,
    team:              useDuo ? "dúo" : "solo",
    onSiteMin:         Math.round(onSiteMin),
    totalCostLocal:    Math.round(totalCostLocal),
    totalCostRegional: Math.round(totalCostRegional),
    pvpLocal,
    pvpRegional,
    marginPctLocal,
    combinedTicket,
    combinedMarginPct,
  };
}

// Tabla completa de instalación por tamaño
const _sizes  = ["Brilliant", "Joy", "Abundant", "Nova", "Luna", "Gea"];
const _panels = [1, 2, 3, 6, 8, 12];

export const INSTALLATION_TABLE: InstallCalc[] = _sizes.map((size, i) =>
  calcInstall(size, _panels[i], PVP_ALIGN[i], PRODUCT_ECONOMICS[i].cogAlign)
);

// ── SUPPLIERS CATALOG — PRECIOS REALES ────────────────────────────────────────
// Status: "confirmed" = precio verificado con cotización/web real
//         "estimated" = basado en búsqueda web o estimación analítica
//         "pending"   = falta cotización real — no usar para P&L definitivo
// Fecha última revisión: 2026-03-25

export type SupplierStatus = "confirmed" | "estimated" | "pending";

export interface SupplierEntry {
  id:         string;
  category:   string;
  item:        string;
  supplier:    string;
  country:     string;
  priceEUR:    number;           // precio por unidad en EUR
  priceUnit:   string;           // e.g. "ud", "m²", "kg", "lote"
  moq:         number | null;    // cantidad mínima, null = sin MOQ
  leadTimeDays?: number | null;
  status:      SupplierStatus;
  source:      string;           // URL o descripción de la fuente
  notes:       string;
}

export const SUPPLIERS_CATALOG: SupplierEntry[] = [

  // ─── MAGNETOS ─────────────────────────────────────────────────────────────
  {
    id:         "mag-d5x2-zetar",
    category:   "Magnetos",
    item:        "Imán D5×2mm N52",
    supplier:    "Zetar Magnetics (Wendy)",
    country:     "CN",
    priceEUR:    parseFloat((0.060 * USD_EUR).toFixed(4)),  // $0.06 USD
    priceUnit:   "ud",
    moq:         null,        // pendiente confirmar (1k / 5k / 10k)
    status:      "confirmed",
    source:      "Cotización WI-25001 — precio confirmado, MOQ pendiente",
    notes:       "Panel ALIGN. 336 ud/tablero. MOQ sin confirmar — email a Wendy.",
  },
  {
    id:         "mag-d5x3-zetar",
    category:   "Magnetos",
    item:        "Imán D5×3mm N52",
    supplier:    "Zetar Magnetics (Wendy)",
    country:     "CN",
    priceEUR:    0.069,
    priceUnit:   "ud",
    moq:         null,
    status:      "confirmed",
    source:      "Zetar WI-25001 confirmado",
    notes:       "Heartframe HF-Standard (9 ud/unidad). También usado en HF-Large (16 ud).",
  },
  {
    id:         "mag-d5x6-zetar",
    category:   "Magnetos",
    item:        "Imán D5×6mm N52",
    supplier:    "Zetar Magnetics (Wendy)",
    country:     "CN",
    priceEUR:    parseFloat((0.098 * USD_EUR).toFixed(4)),  // $0.098 USD
    priceUnit:   "ud",
    moq:         null,
    status:      "confirmed",
    source:      "Zetar WI-25001 (precio $0.098 USD)",
    notes:       "Heartframe HF-Medium (9 ud) y HF-XL (16 ud). Mayor fuerza de sujeción.",
  },
  {
    id:         "mag-d5x3-supermagnete",
    category:   "Magnetos",
    item:        "Imán D5×3mm N42 (backup local)",
    supplier:    "supermagnete.es",
    country:     "ES",
    priceEUR:    0.23,
    priceUnit:   "ud",
    moq:         160,
    status:      "confirmed",
    source:      "supermagnete.es — precio web verificado (160+ uds = €0.23/ud)",
    notes:       "N42 vs N52 de Zetar — fuerza algo menor pero disponible sin MOQ masivo. Ideal para primeras unidades / prototipos.",
  },
  {
    id:         "mag-d5x5-supermagnete",
    category:   "Magnetos",
    item:        "Imán D5×5mm N45 (sustituto HF-Medium)",
    supplier:    "supermagnete.es",
    country:     "ES",
    priceEUR:    0.22,
    priceUnit:   "ud",
    moq:         360,
    status:      "confirmed",
    source:      "supermagnete.es — 360+ uds = €0.22/ud, pull ~940g a acero puro",
    notes:       "Sustituto viable para HF-Medium si Zetar D5×6mm tarda. Pull ~940g supera el D5×3mm N52 (820g). Recalcular física con N45.",
  },

  // ─── NFC ──────────────────────────────────────────────────────────────────
  {
    id:         "nfc-idn7645-idrfid",
    category:   "NFC",
    item:        "Chip NFC IDN7645",
    supplier:    "IDRFID Shenzhen",
    country:     "CN",
    priceEUR:    parseFloat((0.12 * USD_EUR).toFixed(4)),
    priceUnit:   "ud",
    moq:         1000,
    leadTimeDays: 15,
    status:      "confirmed",
    source:      "IDRFID cotización — $0.12 USD/ud, MOQ 1 rollo = 1000 ud",
    notes:       "Va en Heartframes (1 chip/unidad). Sin app. Programable con NFC Tools (iOS/Android).",
  },

  // ─── PERFIL SEG ───────────────────────────────────────────────────────────
  {
    id:         "seg-joy-impretienda",
    category:   "Perfil SEG",
    item:        "Perfil SEG — set Joy (2 paneles 780×390mm)",
    supplier:    "Impretienda",
    country:     "ES",
    priceEUR:    41.60,
    priceUnit:   "set",
    moq:         1,
    leadTimeDays: 5,
    status:      "confirmed",
    source:      "Impretienda — precio confirmado sin MOQ (se puede pedir de 1 en 1)",
    notes:       "Referencia para Joy. Brilliant ~€26.50/set. Sin MOQ = ideal para lanzamiento.",
  },
  {
    id:         "seg-joy-mesco",
    category:   "Perfil SEG",
    item:        "Perfil SEG — set Joy CN (MOQ 40 sets)",
    supplier:    "MESCO",
    country:     "CN",
    priceEUR:    parseFloat((4.60 * USD_EUR).toFixed(2)),
    priceUnit:   "set",
    moq:         40,
    leadTimeDays: 30,
    status:      "confirmed",
    source:      "MESCO cotización — $4.60 USD/set, MOQ 40 sets",
    notes:       "Ahorro ~€37/set vs Impretienda. Breakeven a ~12 unidades Joy (descontando flete €350).",
  },

  // ─── TELA SEG ─────────────────────────────────────────────────────────────
  {
    id:         "tela-phoneto",
    category:   "Tela SEG",
    item:        "Tela SEG impresa (City Fabrics)",
    supplier:    "Changzhou Phoneto",
    country:     "CN",
    priceEUR:    parseFloat((6.00 * USD_EUR).toFixed(2)),
    priceUnit:   "panel",   // por tablero 780×390mm
    moq:         300,
    leadTimeDays: 21,
    status:      "estimated",
    source:      "Estimado $6 USD/panel. MOQ ~300 ud. Negociar muestra MOQ 50.",
    notes:       "MOQ 300 bloquea lanzamiento. PENDIENTE negociar MOQ 50 para fase 1.",
  },

  // ─── TABLERO BASE ─────────────────────────────────────────────────────────
  {
    id:         "mdf-tosize",
    category:   "Tablero base",
    item:        "MDF 8mm cortado a medida 780×390mm",
    supplier:    "TOSIZE.es",
    country:     "ES",
    priceEUR:    3.20,       // estimado basado en configurador web (~€2-4/ud)
    priceUnit:   "ud",
    moq:         1,
    leadTimeDays: 5,
    status:      "estimated",
    source:      "TOSIZE.es — corte a medida gratis, precio vía configurador online (estimado €2-4/ud)",
    notes:       "Sin agujeros — nuevo proceso sin perforar. PENDIENTE confirmar precio exacto en configurador.",
  },
  {
    id:         "mdf-leroy",
    category:   "Tablero base",
    item:        "MDF 8mm tablero completo (corte manual)",
    supplier:    "Leroy Merlin",
    country:     "ES",
    priceEUR:    2.10,       // estimado: tablero 244×122cm / 8 piezas 780×390mm ≈ €2.1/pieza
    priceUnit:   "ud",
    moq:         1,
    leadTimeDays: 0,
    status:      "estimated",
    source:      "Leroy Merlin tablero MDF 8mm ~€17-20/tablero completo. Estimado ~8 piezas por tablero.",
    notes:       "Opción local inmediata. Requiere sierra de corte o servicio de corte Leroy (~€5/corte).",
  },
  {
    id:         "chapa-schmiedekult",
    category:   "Tablero base",
    item:        "Chapa acero magnético 0.5mm 780×390mm",
    supplier:    "Schmiedekult.de",
    country:     "DE",
    priceEUR:    23.77,      // precio estimado para pieza custom 780×390mm
    priceUnit:   "ud",
    moq:         1,
    leadTimeDays: 7,
    status:      "estimated",
    source:      "Schmiedekult.de — envío a España confirmado. Precio estimado para pieza custom.",
    notes:       "Precio alto por pieza custom. Buscar proveedor local Málaga o cotizar en Evek.red (España). PENDIENTE cotización real.",
  },
  {
    id:         "chapa-evek",
    category:   "Tablero base",
    item:        "Chapa acero galvanizado 0.5mm (bobina/plancha)",
    supplier:    "Evek.red",
    country:     "ES",
    priceEUR:    5.50,       // estimado por pieza cortada a 780×390mm
    priceUnit:   "ud",
    moq:         null,
    status:      "pending",
    source:      "Evek.red España — distribuidor chapa industrial. Precio PENDIENTE cotización.",
    notes:       "Alternativa local a Schmiedekult. Pueden tener plancha continua más barata que corte custom. Pedir precio chapa magnética 0.5mm x 780×390mm.",
  },

  // ─── MARCOS (para Heartframes) ────────────────────────────────────────────
  {
    id:         "frame-bgastore-a4",
    category:   "Marcos",
    item:        "Marco madera A4 (21×30cm)",
    supplier:    "BGASTORE.es",
    country:     "ES",
    priceEUR:    8.46,       // precio mínimo encontrado en web
    priceUnit:   "ud",
    moq:         1,
    leadTimeDays: 3,
    status:      "confirmed",
    source:      "bgastore.es — precio web verificado. Rango €8.46-12.95 según modelo.",
    notes:       "Compatible con HF Standard. Precio retail. Preguntar precio mayorista a info@bgastore.es.",
  },
  {
    id:         "frame-bgastore-3040",
    category:   "Marcos",
    item:        "Marco madera 30×40cm",
    supplier:    "BGASTORE.es",
    country:     "ES",
    priceEUR:    8.92,       // precio mínimo encontrado
    priceUnit:   "ud",
    moq:         1,
    leadTimeDays: 3,
    status:      "confirmed",
    source:      "bgastore.es — precio web €8.92-19.95 según acabado. Compatible HF Medium.",
    notes:       "El frame NO lo vendemos nosotros — el cliente aporta su marco. Esto es referencia para guía de compatibilidad.",
  },
  {
    id:         "frame-dismafoto-a4",
    category:   "Marcos",
    item:        "Marco básico A4 blanco/negro",
    supplier:    "Dismafoto.es",
    country:     "ES",
    priceEUR:    2.47,
    priceUnit:   "ud",
    moq:         1,
    leadTimeDays: 3,
    status:      "confirmed",
    source:      "Dismafoto.es — precio web verificado €2.47 para marco A4 básico",
    notes:       "Marco de entrada. Peso ~200g. Compatible HF Standard. Útil para packs de regalo económicos.",
  },
  {
    id:         "frame-cn-wood",
    category:   "Marcos",
    item:        "Marco madera estándar (China wholesale)",
    supplier:    "Caoxian Woodwork / Alibaba",
    country:     "CN",
    priceEUR:    parseFloat((0.90 * USD_EUR).toFixed(2)),   // ~$0.81-0.99 USD
    priceUnit:   "ud",
    moq:         500,
    leadTimeDays: 30,
    status:      "estimated",
    source:      "Alibaba search — Caoxian woodwork $0.79/ud; quality frames $0.81-0.99 at MOQ 500+",
    notes:       "Solo relevante si decidimos vender packs con marco incluido (decisión pendiente). MOQ alto para lanzamiento.",
  },

  // ─── ACCESORIOS ───────────────────────────────────────────────────────────
  {
    id:         "acc-wing-terrence",
    category:   "Accesorios",
    item:        "Wing (estante magnético)",
    supplier:    "Terrence CIF Málaga",
    country:     "ES",
    priceEUR:    parseFloat((2.80 * USD_EUR).toFixed(2)),
    priceUnit:   "ud",
    moq:         50,
    status:      "confirmed",
    source:      "Terrence cotización confirmada — $2.80 USD, MOQ 50 ud/modelo",
    notes:       "PVP sugerido €18-25. Margen ~88%.",
  },
  {
    id:         "acc-nest-terrence",
    category:   "Accesorios",
    item:        "Nest (organizador magnético)",
    supplier:    "Terrence CIF Málaga",
    country:     "ES",
    priceEUR:    parseFloat((4.14 * USD_EUR).toFixed(2)),
    priceUnit:   "ud",
    moq:         50,
    status:      "confirmed",
    source:      "Terrence cotización confirmada",
    notes:       "PVP sugerido €25-35.",
  },
  {
    id:         "acc-craw-terrence",
    category:   "Accesorios",
    item:        "Craw (rail magnético)",
    supplier:    "Terrence CIF Málaga",
    country:     "ES",
    priceEUR:    parseFloat((1.07 * USD_EUR).toFixed(2)),
    priceUnit:   "ud",
    moq:         50,
    status:      "confirmed",
    source:      "Terrence cotización confirmada",
    notes:       "PVP sugerido €12-18.",
  },
  {
    id:         "acc-pins-terrence",
    category:   "Accesorios",
    item:        "Pins (set 5 pins magnéticos)",
    supplier:    "Terrence CIF Málaga",
    country:     "ES",
    priceEUR:    parseFloat((0.84 * USD_EUR).toFixed(2)),
    priceUnit:   "set5",
    moq:         50,
    status:      "confirmed",
    source:      "Terrence cotización confirmada — $0.84 USD/set5",
    notes:       "PVP sugerido €15-20/set. Margen >90%.",
  },

  // ─── CONSUMIBLES ─────────────────────────────────────────────────────────
  {
    id:         "vhb-3m",
    category:   "Consumibles",
    item:        "Cinta VHB 3M (rollo 19mm×33m)",
    supplier:    "Amazon / Ferretería",
    country:     "ES",
    priceEUR:    18.00,      // precio Amazon ES estimado
    priceUnit:   "rollo",
    moq:         1,
    leadTimeDays: 2,
    status:      "estimated",
    source:      "Amazon.es estimado — rollo VHB 3M 19mm ~€15-20",
    notes:       "Para pegar chapa al MDF. ~50 tableros por rollo.",
  },
  {
    id:         "rubber-pad-eva",
    category:   "Consumibles",
    item:        "Pad EVA autoadhesivo (para Heartframe)",
    supplier:    "AliExpress / Amazon",
    country:     "CN/ES",
    priceEUR:    0.10,
    priceUnit:   "ud",
    moq:         100,
    status:      "estimated",
    source:      "AliExpress — self-adhesive EVA foam pads ~€0.10-0.20/ud en lote 100+",
    notes:       "OBLIGATORIO en dorso de cada Heartframe para coeficiente de cizalla 0.65. Sin pad, la carga segura baja ~35%.",
  },
  {
    id:         "epoxy-rapido",
    category:   "Consumibles",
    item:        "Epoxy rápido (pistola 50ml)",
    supplier:    "Amazon / Leroy",
    country:     "ES",
    priceEUR:    8.00,
    priceUnit:   "ud",
    moq:         1,
    leadTimeDays: 2,
    status:      "estimated",
    source:      "Amazon.es — epoxy bicomponente pistola ~€6-10",
    notes:       "Para fijar imanes en ALIGN. ~42 tableros por cartucho 50ml a 336 puntos/tablero.",
  },
  {
    id:         "filamento-pla",
    category:   "Consumibles",
    item:        "Filamento PLA rígido 1kg (Bambu Lab)",
    supplier:    "Bambu Lab Store",
    country:     "ES",
    priceEUR:    22.00,
    priceUnit:   "kg",
    moq:         1,
    leadTimeDays: 3,
    status:      "estimated",
    source:      "Bambu Lab store ~€20-25/kg PLA",
    notes:       "Para molde posicionador (~€5 único) y Heartframes (~€0.50/ud PLA). 1kg = ~50 HF Standard.",
  },
];

// Helpers para filtrar el catálogo
export const suppliersByCategory = (cat: string) =>
  SUPPLIERS_CATALOG.filter(s => s.category === cat);

export const suppliersByStatus = (status: SupplierStatus) =>
  SUPPLIERS_CATALOG.filter(s => s.status === status);

export const SUPPLIER_CATEGORIES = [...new Set(SUPPLIERS_CATALOG.map(s => s.category))];

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
    title: "Chapa magnética — cotización real urgente",
    desc: "Schmiedekult.de (DE) y Evek.red (ES) identificados. Schmiedekult ~€23.77/ud custom — caro. Evek.red puede ser mucho más barato a granel. Objetivo: <€6/ud. Precio actual en P&L es solo estimado €5.50.",
    impact: "alto",
    action: "Email a Evek.red con especificación: chapa acero laminado magnético 0.5mm, 780×390mm cortado. Pedir precio 20 / 100 / 500 ud. Si >€8/ud buscar en Málaga industria metálica.",
  },
  {
    id: "mdf-price-confirm",
    title: "MDF 8mm — confirmar precio exacto en TOSIZE.es",
    desc: "TOSIZE.es ofrece corte a medida gratuito, precio en configurador. Estimado €2-4/ud. Leroy Merlin tablero completo ~€17 da ~8 piezas = €2.1/ud más corte.",
    impact: "medio",
    action: "Configurar en TOSIZE.es: MDF 8mm, 780×390mm, cantidad 20. Anotar precio exacto y comparar con Leroy.",
  },
  {
    id: "frame-wholesale",
    title: "Marcos para packs — ¿incluir o que el cliente traiga el suyo?",
    desc: "BGASTORE.es confirmado €8.46-12.95 retail. Dismafoto.es €2.47 básico. Caoxian CN $0.90/ud (MOQ 500). Si incluimos marcos en packs, el ticket sube €8-15 pero reduce fricción.",
    impact: "medio",
    action: "Decidir si los packs incluyen marco o no. Si sí: email a info@bgastore.es para precio mayorista y evaluar Caoxian para escala.",
  },
  {
    id: "mold-design",
    title: "Diseñar e imprimir molde posicionador en Bambu",
    desc: "El molde 30mm grid × 336 huecos D5 es la clave del nuevo proceso. PLA rígido, 780×390mm (o varios segmentos encajables). Tolerancia: ±0.5mm en hueco D5 para que los imanes encajen y salgan limpio.",
    impact: "alto",
    action: "Modelar en Fusion 360 / FreeCAD. Hacer prueba de ajuste con imanes reales antes de escalar.",
  },
];

// ── HEARTFRAME — EL CUADRO MAGNÉTICO CON NFC ──────────────────────────────────
// El Heartframe ES el producto que lleva el chip NFC. No va en el tablero base.
// Es un soporte trasero impreso en PLA/cerámica/MDF que convierte cualquier
// marco estándar en un cuadro magnético inteligente que se cuelga sobre ALIGN.
// El cliente compra: marco (Roble / BGA / cualquiera) + Heartframe → cuadro NFC listo.
// Ver HEARTFRAME_VARIANTS para el catálogo completo (HF-S / HF-M / HF-L / HF-XL).
export const HEARTFRAME_PVP    = 35;           // precio HF Standard (referencia)
export const HEARTFRAME_COST_EUR = HEARTFRAME_VARIANTS[0].costEUR;
export const HEARTFRAME_MARGIN = Math.round(
  ((HEARTFRAME_PVP - HEARTFRAME_COST_EUR) / HEARTFRAME_PVP) * 100,
);

// ── PACKS ─────────────────────────────────────────────────────────────────────
// Qué lleva cada pack:
//   base        → tablero ALIGN o FREE con perfil SEG + 1 tela City Fabrics incluida
//   heartframes → array de HF variants incluidas (cuadros magnéticos con NFC)
//   accessories → accesorios extra (Wing, Nest, Pins…)
//
// La tela es siempre 1 (incluida en el marco). La gente prefiere cuadros a telas extra.
// El Heartframe convierte cualquier marco del cliente en un cuadro NFC inteligente.
// La tela extra se puede pedir/añadir como accesorio, pero no va en los packs base.

const _pvpALIGN = PVP_ALIGN;  // [299, 499, 699, 1299, 1699, 2499]
const _pvpFREE  = PVP_FREE;   // [199, 299, 449, 899, 1199, 1799]
const _hfS      = 35;         // HF Standard PVP
const _hfM      = 42;         // HF Medium PVP
const _hfL      = 55;         // HF Large PVP

export const PACKS = [
  {
    id: "starter",
    name: "Starter",
    tagline: "Descubre el sistema",
    pvp: 199,
    base: { size: "Brilliant", variant: "FREE", basePvp: _pvpFREE[0] },
    heartframes: [] as Array<{ model: string; pvp: number }>,
    accessories: [] as string[],
    saving: 0,
    target: "Primera compra · mínimo riesgo",
    note: "Sin imanes — la decoración es la tela City Fabrics (incluida). El cliente no puede colgar cuadros magnéticos, pero puede ver si el marco y el acabado le convencen antes de invertir en ALIGN.",
  },
  {
    id: "essential",
    name: "Essential",
    tagline: "Tu primer cuadro magnético",
    pvp: 319,
    base: { size: "Brilliant", variant: "ALIGN", basePvp: _pvpALIGN[0] },
    heartframes: [{ model: "HF Standard", pvp: _hfS }],
    accessories: [] as string[],
    saving: _pvpALIGN[0] + _hfS - 319,  // 299 + 35 - 319 = 15€
    target: "Regalo · despacho · dormitorio",
    note: "El Heartframe incluido convierte el primer marco del cliente en un cuadro NFC. Pega una foto en cualquier marco de 20×20 o similar, adhiere el Heartframe al dorso, y lo cuelga magnéticamente.",
  },
  {
    id: "living",
    name: "Living",
    tagline: "Una pared, tres historias",
    pvp: 579,
    base: { size: "Joy", variant: "ALIGN", basePvp: _pvpALIGN[1] },
    heartframes: [
      { model: "HF Standard", pvp: _hfS },
      { model: "HF Standard", pvp: _hfS },
      { model: "HF Standard", pvp: _hfS },
    ],
    accessories: [] as string[],
    saving: _pvpALIGN[1] + 3 * _hfS - 579,  // 499 + 105 - 579 = 25€
    target: "Salón · recibidor · regalo premium de vivienda",
    note: "Joy (832×832mm) admite cómodamente 3–4 cuadros. Los 3 HF Standard incluidos son para fotos y cuadros ligeros hasta ~25×30cm. El cliente llena la pared desde el primer día.",
  },
  {
    id: "living-pro",
    name: "Living Pro",
    tagline: "Para cuadros más grandes",
    pvp: 639,
    base: { size: "Joy", variant: "ALIGN", basePvp: _pvpALIGN[1] },
    heartframes: [
      { model: "HF Standard", pvp: _hfS },
      { model: "HF Medium",   pvp: _hfM },
      { model: "HF Medium",   pvp: _hfM },
    ],
    accessories: [] as string[],
    saving: _pvpALIGN[1] + _hfS + 2 * _hfM - 639,  // 499 + 35 + 84 - 639 = -21€ (sin saving)
    target: "Salón con cuadros medianos · 30×40cm · madera sólida",
    note: "Los 2 HF Medium soportan cuadros hasta ~30×40cm (850g). El HF Standard para una foto pequeña o postal. Ideal si el cliente ya tiene cuadros de calidad que quiere reutilizar.",
  },
  {
    id: "studio",
    name: "Studio",
    tagline: "El lienzo del diseñador",
    pvp: 849,
    base: { size: "Abundant", variant: "ALIGN", basePvp: _pvpALIGN[2] },
    heartframes: [
      { model: "HF Standard", pvp: _hfS },
      { model: "HF Standard", pvp: _hfS },
      { model: "HF Medium",   pvp: _hfM },
      { model: "HF Medium",   pvp: _hfM },
    ],
    accessories: ["pins"],
    saving: _pvpALIGN[2] + 2 * _hfS + 2 * _hfM + 18 - 849,  // 699+70+84+18 - 849 = 22€
    target: "Interioristas · showrooms · presentación a cliente",
    note: "Abundant (1.222×832mm) — espacio para 4–6 cuadros. Mix de HF-S (fotos, referencias pequeñas) y HF-M (cuadros de muestra 30×40). Los Pins organizan tarjetas y etiquetas de proyecto.",
  },
  {
    id: "statement",
    name: "Statement Wall",
    tagline: "Una pared que lo dice todo",
    pvp: 1490,
    base: { size: "Nova", variant: "ALIGN", basePvp: _pvpALIGN[3] },
    heartframes: [
      { model: "HF Standard", pvp: _hfS },
      { model: "HF Standard", pvp: _hfS },
      { model: "HF Medium",   pvp: _hfM },
      { model: "HF Medium",   pvp: _hfM },
      { model: "HF Large",    pvp: _hfL },
    ],
    accessories: ["wing", "nest"],
    saving: _pvpALIGN[3] + 2*_hfS + 2*_hfM + _hfL + 25 + 30 - 1490, // 1299+70+84+55+55 - 1490 = 73€
    target: "Oficina · recepción · hotel · café · retail",
    note: "Nova (1.222×1.612mm) = 6 paneles. Los 5 Heartframes llenan la pared con una galería real: fotos pequeñas, cuadros medianos y un cuadro grande central (HF-L hasta ~50×60cm). Wing y Nest añaden función decorativa.",
  },
];
