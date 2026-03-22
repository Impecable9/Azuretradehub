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

export default async function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const quote = await prisma.quote.findUnique({
    where: { id },
    include: { lines: { include: { supplier: true } }, rfqs: { include: { responses: true } } },
  });

  if (!quote) notFound();

  const st = STATUS_MAP[quote.status] ?? STATUS_MAP.draft;
  const bom = quote.lines.filter((l) => l.type === "BOM");
  const bos = quote.lines.filter((l) => l.type === "BOS");
  const totalBOM = bom.reduce((a, l) => a + (l.totalCost ?? 0), 0);
  const totalBOS = bos.reduce((a, l) => a + (l.totalCost ?? 0), 0);
  const total = totalBOM + totalBOS;
  const linesWithoutPrice = quote.lines.filter((l) => !l.unitCost);

  return (
    <div className="space-y-5">
      {/* Back + status */}
      <div className="flex items-center gap-3">
        <Link href="/quotes" className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/70 backdrop-blur-sm border border-white shadow-sm text-slate-500 hover:text-slate-900 transition-all">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <span className={`text-xs font-black px-3 py-1.5 rounded-full ${st.color}`}>{st.label}</span>
        {quote.clientName && <span className="text-sm text-slate-500">Cliente: <span className="font-semibold text-slate-700">{quote.clientName}</span></span>}
      </div>

      {/* Invoice header */}
      <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-white shadow-sm p-8">
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
            <div className="text-5xl font-black text-slate-900 tabular-nums">{total.toFixed(2)}<span className="text-2xl text-slate-400 ml-1">€</span></div>
            <div className="text-sm text-slate-400 mt-1">Con IVA: <span className="font-semibold text-slate-600">{(total * 1.21).toFixed(2)} €</span></div>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4 p-5 rounded-2xl bg-slate-50/80">
          <SummaryItem label="Líneas de material" value={`${bom.length} ítems`} />
          <SummaryItem label="Total materiales" value={`${totalBOM.toFixed(2)} €`} />
          <SummaryItem label="RFQs enviados" value={`${quote.rfqs.length}`} />
        </div>

        {quote.notes && (
          <div className="mt-5 p-4 rounded-2xl bg-amber-50/60 border border-amber-100">
            <div className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-1">Notas</div>
            <p className="text-sm text-slate-600">{quote.notes}</p>
          </div>
        )}

        {linesWithoutPrice.length > 0 && (
          <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-700 font-medium">
            ⚠️ {linesWithoutPrice.length} línea{linesWithoutPrice.length > 1 ? "s" : ""} sin precio — solicita RFQ a proveedores desde el agente
          </div>
        )}
      </div>

      {/* BOM Table */}
      {bom.length > 0 && <LineTable title="Materiales (BOM)" lines={bom} subtotal={totalBOM} accent="blue" />}

      {/* BOS Table */}
      {bos.length > 0 && <LineTable title="Servicios (BOS)" lines={bos} subtotal={totalBOS} accent="violet" />}

      {/* Total footer */}
      <div className="bg-slate-900 rounded-3xl p-7 flex items-center justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-30"
          style={{ background: "radial-gradient(ellipse at right, #7c3aed, transparent 60%)" }} />
        <div className="relative space-y-1">
          {totalBOM > 0 && <div className="text-slate-400 text-sm">Materiales: <span className="text-white font-semibold">{totalBOM.toFixed(2)} €</span></div>}
          {totalBOS > 0 && <div className="text-slate-400 text-sm">Servicios: <span className="text-white font-semibold">{totalBOS.toFixed(2)} €</span></div>}
        </div>
        <div className="relative text-right">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total sin IVA</div>
          <div className="text-5xl font-black text-white tabular-nums">{total.toFixed(2)} €</div>
          <div className="text-slate-400 text-sm mt-1">Con IVA: {(total * 1.21).toFixed(2)} €</div>
        </div>
      </div>

      {/* RFQs */}
      {quote.rfqs.length > 0 && (
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-white shadow-sm overflow-hidden">
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

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">{label}</div>
      <div className="text-lg font-black text-slate-900">{value}</div>
    </div>
  );
}

function LineTable({ title, lines, subtotal, accent }: {
  title: string; lines: any[]; subtotal: number; accent: "blue" | "violet";
}) {
  const accentColor = { blue: "text-blue-600", violet: "text-violet-600" }[accent];
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-white shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h2 className={`font-black uppercase text-sm tracking-wide ${accentColor}`}>{title}</h2>
        <span className="font-black text-slate-900">{subtotal.toFixed(2)} €</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60">
              {["Descripción", "Cantidad", "Unidad", "Precio unit.", "Total", "Proveedor"].map((h, i) => (
                <th key={h} className={`px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wide ${i > 0 ? "text-right" : "text-left"} ${i === 5 ? "text-left" : ""}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/60">
            {lines.map((l, i) => (
              <tr key={i} className="hover:bg-violet-50/30 transition-colors duration-100 group">
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
            <tr className="border-t-2 border-slate-200 bg-slate-50/80">
              <td colSpan={4} className="px-5 py-3 font-bold text-slate-600 uppercase text-xs tracking-wide">Subtotal {title}</td>
              <td className="px-5 py-3 text-right font-black text-slate-900 tabular-nums">{subtotal.toFixed(2)} €</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
