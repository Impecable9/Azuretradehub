"use client";

import { useState, useMemo, useRef } from "react";
import { TrendingUp, Package, Zap, Info, ChevronRight, X } from "lucide-react";

type Size = {
  name: string;
  dims: string;
  panels: number;
  mdfUnits: number;
  chapaMm2: number;
  perfil_m: number;
  tela_m2: number;
};

type UnitCosts = {
  mdf_panel:   number | null;
  chapa_m2:    number | null;
  perfil_m:    number | null;
  tela_m2:     number | null;
  iman_ud:     number | null;
  epoxy_panel: number | null;  // por tablero ALIGN (NFC chip va en Heartframe, no aquí)
  silicona_m:  number | null;
};

type Props = {
  sizes: readonly Size[];
  unitCosts: UnitCosts;
  imanesPerPanel: number;
};

// Market reference prices (EUR) — wall-mounted, non-backlit, slim (<3cm) SEG frame systems only.
// Backlit/lightbox systems excluded: they require 5–10cm depth (incompatible format).
// Sources: SquareSigns (US), Modnetix stretch fabric wall (US), WhiteWall magnetic frame (EU)
const MARKET_REF: Record<string, { low: number; high: number; note: string }> = {
  Brilliant: { low: 100,  high: 185,  note: "SquareSigns SEG 24\"×36\" (~$111–200) · marco magnético WhiteWall" },
  Joy:       { low: 150,  high: 280,  note: "SquareSigns SEG 36\"×36\" (~$200) · 2 marcos WhiteWall" },
  Abundant:  { low: 230,  high: 370,  note: "SEG marco pared 48\"×36\" sin luz · estimación mercado" },
  Nova:      { low: 400,  high: 650,  note: "SEG multi-panel pared sin luz · sin NFC ni magnética" },
  Luna:      { low: 550,  high: 900,  note: "Sistemas SEG pared grandes formato sin retroiluminación" },
  Gea:       { low: 800,  high: 1400, note: "SEG mural pared sin luz · sin modularidad magnética" },
};

// Psychological pricing: snap to nearest "charm" price
function charmPrice(cost: number, marginPct: number): number {
  const raw = cost * (1 + marginPct / 100);
  // Find nearest charm endings: x9, x49, x99, x149, x199...
  const charms = [9, 19, 29, 39, 49, 59, 69, 79, 89, 99,
                  119, 139, 149, 159, 179, 199, 249, 299,
                  349, 399, 449, 499, 549, 599, 649, 699,
                  749, 799, 849, 899, 949, 999,
                  1099, 1199, 1299, 1399, 1499, 1599, 1699,
                  1799, 1899, 1999, 2099, 2199, 2299, 2399, 2499,
                  2699, 2899, 2999, 3299, 3499, 3999];
  return charms.find((c) => c >= raw) ?? Math.ceil(raw / 100) * 100 - 1;
}

const PACKS = [
  {
    name: "Starter",
    icon: "🌱",
    desc: "Primer impacto visual. Ideal para probar.",
    sizes: ["Brilliant"],
    accessories: ["Pins"],
    badge: null,
  },
  {
    name: "Studio",
    icon: "✨",
    desc: "El favorito. Equilibrio perfecto de precio e impacto.",
    sizes: ["Joy"],
    accessories: ["The Wing", "Pins"],
    badge: "Más vendido",
  },
  {
    name: "Business",
    icon: "🏢",
    desc: "Para espacios profesionales con storytelling de marca.",
    sizes: ["Abundant"],
    accessories: ["The Wing", "The Nest", "Pins"],
    badge: null,
  },
  {
    name: "Gallery",
    icon: "🖼",
    desc: "Instalación envolvente para hoteles y showrooms.",
    sizes: ["Nova"],
    accessories: ["The Wing", "The Nest", "The Craw", "Pins"],
    badge: "Recomendado B2B",
  },
  {
    name: "Flagship",
    icon: "🚀",
    desc: "Experiencia inmersiva. El buque insignia de la colección.",
    sizes: ["Luna"],
    accessories: ["The Wing", "The Nest", "The Craw", "Pins", "Marco Roble Fino"],
    badge: null,
  },
  {
    name: "Museum",
    icon: "🏛",
    desc: "Instalación escenográfica de máximo impacto.",
    sizes: ["Gea"],
    accessories: ["The Wing", "The Nest", "The Craw", "Pins", "Marco Roble Fino", "Marco BGA Classic"],
    badge: "Premium",
  },
];

// ============================================================
// REAL COSTS FROM SUPPLIER QUOTES (updated 2026-03)
// ============================================================
// Magnets: Zetar/Wendy quote 2025-11-18
//   D5×2mm N52 (ALIGN panel): $0.060/ud = €0.055
//   D5×6mm N52 (Heartframe): $0.098/ud = €0.090
//   D5×3mm N52 (accessories, estimated between): ~$0.075/ud = €0.069
// Metal parts: Terrence Ningbo 2025-11-04 @ 50 pcs CIF Malaga (includes shipping)
//   The Wing (45 mag): $2.80 = €2.58
//   The Nest (21 mag): $4.14 = €3.81
//   The Craw L21H (21 mag): $1.07 = €0.99
//   Heartframe L9 (9 mag): $0.84 = €0.77
//   The Pins Hook (1 mag): $1.15 = €1.06
// Acrylic backs: Yitianfeng @ 50 pcs EXW China
//   Wing back: $1.86 = €1.71
//   Nest back: $0.64 = €0.59
//   Heartframe back: $0.50 = €0.46
// Magnets per accessory at €0.069/ud:
//   Wing: 45×0.069 = €3.11
//   Nest/Craw: 21×0.069 = €1.45
//   Heartframe: 9×0.069 = €0.62
//   Pins: 1×0.069 = €0.07
// TOTAL assembled (industrial, incl. shipping):
const IMAN_D5x3_EUR = 0.069;

const ACCESSORY_COSTS: Record<string, number> = {
  // Industrial metal variant (Terrence CIF Malaga @ 50pcs + acrylic back + magnets)
  "The Wing":       2.58 + 1.71 + 45 * IMAN_D5x3_EUR,  // €7.41 — steel front + acrylic back + 45 imanes D5×3mm
  "The Nest":       3.81 + 0.59 + 21 * IMAN_D5x3_EUR,  // €5.85 — steel front + acrylic back + 21 imanes D5×3mm
  "The Craw":       0.99 + 0.59 + 21 * IMAN_D5x3_EUR,  // €3.03 — L bracket 21H + acrylic back + 21 imanes D5×3mm
  "Pins":           1.06 + 0.30 +  1 * IMAN_D5x3_EUR,  // €1.43 — hook + tiny acrylic + 1 imán D5×3mm
  "Heartframe":     0.77 + 0.46 +  9 * IMAN_D5x3_EUR,  // €1.85 — L9 steel + acrylic back + 9 imanes D5×3mm
  // Sourced externally (bgastore.es)
  "Marco Roble Fino":  19.95,
  "Marco BGA Classic": 12.95,
  "Vidrio Museo UV70": 64.95,
};

export function PricingClient({ sizes, unitCosts, imanesPerPanel }: Props) {
  const [variant, setVariant] = useState<"FREE" | "ALIGN">("ALIGN");
  const [margin, setMargin] = useState(60); // 60% default margin
  const [showPsych, setShowPsych] = useState(true);
  const [selectedPack, setSelectedPack] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const breakdownRef = useRef<HTMLDivElement>(null);

  // Local editable costs (start from DB values)
  const [costs, setCosts] = useState<UnitCosts>({ ...unitCosts });

  function updateCost(key: keyof UnitCosts, val: string) {
    setCosts((prev) => ({ ...prev, [key]: val === "" ? null : parseFloat(val) || null }));
  }

  // Compute BOM cost per size and variant
  function computeCost(size: Size, v: "FREE" | "ALIGN"): { total: number | null; breakdown: Record<string, number | null> } {
    const chapa_area = size.chapaMm2 / 1_000_000; // m²
    const breakdown: Record<string, number | null> = {
      "MDF": costs.mdf_panel != null ? costs.mdf_panel * size.mdfUnits : null,
      "Chapa acero": costs.chapa_m2 != null ? costs.chapa_m2 * chapa_area : null,
      "Perfil SEG": costs.perfil_m != null ? costs.perfil_m * size.perfil_m : null,
      "Silicona SEG": costs.silicona_m != null ? costs.silicona_m * size.perfil_m : null,
      "Tela SEG": costs.tela_m2 != null ? costs.tela_m2 * size.tela_m2 : null,
    };

    if (v === "ALIGN") {
      const imanCount = imanesPerPanel * size.panels;
      breakdown["Imanes N52"] = costs.iman_ud != null ? costs.iman_ud * imanCount : null;
      breakdown["Epoxy"] = costs.epoxy_panel != null ? costs.epoxy_panel * size.panels : null;
    }

    const values = Object.values(breakdown);
    const hasNull = values.some((v) => v === null);
    const total = hasNull ? null : values.reduce((a, v) => a! + v!, 0);
    return { total, breakdown };
  }

  const sizeData = useMemo(() => {
    return sizes.map((size) => {
      const { total, breakdown } = computeCost(size, variant);
      const pvp = total != null ? (showPsych ? charmPrice(total, margin) : Math.round(total * (1 + margin / 100))) : null;
      const profit = pvp != null && total != null ? pvp - total : null;
      const realMargin = pvp != null && total != null ? ((pvp - total) / pvp) * 100 : null;
      return { size, total, breakdown, pvp, profit, realMargin };
    });
  }, [sizes, variant, margin, costs, showPsych]);

  const allHaveCost = sizeData.every((d) => d.total !== null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Precios y Margen</h1>
          <p className="text-sm text-slate-400 mt-1">Coste de fabricación · PVP sugerido · Análisis por pack</p>
        </div>
        {/* Variant toggle */}
        <div className="flex items-center gap-1 bg-white rounded-2xl p-1.5 border border-slate-100 shadow-sm">
          <button
            onClick={() => setVariant("FREE")}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${variant === "FREE" ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
          >
            FREE
          </button>
          <button
            onClick={() => setVariant("ALIGN")}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${variant === "ALIGN" ? "bg-violet-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
          >
            ALIGN ✦
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4 flex items-center gap-6 flex-wrap">
        <div className="flex items-center gap-3">
          <label className="text-xs font-black text-slate-400 uppercase tracking-wide">Margen objetivo</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={20}
              max={200}
              step={5}
              value={margin}
              onChange={(e) => setMargin(Number(e.target.value))}
              className="w-32"
            />
            <span className="text-xl font-black text-slate-900 w-14 tabular-nums">{margin}%</span>
          </div>
        </div>
        <div className="h-8 w-px bg-slate-200" />
        <button
          onClick={() => setShowPsych(!showPsych)}
          className={`flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-xl transition-colors ${
            showPsych ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-500"
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          Precio psicológico {showPsych ? "ON" : "OFF"}
        </button>
        {!allHaveCost && (
          <div className="flex items-center gap-1.5 text-xs text-orange-600 bg-orange-50 px-3 py-2 rounded-xl">
            <Info className="w-3.5 h-3.5" />
            Algunos costes están pendientes de RFQ
          </div>
        )}
      </div>

      {/* Unit costs editor */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Costes unitarios · Editar</h2>
        <div className="grid grid-cols-4 gap-4">
          {(Object.entries({
            "MDF (por panel)":    { key: "mdf_panel",   unit: "€/panel" },
            "Chapa acero":        { key: "chapa_m2",    unit: "€/m²" },
            "Perfil SEG":         { key: "perfil_m",    unit: "€/m" },
            "Silicona SEG":       { key: "silicona_m",   unit: "€/m" },
            "Tela SEG":           { key: "tela_m2",      unit: "€/m²" },
            "Imán N52 D5×2mm":   { key: "iman_ud",      unit: "€/ud" },
            "Epoxy (por tablero)":{ key: "epoxy_panel",  unit: "€/tablero" },
          }) as [string, { key: keyof UnitCosts; unit: string }][]).map(([label, { key, unit }]) => (
            <div key={key} className={`${(key === "iman_ud" || key === "epoxy_panel") && variant === "FREE" ? "opacity-30" : ""}`}>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">{label}</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={costs[key] ?? ""}
                  onChange={(e) => updateCost(key, e.target.value)}
                  placeholder="—"
                  className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <span className="text-xs text-slate-400 shrink-0">{unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Size pricing table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest">
            Phoenix Wall {variant} · Análisis por Tamaño
          </h2>
          <TrendingUp className="w-4 h-4 text-slate-400" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-5 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Tamaño</th>
                <th className="px-5 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Coste fab.</th>
                <th className="px-5 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">PVP sugerido</th>
                <th className="px-5 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Mercado ref.</th>
                <th className="px-5 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Beneficio</th>
                <th className="px-5 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Margen real</th>
                <th className="px-5 py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Atractivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sizeData.map(({ size, total, pvp, profit, realMargin }) => {
                const ref = MARKET_REF[size.name];
                const vsMarket = pvp != null && ref
                  ? pvp <= ref.low ? "below" : pvp <= ref.high ? "within" : "above"
                  : null;
                return (
                <tr key={size.name} onClick={() => setSelectedSize(selectedSize === size.name ? null : size.name)} className={`hover:bg-slate-50/60 transition-colors cursor-pointer ${selectedSize === size.name ? "bg-violet-50" : ""}`}>
                  <td className="px-5 py-4">
                    <div className="font-black text-slate-900 uppercase">{size.name}</div>
                    <div className="text-xs text-slate-400 font-mono">{size.dims} · {size.panels}p</div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    {total != null
                      ? <span className="font-bold text-slate-700 tabular-nums">{total.toFixed(2)} €</span>
                      : <span className="text-amber-400 text-xs font-semibold">Sin datos</span>}
                  </td>
                  <td className="px-5 py-4 text-right">
                    {pvp != null
                      ? <span className="text-2xl font-black text-slate-900 tabular-nums">{pvp} €</span>
                      : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-5 py-4 text-right">
                    {ref ? (
                      <div className="text-right">
                        <div className="text-xs text-slate-500 tabular-nums">{ref.low.toLocaleString("es-ES")}–{ref.high.toLocaleString("es-ES")} €</div>
                        {vsMarket && (
                          <div className={`text-[10px] font-bold mt-0.5 ${
                            vsMarket === "below" ? "text-green-600" :
                            vsMarket === "within" ? "text-blue-500" :
                            "text-orange-500"
                          }`}>
                            {vsMarket === "below" ? "▼ bajo mercado" :
                             vsMarket === "within" ? "✓ en rango" :
                             "▲ premium"}
                          </div>
                        )}
                      </div>
                    ) : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-5 py-4 text-right">
                    {profit != null
                      ? <span className="font-black text-green-600 tabular-nums">{profit.toFixed(0)} €</span>
                      : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-5 py-4 text-right">
                    {realMargin != null ? (
                      <span className={`text-sm font-black tabular-nums ${
                        realMargin >= 50 ? "text-green-600" : realMargin >= 30 ? "text-amber-600" : "text-red-500"
                      }`}>
                        {realMargin.toFixed(0)}%
                      </span>
                    ) : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="text-lg">
                      {realMargin == null ? "—"
                        : realMargin >= 60 ? "🔥"
                        : realMargin >= 45 ? "✅"
                        : realMargin >= 30 ? "⚠️"
                        : "❌"}
                    </span>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {showPsych && (
          <div className="px-6 py-3 border-t border-slate-100 bg-amber-50/60 flex items-center gap-2 text-xs text-amber-700">
            <Zap className="w-3.5 h-3.5 shrink-0" />
            <span>Precios psicológicos activados — los PVP terminan en dígitos atractivos (€199, €299...) que reducen la percepción de coste.</span>
          </div>
        )}
      </div>

      {selectedSize && (() => {
        const entry = sizeData.find(d => d.size.name === selectedSize)!;
        const { breakdown } = computeCost(entry.size, variant);
        const total = entry.total;
        const pvp = entry.pvp;
        const profit = entry.profit;
        const realMargin = entry.realMargin;
        return (
          <div className="bg-white rounded-3xl border border-violet-200 shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-violet-50 border-b border-violet-100 flex items-center justify-between">
              <div>
                <h3 className="font-black text-slate-900 uppercase">
                  {entry.size.name} · Descompuesto BOM
                </h3>
                <div className="text-xs text-slate-500 mt-0.5">
                  Phoenix Wall {variant} · {entry.size.dims} · {entry.size.panels} panel{entry.size.panels > 1 ? 'es' : ''}
                </div>
              </div>
              <button
                onClick={() => setSelectedSize(null)}
                className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Componente</th>
                    <th className="px-6 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Coste</th>
                    <th className="px-6 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">% del total</th>
                    <th className="px-6 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">PVP parcial</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Object.entries(breakdown).map(([name, cost]) => (
                    <tr key={name} className="hover:bg-slate-50/60">
                      <td className="px-6 py-3 font-medium text-slate-800 text-sm">{name}</td>
                      <td className="px-6 py-3 text-right tabular-nums text-slate-700 text-sm">
                        {cost != null ? `${cost.toFixed(2)} €` : <span className="text-amber-400 text-xs font-semibold">Sin datos</span>}
                      </td>
                      <td className="px-6 py-3 text-right tabular-nums text-slate-400 text-sm">
                        {cost != null && total != null && total > 0
                          ? `${((cost / total) * 100).toFixed(1)}%`
                          : '—'}
                      </td>
                      <td className="px-6 py-3 text-right tabular-nums text-slate-400 text-sm">
                        {cost != null ? `${(cost * (1 + margin / 100)).toFixed(2)} €` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-200 bg-slate-50">
                    <td className="px-6 py-3 font-black text-slate-500 text-xs uppercase tracking-wide">Coste total</td>
                    <td className="px-6 py-3 text-right font-black text-slate-900 tabular-nums">
                      {total != null ? `${total.toFixed(2)} €` : '—'}
                    </td>
                    <td className="px-6 py-3 text-right text-slate-400 text-xs">100%</td>
                    <td />
                  </tr>
                  <tr className="bg-slate-900">
                    <td className="px-6 py-4 font-black text-slate-300 text-xs uppercase tracking-wide">
                      PVP sugerido · margen {margin}%
                    </td>
                    <td colSpan={2} className="px-6 py-4 text-right">
                      {profit != null && <div className="text-xs font-bold text-green-400">+{profit.toFixed(0)} € beneficio</div>}
                      {realMargin != null && <div className="text-[10px] text-slate-400">{realMargin.toFixed(0)}% margen real</div>}
                    </td>
                    <td className="px-6 py-4 text-right font-black text-white tabular-nums text-2xl">
                      {pvp != null ? `${pvp} €` : '—'}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        );
      })()}

      {/* Packs */}
      <div>
        <div className="mb-4 flex items-center gap-3">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Packs · Propuesta comercial</h2>
          <div className="flex-1 h-px bg-slate-200" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          {PACKS.map((pack) => {
            const sizeEntry = sizeData.find((d) => pack.sizes.includes(d.size.name));
            const accCost = pack.accessories.reduce((a, acc) => a + (ACCESSORY_COSTS[acc] ?? 0), 0);
            const baseCost = (sizeEntry?.total ?? 0) + accCost;
            const basePvp = sizeEntry?.pvp;
            const accPvp = accCost * (1 + margin / 100);
            const packPvp = basePvp != null
              ? (showPsych ? charmPrice(baseCost, margin) : Math.round((basePvp + accPvp) / 10) * 10 - 1)
              : null;
            const packProfit = packPvp != null && baseCost > 0 ? packPvp - baseCost : null;
            const isSelected = selectedPack === pack.name;

            return (
              <button
                key={pack.name}
                onClick={() => {
                  const next = isSelected ? null : pack.name;
                  setSelectedPack(next);
                  if (next) setTimeout(() => breakdownRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
                }}
                className={`text-left bg-white rounded-3xl border shadow-sm p-6 hover:shadow-md transition-all duration-200 group w-full ${
                  isSelected ? "border-violet-400 ring-2 ring-violet-200" : "border-slate-100"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-2xl mb-1">{pack.icon}</div>
                    <h3 className="font-black text-slate-900 uppercase">Pack {pack.name}</h3>
                    {pack.badge && (
                      <span className="text-[10px] font-bold bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full mt-1 inline-block">
                        {pack.badge}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {packPvp != null && (
                      <div className="text-right">
                        <div className="text-2xl font-black text-slate-900 tabular-nums">{packPvp} €</div>
                        {packProfit != null && (
                          <div className="text-xs font-bold text-green-600">+{packProfit.toFixed(0)} € beneficio</div>
                        )}
                      </div>
                    )}
                    <ChevronRight className={`w-4 h-4 transition-all ${isSelected ? "rotate-90 text-violet-500" : "text-slate-300 group-hover:text-slate-500"}`} />
                  </div>
                </div>

                <p className="text-xs text-slate-500 mb-4 leading-relaxed">{pack.desc}</p>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs">
                    <Package className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="font-semibold text-slate-700">{variant === "ALIGN" ? "✦" : ""} {pack.sizes[0]}</span>
                    {sizeEntry?.pvp && <span className="text-slate-400 ml-auto">{sizeEntry.pvp} €</span>}
                  </div>
                  {pack.accessories.map((acc) => (
                    <div key={acc} className="flex items-center gap-2 text-xs">
                      <span className="w-3 h-3 shrink-0" />
                      <span className="text-slate-500">{acc}</span>
                      <span className="text-slate-300 ml-auto">{ACCESSORY_COSTS[acc]?.toFixed(0) ?? "?"} €</span>
                    </div>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {/* Pack breakdown panel */}
        {selectedPack && (() => {
          const pack = PACKS.find((p) => p.name === selectedPack)!;
          const sizeEntry = sizeData.find((d) => pack.sizes.includes(d.size.name))!;
          const accCost = pack.accessories.reduce((a, acc) => a + (ACCESSORY_COSTS[acc] ?? 0), 0);
          const baseCost = (sizeEntry?.total ?? 0) + accCost;
          const packPvp = sizeEntry?.pvp != null
            ? (showPsych ? charmPrice(baseCost, margin) : Math.round(baseCost * (1 + margin / 100) / 10) * 10 - 1)
            : null;
          const packProfit = packPvp != null && baseCost > 0 ? packPvp - baseCost : null;
          const packMargin = packPvp != null && baseCost > 0 ? ((packPvp - baseCost) / packPvp) * 100 : null;
          const breakdown = sizeEntry ? computeCost(sizeEntry.size, variant).breakdown : {};

          return (
            <div ref={breakdownRef} className="mt-4 bg-white rounded-3xl border border-violet-200 shadow-md overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 bg-violet-50 border-b border-violet-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{pack.icon}</span>
                  <div>
                    <h3 className="font-black text-slate-900 uppercase">Pack {pack.name} · Descompuesto</h3>
                    <div className="text-xs text-slate-500 mt-0.5">Phoenix Wall {variant} · {pack.sizes[0]} · {sizeEntry?.size.dims}</div>
                  </div>
                </div>
                <button onClick={() => setSelectedPack(null)} className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Componente</th>
                      <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Categoría</th>
                      <th className="px-6 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Coste</th>
                      <th className="px-6 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">PVP parcial</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {/* BOM lines */}
                    {Object.entries(breakdown).map(([name, cost]) => (
                      <tr key={name} className="hover:bg-slate-50/60">
                        <td className="px-6 py-3 font-medium text-slate-800 text-sm">{name}</td>
                        <td className="px-6 py-3">
                          <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">Tablero</span>
                        </td>
                        <td className="px-6 py-3 text-right tabular-nums text-slate-700 text-sm">
                          {cost != null ? `${cost.toFixed(2)} €` : <span className="text-amber-400 text-xs">Sin datos</span>}
                        </td>
                        <td className="px-6 py-3 text-right tabular-nums text-slate-400 text-sm">
                          {cost != null ? `${(cost * (1 + margin / 100)).toFixed(2)} €` : "—"}
                        </td>
                      </tr>
                    ))}
                    {/* Accessories */}
                    {pack.accessories.map((acc) => {
                      const c = ACCESSORY_COSTS[acc] ?? null;
                      return (
                        <tr key={acc} className="hover:bg-slate-50/60">
                          <td className="px-6 py-3 font-medium text-slate-800 text-sm">{acc}</td>
                          <td className="px-6 py-3">
                            <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">Accesorio</span>
                          </td>
                          <td className="px-6 py-3 text-right tabular-nums text-slate-700 text-sm">
                            {c != null ? `${c.toFixed(2)} €` : <span className="text-amber-400 text-xs">Sin datos</span>}
                          </td>
                          <td className="px-6 py-3 text-right tabular-nums text-slate-400 text-sm">
                            {c != null ? `${(c * (1 + margin / 100)).toFixed(2)} €` : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  {/* Subtotals */}
                  <tfoot>
                    <tr className="border-t-2 border-slate-200 bg-slate-50">
                      <td colSpan={2} className="px-6 py-3 font-black text-slate-500 text-xs uppercase tracking-wide">Coste total fabricación</td>
                      <td className="px-6 py-3 text-right font-black text-slate-900 tabular-nums">{baseCost.toFixed(2)} €</td>
                      <td />
                    </tr>
                    <tr className="bg-slate-900">
                      <td colSpan={2} className="px-6 py-4 font-black text-slate-300 text-xs uppercase tracking-wide">
                        PVP pack · margen {margin}% {showPsych ? "· precio psicológico" : ""}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {packProfit != null && (
                          <span className="text-xs font-bold text-green-400">+{packProfit.toFixed(0)} € beneficio</span>
                        )}
                        {packMargin != null && (
                          <div className="text-[10px] text-slate-400">{packMargin.toFixed(0)}% margen real</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right font-black text-white tabular-nums text-2xl">
                        {packPvp != null ? `${packPvp} €` : "—"}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Market intelligence */}
      <div className="bg-slate-900 rounded-3xl p-7 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20"
          style={{ background: "radial-gradient(ellipse at right bottom, #a78bfa, transparent 60%)" }} />
        <div className="relative space-y-6">
          {/* Insight header */}
          <div>
            <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Inteligencia de mercado · Marzo 2026</div>
            <p className="text-sm text-slate-300 max-w-2xl">
              Phoenix Wall es un sistema de <span className="text-white font-bold">pared plana (&lt;3cm)</span> con perfil SEG slim, sin retroiluminación.
              Los sistemas backlit (Lucid, Expolinc, Display Wizard) no son comparables — requieren 5–10cm de profundidad.
              El único comparable estructural directo son marcos SEG de pared delgados (€100–370/panel), frente a los cuales Phoenix Wall tiene
              <span className="text-white font-bold"> NFC + 336 imanes ALIGN</span> como diferenciador sin equivalente en mercado.
            </p>
          </div>

          {/* Competitor benchmarks */}
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                cat: "SEG pared delgado",
                ref: "SquareSigns · fabricantes SEG",
                range: "€100 – €370 / panel",
                note: "Marco aluminio slim + tela. Plano (<3cm). Sin NFC ni magnética. Comparable estructural directo.",
                color: "text-slate-300",
              },
              {
                cat: "Marco magnético premium",
                ref: "WhiteWall · Saal Digital",
                range: "€84 – €300+ / marco",
                note: "Intercambio por imán. Individual, no modular. Solo foto, no SEG tela grande.",
                color: "text-slate-300",
              },
              {
                cat: "SEG backlit / lightbox",
                ref: "Lucid · Expolinc · Display Wizard",
                range: "€500 – €4,000 / config.",
                note: "⚠️ No comparable — requieren 5–10cm de profundidad. Phoenix Wall es pared plana <3cm.",
                color: "text-orange-400",
              },
              {
                cat: "Modular magnético trade show",
                ref: "Modnetix",
                range: "$1,500 – $4,500 USD / kit",
                note: "Stretch fabric con conexión magnética. Para ferias, no pared permanente. Sin NFC.",
                color: "text-slate-300",
              },
              {
                cat: "NFC + E-Ink",
                ref: "InkPoster · Reflection Frame",
                range: "$300 – $6,000 USD / unidad",
                note: "NFC tap-to-update. Panel individual, no sistema modular. Ultra-premium single frame.",
                color: "text-violet-300",
              },
              {
                cat: "Phoenix Wall",
                ref: "Único en mercado",
                range: "SEG plano + NFC + ALIGN",
                note: "Pared <3cm, tela intercambiable, matriz magnética 336 imanes, chip NFC por panel. Sin equivalente.",
                color: "text-[#d6ff6b]",
              },
            ].map((item) => (
              <div key={item.cat} className="bg-white/5 rounded-2xl p-4">
                <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${item.color}`}>{item.cat}</div>
                <div className="text-xs text-slate-400 mb-1">{item.ref}</div>
                <div className="text-sm font-bold text-white mb-2">{item.range}</div>
                <p className="text-[11px] text-slate-500 leading-relaxed">{item.note}</p>
              </div>
            ))}
          </div>

          {/* Psych tips */}
          <div className="border-t border-white/10 pt-5 grid grid-cols-3 gap-6">
            {[
              {
                title: "Charm pricing",
                desc: "Terminar en 9 (€299 vs €300) reduce percepción de precio hasta un 30%. El cerebro lee de izquierda a derecha: 2xx parece menor que 3xx.",
                icon: "🧠",
              },
              {
                title: "Precio ancla",
                desc: "Mostrar primero el modelo ALIGN premium hace que FREE parezca una ganga. El precio alto ancla la percepción de valor.",
                icon: "⚓",
              },
              {
                title: "Efecto bundle",
                desc: "Los packs con 10-15% de descuento vs compra separada aumentan ticket medio un 40%. El cliente percibe ahorro aunque gaste más.",
                icon: "🎁",
              },
            ].map((tip) => (
              <div key={tip.title}>
                <div className="text-xl mb-2">{tip.icon}</div>
                <div className="font-black text-white text-sm mb-1.5">{tip.title}</div>
                <p className="text-xs text-slate-400 leading-relaxed">{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
