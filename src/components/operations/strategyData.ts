// ─────────────────────────────────────────────────────────────────────────────
// STRATEGY DATA — shared between server and client components
// ─────────────────────────────────────────────────────────────────────────────

const SIZES = ["Brilliant", "Joy", "Abundant", "Nova", "Luna", "Gea"];
const PANELS = [1, 2, 3, 6, 8, 12];

const PERFIL_ES  = [26.50, 41.60, 52.00, 72.80, 83.20, 93.60];
const PERFIL_CN  = [2.76,  4.60,  5.52,  7.36,  9.20,  11.96];
const MDF_MAG    = PANELS.map(p => p * 23.63);
const TELA       = [3.22,  6.08,  9.12,  18.00, 29.00, 43.00];
const ASSEMBLY   = PANELS.map(p => p * 7.50);
const PACKAGING  = [4, 5, 6, 8, 10, 15];

const alignES  = SIZES.map((_, i) => MDF_MAG[i] + PERFIL_ES[i] + TELA[i] + ASSEMBLY[i] + PACKAGING[i]);
const alignCN  = SIZES.map((_, i) => MDF_MAG[i] + PERFIL_CN[i] + TELA[i] + ASSEMBLY[i] + PACKAGING[i]);
const freeES   = SIZES.map((_, i) => {
  const mdfFree = PANELS[i] * 9.25;
  return mdfFree + PERFIL_ES[i] + TELA[i] + ASSEMBLY[i] + PACKAGING[i];
});

const PVP_ALIGN = [299, 499, 699, 1299, 1699, 2499];
const PVP_FREE  = [199, 299, 449,  899, 1199, 1799];

export const STRATEGY_TABLE = SIZES.map((size, i) => ({
  size,
  panels: PANELS[i],
  cAlignES:    Math.round(alignES[i]),
  cAlignCN:    Math.round(alignCN[i]),
  cFreeES:     Math.round(freeES[i]),
  pvpAlign:    PVP_ALIGN[i],
  pvpFree:     PVP_FREE[i],
  marginAlign: Math.round(((PVP_ALIGN[i] - alignES[i]) / PVP_ALIGN[i]) * 100),
  marginFree:  Math.round(((PVP_FREE[i]  - freeES[i])  / PVP_FREE[i])  * 100),
  switchToCNAt: `${Math.ceil(40 / PANELS[i])} pedidos`,
}));
