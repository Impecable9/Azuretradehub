"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  draft:    { label: "BORRADOR",    color: "bg-slate-200 text-slate-700" },
  rfq_sent: { label: "RFQ ENVIADO", color: "bg-amber-300 text-amber-900" },
  quoted:   { label: "COTIZADO",    color: "bg-blue-200 text-blue-900" },
  accepted: { label: "ACEPTADO",    color: "bg-[#d6ff6b] text-slate-900" },
  rejected: { label: "RECHAZADO",   color: "bg-rose-200 text-rose-900" },
};

const SIZES = [
  { name: "Brilliant", dims: "442×832mm",   panels: 1  },
  { name: "Joy",       dims: "832×832mm",   panels: 2  },
  { name: "Abundant",  dims: "1222×832mm",  panels: 3  },
  { name: "Nova",      dims: "1222×1612mm", panels: 6  },
  { name: "Luna",      dims: "1612×2002mm", panels: 8  },
  { name: "Gea",       dims: "2002×2392mm", panels: 12 },
];

type Quote = {
  id: string;
  title: string;
  status: string;
  totalCost: number | null;
  clientName: string | null;
  createdAt: Date;
  lines: { unitCost: number | null }[];
  rfqs: { status: string }[];
};

type Variant = "all" | "FREE" | "ALIGN";

function detectVariant(title: string): "FREE" | "ALIGN" | null {
  const t = title.toLowerCase();
  if (t.includes("align")) return "ALIGN";
  if (t.includes("free")) return "FREE";
  return null;
}

export function QuotesList({ quotes }: { quotes: Quote[] }) {
  const [variant, setVariant] = useState<Variant>("all");
  const [sizeFilter, setSizeFilter] = useState<string>("all");

  const filtered = quotes.filter((q) => {
    const variantMatch = variant === "all" || detectVariant(q.title) === variant;
    const sizeMatch = sizeFilter === "all" || q.title.toLowerCase().includes(sizeFilter.toLowerCase());
    return variantMatch && sizeMatch;
  });

  const total = filtered.reduce((a, q) => a + (q.totalCost ?? 0), 0);

  function findQuoteForSize(sizeName: string) {
    return filtered.find((q) => {
      const t = q.title.toLowerCase();
      return t.includes(sizeName.toLowerCase());
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Presupuestos</h1>
          <p className="text-sm text-slate-400 mt-1">
            {filtered.length} presupuesto{filtered.length !== 1 ? "s" : ""} · {total.toFixed(2)} € valor total
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Variant filter */}
          <div className="flex items-center gap-1 bg-white rounded-2xl p-1.5 border border-slate-100 shadow-sm">
            {(["all", "FREE", "ALIGN"] as Variant[]).map((v) => (
              <button
                key={v}
                onClick={() => setVariant(v)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                  variant === v
                    ? v === "ALIGN"
                      ? "bg-violet-600 text-white shadow-sm"
                      : "bg-slate-900 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {v === "all" ? `Todos (${quotes.length})` : v}
              </button>
            ))}
          </div>
          <Link
            href="/chat"
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white text-sm font-bold px-4 py-2.5 rounded-2xl transition-all duration-200 hover:scale-105"
          >
            <Plus className="w-4 h-4" /> Nuevo
          </Link>
        </div>
      </div>

      {/* Size filter */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {["all", "Brilliant", "Joy", "Abundant", "Nova", "Luna", "Gea"].map((s) => (
          <button
            key={s}
            onClick={() => setSizeFilter(s)}
            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide transition-all duration-150 ${
              sizeFilter === s
                ? "bg-slate-900 text-white"
                : "bg-white border border-slate-200 text-slate-500 hover:border-slate-400"
            }`}
          >
            {s === "all" ? "Todos los tamaños" : s}
          </button>
        ))}
      </div>

      {/* Phoenix Wall sizes grid */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest">
            Phoenix Wall {variant !== "all" ? `· ${variant}` : "· Por Tamaño"}
          </h2>
          {variant === "all" && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">FREE</span>
              <span className="text-[10px] font-bold bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">ALIGN ✦</span>
            </div>
          )}
        </div>
        <div className="p-4 grid grid-cols-6 gap-3">
          {SIZES.map((size) => {
            const quote = findQuoteForSize(size.name);
            const hasPrice = !!quote?.totalCost;
            const v = quote ? detectVariant(quote.title) : null;
            return (
              <div key={size.name} className="flex flex-col">
                {quote ? (
                  <Link
                    href={`/quotes/${quote.id}`}
                    className={`flex-1 rounded-2xl border hover:shadow-md transition-all duration-200 p-4 text-center group ${
                      v === "ALIGN"
                        ? "border-violet-200 bg-violet-50/40 hover:bg-violet-50 hover:border-violet-300"
                        : "border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300"
                    }`}
                  >
                    {/* Panel visualizer */}
                    <div className="flex gap-0.5 justify-center mb-3 h-8 items-end">
                      {Array.from({ length: Math.min(size.panels, 4) }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 rounded-sm transition-colors ${
                            v === "ALIGN" ? "bg-violet-700 group-hover:bg-violet-800" : "bg-slate-800 group-hover:bg-slate-900"
                          }`}
                          style={{ height: `${70 + (i % 2 === 0 ? 0 : -15)}%` }}
                        />
                      ))}
                      {size.panels > 4 && (
                        <div className={`w-2 rounded-sm h-3/4 ${v === "ALIGN" ? "bg-violet-400" : "bg-slate-400"}`} />
                      )}
                    </div>
                    <div className="font-black text-slate-900 text-sm uppercase">{size.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{size.dims}</div>
                    {v && (
                      <div className={`text-[9px] font-black mt-1 ${v === "ALIGN" ? "text-violet-600" : "text-slate-500"}`}>
                        {v}
                      </div>
                    )}
                    <div className="mt-1.5">
                      {hasPrice
                        ? <span className="text-sm font-black text-slate-900 tabular-nums">{quote.totalCost!.toFixed(0)} €</span>
                        : <span className="text-[10px] text-amber-500 font-semibold">Sin precio</span>}
                    </div>
                    <div className={`mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                      STATUS_MAP[quote.status]?.color ?? "bg-slate-100 text-slate-500"
                    }`}>
                      {STATUS_MAP[quote.status]?.label ?? "—"}
                    </div>
                  </Link>
                ) : (
                  <Link
                    href="/chat"
                    className="flex-1 rounded-2xl border-2 border-dashed border-slate-200 hover:border-slate-400 bg-white hover:bg-slate-50 transition-all duration-200 p-4 text-center group"
                  >
                    <div className="flex gap-0.5 justify-center mb-3 h-8 items-end opacity-20">
                      {Array.from({ length: Math.min(size.panels, 4) }).map((_, i) => (
                        <div key={i} className="w-2 rounded-sm bg-slate-400"
                          style={{ height: `${70 + (i % 2 === 0 ? 0 : -15)}%` }} />
                      ))}
                    </div>
                    <div className="font-black text-slate-400 text-sm uppercase">{size.name}</div>
                    <div className="text-[10px] text-slate-300 font-mono mt-0.5">{size.dims}</div>
                    <div className="mt-3 text-[10px] font-bold text-slate-400 group-hover:text-slate-700 transition-colors">+ Crear</div>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* All quotes list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-16 text-center">
          <div className="text-5xl mb-4">📋</div>
          <div className="font-black text-slate-700 text-lg mb-2">
            Sin presupuestos {variant !== "all" ? variant : ""}
          </div>
          <p className="text-slate-400 text-sm mb-6">Genera uno desde el agente o cambia el filtro.</p>
          <Link href="/chat" className="inline-flex items-center gap-2 bg-slate-900 text-white font-bold px-5 py-2.5 rounded-2xl hover:bg-slate-700 transition-all">
            Ir al agente <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest">
              {variant === "all" ? "Todos los presupuestos" : `Presupuestos ${variant}`}
            </h2>
          </div>
          <div className="px-6 py-3 border-b border-slate-50 grid grid-cols-12 gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <span className="col-span-1">Nº</span>
            <span className="col-span-4">Presupuesto</span>
            <span className="col-span-2">Estado</span>
            <span className="col-span-2">Líneas</span>
            <span className="col-span-2 text-right">Total</span>
            <span className="col-span-1" />
          </div>
          <div className="divide-y divide-slate-100/60">
            {filtered.map((q, idx) => {
              const st = STATUS_MAP[q.status] ?? STATUS_MAP.draft;
              const responded = q.rfqs.filter((r) => r.status === "responded").length;
              const pending = q.rfqs.filter((r) => r.status === "pending").length;
              const withPrice = q.lines.filter((l) => l.unitCost).length;
              const v = detectVariant(q.title);
              return (
                <Link
                  key={q.id}
                  href={`/quotes/${q.id}`}
                  className="px-6 py-4 grid grid-cols-12 gap-4 items-center hover:bg-violet-50/40 transition-colors duration-150 group"
                >
                  <div className="col-span-1 text-slate-300 font-black text-sm tabular-nums">
                    #{String(filtered.length - idx).padStart(3, "0")}
                  </div>
                  <div className="col-span-4">
                    <div className="flex items-center gap-2">
                      <div className="font-bold text-slate-800 text-sm group-hover:text-violet-700 transition-colors leading-tight">{q.title}</div>
                      {v && (
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0 ${
                          v === "ALIGN" ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-600"
                        }`}>{v}</span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {new Date(q.createdAt).toLocaleDateString("es-ES")}
                      {q.clientName && <span className="ml-2 text-slate-500">{q.clientName}</span>}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${st.color}`}>{st.label}</span>
                  </div>
                  <div className="col-span-2 text-xs text-slate-500">
                    <div>{q.lines.length} ítems · {withPrice} con precio</div>
                    {responded > 0 && <div className="text-emerald-600 font-semibold">✓ {responded} cotización{responded > 1 ? "es" : ""}</div>}
                    {pending > 0 && <div className="text-amber-500">{pending} RFQ pend.</div>}
                  </div>
                  <div className="col-span-2 text-right font-black text-slate-900 tabular-nums">
                    {q.totalCost ? `${q.totalCost.toFixed(2)} €` : <span className="text-slate-300 font-normal text-sm">Sin precio</span>}
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-violet-100 flex items-center justify-center transition-colors">
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-violet-500 transition-colors" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
