"use client";

import { useState, useMemo } from "react";
import { TrendingUp, Package, Zap, Info } from "lucide-react";

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
  epoxy_kg:    number | null;
  nfc_chip:    number | null;
  silicona_m:  number | null;
};

type Props = {
  sizes: readonly Size[];
  unitCosts: UnitCosts;
  imanesPerM2: number;
  epoxyKgPerM2: number;
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

const ACCESSORY_COSTS: Record<string, number> = {
  "Pins": 4.5,
  "The Craw": 12,
  "The Wing": 18,
  "The Nest": 14,
  "Marco Roble Fino": 22,
  "Marco BGA Classic": 28,
};

export function PricingClient({ sizes, unitCosts, imanesPerM2, epoxyKgPerM2 }: Props) {
  const [variant, setVariant] = useState<"FREE" | "ALIGN">("ALIGN");
  const [margin, setMargin] = useState(60); // 60% default margin
  const [showPsych, setShowPsych] = useState(true);

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
      "Chip NFC": costs.nfc_chip != null ? costs.nfc_chip * size.panels : null,
    };

    if (v === "ALIGN") {
      const imanCount = Math.ceil(chapa_area * imanesPerM2);
      const epoxyKg = chapa_area * epoxyKgPerM2;
      breakdown["Imanes N52"] = costs.iman_ud != null ? costs.iman_ud * imanCount : null;
      breakdown["Epoxy 2mm"] = costs.epoxy_kg != null ? costs.epoxy_kg * epoxyKg : null;
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
            "Silicona SEG":       { key: "silicona_m",  unit: "€/m" },
            "Tela SEG":           { key: "tela_m2",     unit: "€/m²" },
            "Chip NFC":           { key: "nfc_chip",    unit: "€/ud" },
            "Imán N52 D5×2mm":   { key: "iman_ud",     unit: "€/ud" },
            "Epoxy bicomponente": { key: "epoxy_kg",    unit: "€/kg" },
          }) as [string, { key: keyof UnitCosts; unit: string }][]).map(([label, { key, unit }]) => (
            <div key={key} className={`${(key === "iman_ud" || key === "epoxy_kg") && variant === "FREE" ? "opacity-30" : ""}`}>
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
                <th className="px-5 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Beneficio</th>
                <th className="px-5 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Margen real</th>
                <th className="px-5 py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Atractivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sizeData.map(({ size, total, pvp, profit, realMargin }) => (
                <tr key={size.name} className="hover:bg-slate-50/60 transition-colors">
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
              ))}
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

      {/* Packs */}
      <div>
        <div className="mb-4 flex items-center gap-3">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Packs · Propuesta comercial</h2>
          <div className="flex-1 h-px bg-slate-200" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          {PACKS.map((pack) => {
            const sizeEntry = sizeData.find((d) => pack.sizes.includes(d.size.name));
            const fabricCost = 0; // custom tela = extra, not included here
            const accCost = pack.accessories.reduce((a, acc) => a + (ACCESSORY_COSTS[acc] ?? 0), 0);
            const baseCost = (sizeEntry?.total ?? 0) + accCost + fabricCost;
            const basePvp = sizeEntry?.pvp;

            // Pack PVP = size PVP + accessories + tela markup (simplified)
            const accPvp = accCost * (1 + margin / 100);
            const packPvp = basePvp != null
              ? (showPsych ? charmPrice(baseCost + accCost, margin) : Math.round((basePvp + accPvp) / 10) * 10 - 1)
              : null;

            const packProfit = packPvp != null && baseCost > 0 ? packPvp - baseCost : null;

            return (
              <div key={pack.name} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-all duration-200">
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
                  {packPvp != null && (
                    <div className="text-right">
                      <div className="text-2xl font-black text-slate-900 tabular-nums">{packPvp} €</div>
                      {packProfit != null && (
                        <div className="text-xs font-bold text-green-600">+{packProfit.toFixed(0)} € beneficio</div>
                      )}
                    </div>
                  )}
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
              </div>
            );
          })}
        </div>
      </div>

      {/* Psychological pricing tips */}
      <div className="bg-slate-900 rounded-3xl p-7 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20"
          style={{ background: "radial-gradient(ellipse at right bottom, #a78bfa, transparent 60%)" }} />
        <div className="relative">
          <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Estrategia de precios psicológicos</div>
          <div className="grid grid-cols-3 gap-6">
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
                <div className="text-2xl mb-2">{tip.icon}</div>
                <div className="font-black text-white text-sm mb-2">{tip.title}</div>
                <p className="text-xs text-slate-400 leading-relaxed">{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
