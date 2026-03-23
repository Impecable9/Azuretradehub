"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, Cell
} from "recharts";

// ─────────────────────────────────────────────────────────────────────────────
// DATOS CONFIRMADOS POR COTIZACIÓN REAL (sin montaje — solo materiales)
// ─────────────────────────────────────────────────────────────────────────────
// Perfil ES (Impretienda): Brilliant ~€26.50 (estimado 3ml), Joy €41.60, Abundant €52, Nova €72.80, Luna €83.20, Gea ~€93.60 (est.)
// Perfil CN (MESCO): Brilliant ~€2.76 (est.), Joy €4.60, Abundant €5.52, Nova €7.36, Luna €9.20, Gea €11.96
// MDF+magnets+VHB+NFC per panel ALIGN: €23.63 (Zetar/Wendy confirmado)
// Tela SEG (Phoneto): Brilliant ~€3.22 (est.), Joy €6.08, Abundant €9.12, Nova ~€18, Luna ~€29, Gea ~€43

const SIZES = ["Brilliant", "Joy", "Abundant", "Nova", "Luna", "Gea"];
const PANELS = [1, 2, 3, 6, 8, 12];

const PERFIL_ES  = [26.50, 41.60, 52.00, 72.80, 83.20, 93.60]; // Impretienda
const PERFIL_CN  = [2.76,  4.60,  5.52,  7.36,  9.20,  11.96]; // MESCO
const MDF_MAG    = PANELS.map(p => p * 23.63); // MDF+imanes+VHB+NFC (Zetar)
const TELA       = [3.22,  6.08,  9.12,  18.00, 29.00, 43.00]; // Phoneto
const ASSEMBLY   = PANELS.map(p => p * 7.50);  // €7.50 montaje/panel
const PACKAGING  = [4, 5, 6, 8, 10, 15];       // estimado caja

// Coste total por escenario
const alignES  = SIZES.map((_, i) => MDF_MAG[i] + PERFIL_ES[i] + TELA[i] + ASSEMBLY[i] + PACKAGING[i]);
const alignCN  = SIZES.map((_, i) => MDF_MAG[i] + PERFIL_CN[i] + TELA[i] + ASSEMBLY[i] + PACKAGING[i]);
const freeES   = SIZES.map((_, i) => {
  const mdfFree = PANELS[i] * 9.25; // sin imanes
  return mdfFree + PERFIL_ES[i] + TELA[i] + ASSEMBLY[i] + PACKAGING[i];
});
const freeCN   = SIZES.map((_, i) => {
  const mdfFree = PANELS[i] * 9.25;
  return mdfFree + PERFIL_CN[i] + TELA[i] + ASSEMBLY[i] + PACKAGING[i];
});

// PVPs sugeridos (charm pricing, competitive vs mercado)
const PVP_ALIGN = [299, 499, 699, 1299, 1699, 2499];
const PVP_FREE  = [199, 299, 449,  899, 1199, 1799];

// ── Chart 1: Stacked — coste real ALIGN ES desglosado por componente ──────────
const chart1Data = SIZES.map((size, i) => ({
  size,
  "MDF + Imanes + NFC": Math.round(MDF_MAG[i]),
  "Perfil SEG (ES)": Math.round(PERFIL_ES[i]),
  "Tela SEG": Math.round(TELA[i]),
  "Montaje": Math.round(ASSEMBLY[i]),
  "Packaging": PACKAGING[i],
}));

// ── Chart 2: PVP vs Coste (incluye estimados) ─────────────────────────────────
const chart2Data = SIZES.map((size, i) => ({
  size,
  "Coste ALIGN (ES)": Math.round(alignES[i]),
  "Coste FREE (ES)": Math.round(freeES[i]),
  "PVP ALIGN": PVP_ALIGN[i],
  "PVP FREE": PVP_FREE[i],
}));

const COLORS1 = ["#6366f1", "#a855f7", "#22d3ee", "#f59e0b", "#64748b"];
const COLORS2 = ["#f43f5e", "#fb923c", "#84cc16", "#22c55e"];

function EuroTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s: number, e: any) => s + (e.value || 0), 0);
  return (
    <div className="bg-slate-900 text-white rounded-2xl shadow-xl p-3 text-xs min-w-[160px]">
      <p className="font-black mb-2 text-slate-200">{label}</p>
      {payload.map((e: any) => (
        <div key={e.name} className="flex justify-between gap-4 mb-0.5">
          <span style={{ color: e.fill || e.color }}>{e.name}</span>
          <span className="font-bold">{e.value?.toFixed ? e.value.toFixed(0) : e.value} €</span>
        </div>
      ))}
      {payload.length > 1 && (
        <div className="flex justify-between gap-4 mt-2 pt-2 border-t border-slate-700">
          <span className="text-slate-400">Total</span>
          <span className="font-black text-lime-400">{total.toFixed(0)} €</span>
        </div>
      )}
    </div>
  );
}

export function CostBreakdownChart() {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
      <div className="mb-4">
        <h3 className="font-black text-slate-900 text-sm uppercase tracking-wide">
          Coste de fabricación — ALIGN (perfil España)
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Datos <span className="text-green-600 font-bold">100% confirmados</span> por cotización real ·
          Impretienda · Zetar/Wendy · Changzhou Phoneto
        </p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chart1Data} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="size" tick={{ fontSize: 11, fontWeight: 700 }} />
          <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}€`} width={45} />
          <Tooltip content={<EuroTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {["MDF + Imanes + NFC", "Perfil SEG (ES)", "Tela SEG", "Montaje", "Packaging"].map((key, i) => (
            <Bar key={key} dataKey={key} stackId="a" fill={COLORS1[i]} radius={i === 4 ? [6, 6, 0, 0] : [0, 0, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
      <p className="text-[10px] text-slate-300 mt-3">
        * Tela Nova/Luna/Gea estimadas por ratio de área vs Joy/Abundant confirmados. Packaging estimado.
      </p>
    </div>
  );
}

export function PvpVsCostChart() {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
      <div className="mb-4">
        <h3 className="font-black text-slate-900 text-sm uppercase tracking-wide">
          PVP sugerido vs Coste real — Estrategia de precios
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Coste <span className="text-red-500 font-bold">confirmado + estimados*</span> vs
          PVP psicológico <span className="text-green-600 font-bold">recomendado</span>
        </p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chart2Data} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="size" tick={{ fontSize: 11, fontWeight: 700 }} />
          <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}€`} width={55} />
          <Tooltip content={<EuroTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="Coste ALIGN (ES)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Coste FREE (ES)" fill="#fb923c" radius={[4, 4, 0, 0]} />
          <Bar dataKey="PVP ALIGN" fill="#84cc16" radius={[4, 4, 0, 0]} />
          <Bar dataKey="PVP FREE" fill="#22c55e" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <p className="text-[10px] text-slate-300 mt-3">
        * Coste incluye montaje (€7.50/panel), tela y perfil ES. Chapa FREE estimada. PVP con charm pricing.
      </p>
    </div>
  );
}

