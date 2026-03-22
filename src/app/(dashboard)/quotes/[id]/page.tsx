export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  draft:    { label: "BORRADOR",    color: "bg-slate-200 text-slate-700" },
  rfq_sent: { label: "RFQ ENVIADO", color: "bg-amber-300 text-amber-900" },
  quoted:   { label: "COTIZADO",    color: "bg-blue-200 text-blue-900" },
  accepted: { label: "ACEPTADO",    color: "bg-[#d6ff6b] text-slate-900" },
  rejected: { label: "RECHAZADO",   color: "bg-rose-200 text-rose-900" },
};

// Detect Phoenix Wall variant from quote title/notes
function detectVariant(title: string, notes?: string | null): "FREE" | "ALIGN" | null {
  const text = `${title} ${notes ?? ""}`.toLowerCase();
  if (text.includes("| align") || text.includes("align")) return "ALIGN";
  if (text.includes("| free") || text.includes("free")) return "FREE";
  return null;
}

type Layer = {
  key: string;
  label: string;
  icon: string;
  color: string;
  bg: string;
  keywords: string[];
};

const LAYERS: Layer[] = [
  {
    key: "tablero",
    label: "Tablero",
    icon: "📦",
    color: "text-amber-700",
    bg: "bg-amber-50",
    keywords: ["mdf", "madera", "tablero", "chapa", "acero", "hierro", "metal", "imán", "iman", "magnet", "neodimio", "epoxy", "epoxi", "adhesivo", "perfil", "seg", "aluminio", "silicona", "nfc", "chip", "ntag", "rfid"],
  },
  {
    key: "tela",
    label: "Tela SEG",
    icon: "🧵",
    color: "text-purple-700",
    bg: "bg-purple-50",
    keywords: ["tela", "textil", "sublimación", "sublimacion", "impresión", "impresion", "tejido", "seg", "lona"],
  },
  {
    key: "accesorios",
    label: "Accesorios",
    icon: "🪝",
    color: "text-blue-700",
    bg: "bg-blue-50",
    keywords: ["pins", "pin", "estantería", "estanteria", "marco", "cuadro", "wing", "craw", "nest", "roble", "frame", "shelf"],
  },
  {
    key: "nfc",
    label: "NFC / Electrónica",
    icon: "📡",
    color: "text-green-700",
    bg: "bg-green-50",
    keywords: [], // chips go into tablero layer
  },
  {
    key: "servicios",
    label: "Servicios (BOS)",
    icon: "⚙️",
    color: "text-slate-700",
    bg: "bg-slate-50",
    keywords: [], // BOS lines go here
  },
];

function classifyLine(line: { type: string; description: string }): string {
  if (line.type === "BOS") return "servicios";
  const desc = line.description.toLowerCase();
  for (const layer of LAYERS) {
    if (layer.key === "servicios") continue;
    if (layer.keywords.some((kw) => desc.includes(kw))) return layer.key;
  }
  return "tablero"; // default BOM to tablero
}

export default async function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const quote = await prisma.quote.findUnique({
    where: { id },
    include: { lines: { include: { supplier: true } }, rfqs: { include: { responses: true } } },
  });

  if (!quote) notFound();

  const st = STATUS_MAP[quote.status] ?? STATUS_MAP.draft;
  const total = quote.lines.reduce((a, l) => a + (l.totalCost ?? 0), 0);
  const linesWithoutPrice = quote.lines.filter((l) => !l.unitCost);
  const variant = detectVariant(quote.title, quote.notes);

  // Group lines by layer
  const grouped = new Map<string, typeof quote.lines>();
  for (const line of quote.lines) {
    const key = classifyLine(line);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(line);
  }

  const layersWithLines = LAYERS.filter((l) => (grouped.get(l.key)?.length ?? 0) > 0);

  // Subtotals by layer
  function layerTotal(key: string) {
    return (grouped.get(key) ?? []).reduce((a, l) => a + (l.totalCost ?? 0), 0);
  }

  return (
    <div className="space-y-5">
      {/* Back + status */}
      <div className="flex items-center gap-3">
        <Link href="/quotes" className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 shadow-sm text-slate-500 hover:text-slate-900 transition-all">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <span className={`text-xs font-black px-3 py-1.5 rounded-full ${st.color}`}>{st.label}</span>
        {variant && (
          <span className={`text-xs font-black px-3 py-1.5 rounded-full ${
            variant === "ALIGN" ? "bg-violet-100 text-violet-800" : "bg-slate-100 text-slate-700"
          }`}>
            Phoenix Wall {variant}
          </span>
        )}
        {quote.clientName && (
          <span className="text-sm text-slate-500">Cliente: <span className="font-semibold text-slate-700">{quote.clientName}</span></span>
        )}
      </div>

      {/* Invoice header */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Presupuesto</div>
            <h1 className="text-4xl font-black text-slate-900 uppercase leading-tight">{quote.title}</h1>
            <div className="text-sm text-slate-400 mt-2">
              {new Date(quote.createdAt).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total sin IVA</div>
            <div className="text-5xl font-black text-slate-900 tabular-nums">
              {total.toFixed(2)}<span className="text-2xl text-slate-400 ml-1">€</span>
            </div>
            <div className="text-sm text-slate-400 mt-1">
              Con IVA: <span className="font-semibold text-slate-600">{(total * 1.21).toFixed(2)} €</span>
            </div>
          </div>
        </div>

        {/* Layer breakdown summary */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {layersWithLines.map((layer) => {
            const sub = layerTotal(layer.key);
            return (
              <div key={layer.key} className={`rounded-2xl px-4 py-3 ${layer.bg}`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-sm">{layer.icon}</span>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${layer.color}`}>{layer.label}</span>
                </div>
                <div className={`text-lg font-black ${layer.color} tabular-nums`}>
                  {sub > 0 ? `${sub.toFixed(2)} €` : <span className="text-slate-400 font-normal text-sm">Sin precio</span>}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {grouped.get(layer.key)?.length ?? 0} ítem{(grouped.get(layer.key)?.length ?? 0) !== 1 ? "s" : ""}
                </div>
              </div>
            );
          })}
        </div>

        {quote.notes && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
            <div className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-1">Notas</div>
            <p className="text-sm text-slate-600">{quote.notes}</p>
          </div>
        )}

        {linesWithoutPrice.length > 0 && (
          <div className="mt-4 p-3 rounded-xl bg-orange-50 border border-orange-200 text-sm text-orange-700 font-medium">
            ⚠️ {linesWithoutPrice.length} línea{linesWithoutPrice.length > 1 ? "s" : ""} sin precio — solicita RFQ al agente
          </div>
        )}
      </div>

      {/* Layered tables */}
      {layersWithLines.map((layer) => {
        const lines = grouped.get(layer.key) ?? [];
        const sub = layerTotal(layer.key);
        return (
          <div key={layer.key} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className={`px-6 py-4 border-b border-slate-100 flex items-center justify-between ${layer.bg}`}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{layer.icon}</span>
                <h2 className={`font-black uppercase text-sm tracking-wide ${layer.color}`}>{layer.label}</h2>
                {layer.key === "tablero" && variant && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    variant === "ALIGN" ? "bg-violet-200 text-violet-800" : "bg-slate-200 text-slate-700"
                  }`}>
                    {variant === "ALIGN" ? "Con matriz magnética N52" : "Sin imanes"}
                  </span>
                )}
              </div>
              <span className={`font-black tabular-nums ${layer.color}`}>
                {sub > 0 ? `${sub.toFixed(2)} €` : "—"}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    <th className="px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wide text-left">Descripción</th>
                    <th className="px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wide text-right">Cantidad</th>
                    <th className="px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wide text-right">Unidad</th>
                    <th className="px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wide text-right">Precio unit.</th>
                    <th className="px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wide text-right">Total</th>
                    <th className="px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wide text-left">Proveedor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/60">
                  {lines.map((l, i) => (
                    <tr key={i} className="hover:bg-slate-50/60 transition-colors duration-100">
                      <td className="px-5 py-3.5 font-medium text-slate-800 text-sm">{l.description}</td>
                      <td className="px-5 py-3.5 text-right tabular-nums text-slate-700">{l.quantity}</td>
                      <td className="px-5 py-3.5 text-right text-slate-400 text-sm">{l.unit}</td>
                      <td className="px-5 py-3.5 text-right tabular-nums text-sm">
                        {l.unitCost != null
                          ? <span className="text-slate-800">{l.unitCost.toFixed(2)} €</span>
                          : <span className="text-amber-400 font-semibold">Sin precio</span>}
                      </td>
                      <td className="px-5 py-3.5 text-right tabular-nums font-black text-slate-900">
                        {l.totalCost != null ? `${l.totalCost.toFixed(2)} €` : <span className="text-amber-400 font-normal">—</span>}
                      </td>
                      <td className="px-5 py-3.5 text-slate-400 text-xs">{l.supplier?.name ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-100">
                    <td colSpan={4} className="px-5 py-3 font-bold text-slate-500 text-xs uppercase tracking-wide">Subtotal {layer.label}</td>
                    <td className={`px-5 py-3 text-right font-black tabular-nums ${layer.color}`}>
                      {sub > 0 ? `${sub.toFixed(2)} €` : "—"}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        );
      })}

      {/* Total footer */}
      <div className="bg-slate-900 rounded-3xl p-7 flex items-center justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-30"
          style={{ background: "radial-gradient(ellipse at right, #7c3aed, transparent 60%)" }} />
        <div className="relative space-y-1.5">
          {layersWithLines.map((layer) => {
            const sub = layerTotal(layer.key);
            if (!sub) return null;
            return (
              <div key={layer.key} className="flex items-center gap-2 text-sm">
                <span className="text-lg">{layer.icon}</span>
                <span className="text-slate-400">{layer.label}:</span>
                <span className="text-white font-semibold">{sub.toFixed(2)} €</span>
              </div>
            );
          })}
        </div>
        <div className="relative text-right">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total sin IVA</div>
          <div className="text-5xl font-black text-white tabular-nums">{total.toFixed(2)} €</div>
          <div className="text-slate-400 text-sm mt-1">Con IVA: {(total * 1.21).toFixed(2)} €</div>
        </div>
      </div>

      {/* RFQs */}
      {quote.rfqs.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-black text-slate-900 uppercase text-sm tracking-wide">RFQs enviados</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {quote.rfqs.map((r) => (
              <div key={r.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800 text-sm">{r.supplierName ?? r.supplierEmail}</div>
                  <div className="text-xs text-slate-400">{r.supplierEmail}</div>
                </div>
                <span className={`text-xs font-black px-3 py-1 rounded-full ${
                  r.status === "responded" ? "bg-[#d6ff6b] text-slate-900" :
                  r.status === "pending"   ? "bg-amber-200 text-amber-900" :
                  "bg-slate-100 text-slate-500"
                }`}>
                  {r.status === "responded" ? `✓ ${r.responses.length} respuesta${r.responses.length > 1 ? "s" : ""}` : r.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
