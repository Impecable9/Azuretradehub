// ─────────────────────────────────────────────────────────────────────────────
// STRATEGY DATA — shared between server and client components
// Actualizado 2026-03: nuevo proceso sin perforar (MDF plano + chapa + molde Bambu)
// NFC chip va en Heartframes, NO en tablero base.
// ─────────────────────────────────────────────────────────────────────────────

const SIZES = ["Brilliant", "Joy", "Abundant", "Nova", "Luna", "Gea"];
const PANELS = [1, 2, 3, 6, 8, 12];

const PERFIL_ES  = [26.50, 41.60, 52.00, 72.80, 83.20, 93.60];
const PERFIL_CN  = [2.76,  4.60,  5.52,  7.36,  9.20,  11.96];
const TELA       = [3.22,  6.08,  9.12,  18.00, 29.00, 43.00];
const ASSEMBLY   = PANELS.map(p => p * 12.50);  // 50 min/panel @ €15/h = €12.50 (vs 7.50 antiguo con perforado)
const PACKAGING  = [4, 5, 6, 8, 10, 15];

// Nuevo BOM por panel:
// ALIGN: MDF €2.50 + chapa €5.50 + VHB €0.64 + imanes 336×€0.055 = €27.12 + epoxy €0.80 + mold €0.10 = €28.02
// FREE:  MDF €2.50 + chapa €5.50 + VHB €0.64 = €8.64
const ALIGN_MAT = PANELS.map(p => p * 28.02);
const FREE_MAT  = PANELS.map(p => p * 8.64);

const alignES  = SIZES.map((_, i) => ALIGN_MAT[i] + PERFIL_ES[i] + TELA[i] + ASSEMBLY[i] + PACKAGING[i]);
const alignCN  = SIZES.map((_, i) => ALIGN_MAT[i] + PERFIL_CN[i] + TELA[i] + ASSEMBLY[i] + PACKAGING[i]);
const freeES   = SIZES.map((_, i) => FREE_MAT[i]  + PERFIL_ES[i] + TELA[i] + ASSEMBLY[i] + PACKAGING[i]);

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
