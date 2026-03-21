export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const STATUS_MAP: Record<string, { label: string; class: string }> = {
  draft:    { label: "Borrador",    class: "bg-slate-100 text-slate-600" },
  rfq_sent: { label: "RFQ enviado", class: "bg-amber-100 text-amber-700" },
  quoted:   { label: "Cotizado",    class: "bg-blue-100 text-blue-700" },
  accepted: { label: "Aceptado",   class: "bg-green-100 text-green-700" },
  rejected: { label: "Rechazado",  class: "bg-red-100 text-red-700" },
};

export default async function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const quote = await prisma.quote.findUnique({
    where: { id },
    include: {
      lines: { include: { supplier: true } },
      rfqs: { include: { responses: true } },
    },
  });

  if (!quote) notFound();

  const s = STATUS_MAP[quote.status] ?? STATUS_MAP.draft;
  const bom = quote.lines.filter((l) => l.type === "BOM");
  const bos = quote.lines.filter((l) => l.type === "BOS");
  const totalBOM = bom.reduce((acc, l) => acc + (l.totalCost ?? 0), 0);
  const totalBOS = bos.reduce((acc, l) => acc + (l.totalCost ?? 0), 0);
  const total = totalBOM + totalBOS;
  const linesWithoutPrice = quote.lines.filter((l) => !l.unitCost);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center gap-3 mb-3">
          <Link href="/quotes" className="text-slate-400 hover:text-slate-700 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.class}`}>{s.label}</span>
          {quote.clientName && (
            <span className="text-sm text-slate-400">Cliente: <span className="text-slate-700 font-medium">{quote.clientName}</span></span>
          )}
        </div>
        <div className="flex items-end justify-between">
          <h1 className="text-2xl font-black text-slate-900">{quote.title}</h1>
          <div className="text-right">
            <div className="text-3xl font-black text-slate-900">{total.toFixed(2)} €</div>
            <div className="text-xs text-slate-400 mt-0.5">Total sin IVA</div>
          </div>
        </div>
        {quote.notes && (
          <p className="text-sm text-slate-500 mt-2 border-t border-slate-100 pt-2">{quote.notes}</p>
        )}
      </div>

      <div className="px-6 py-6 space-y-6">

        {/* Alert: lines without price */}
        {linesWithoutPrice.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
            ⚠️ {linesWithoutPrice.length} línea{linesWithoutPrice.length > 1 ? "s" : ""} sin precio — pide al agente que envíe RFQs a proveedores
          </div>
        )}

        {/* BOM Table */}
        {bom.length > 0 && (
          <Section title="Materiales (BOM)" color="blue" lines={bom} subtotal={totalBOM} />
        )}

        {/* BOS Table */}
        {bos.length > 0 && (
          <Section title="Servicios (BOS)" color="purple" lines={bos} subtotal={totalBOS} />
        )}

        {/* Total summary */}
        <div className="bg-slate-900 rounded-2xl p-5 flex items-center justify-between">
          <div className="space-y-1">
            {totalBOM > 0 && <div className="text-sm text-slate-400">Materiales: <span className="text-white font-semibold">{totalBOM.toFixed(2)} €</span></div>}
            {totalBOS > 0 && <div className="text-sm text-slate-400">Servicios: <span className="text-white font-semibold">{totalBOS.toFixed(2)} €</span></div>}
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400 mb-1">TOTAL SIN IVA</div>
            <div className="text-4xl font-black text-white">{total.toFixed(2)} €</div>
            <div className="text-slate-400 text-sm mt-1">+IVA: {(total * 1.21).toFixed(2)} €</div>
          </div>
        </div>

        {/* RFQs */}
        {quote.rfqs.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-900">RFQs enviados</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {quote.rfqs.map((r) => (
                <div key={r.id} className="px-5 py-3 flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium text-slate-800">{r.supplierName ?? r.supplierEmail}</div>
                    <div className="text-xs text-slate-400">{r.supplierEmail}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      r.status === "responded" ? "bg-green-100 text-green-700" :
                      r.status === "pending" ? "bg-amber-100 text-amber-700" :
                      "bg-slate-100 text-slate-500"
                    }`}>
                      {r.status === "responded" ? `✓ ${r.responses.length} respuesta${r.responses.length > 1 ? "s" : ""}` : r.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function Section({ title, color, lines, subtotal }: {
  title: string;
  color: "blue" | "purple";
  lines: any[];
  subtotal: number;
}) {
  const colors = {
    blue:   { header: "bg-blue-600", badge: "bg-blue-50 text-blue-700", row: "hover:bg-blue-50/30" },
    purple: { header: "bg-purple-600", badge: "bg-purple-50 text-purple-700", row: "hover:bg-purple-50/30" },
  }[color];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Table header */}
      <div className={`${colors.header} px-5 py-3 flex items-center justify-between`}>
        <span className="font-bold text-white text-sm">{title}</span>
        <span className="text-white/80 text-sm font-semibold">{subtotal.toFixed(2)} €</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-5 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wide">Descripción</th>
              <th className="text-right px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wide">Cantidad</th>
              <th className="text-left px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wide">Unidad</th>
              <th className="text-right px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wide">Precio unit.</th>
              <th className="text-right px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wide">Total</th>
              <th className="text-left px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wide">Proveedor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {lines.map((l, i) => (
              <tr key={i} className={`${colors.row} transition-colors`}>
                <td className="px-5 py-3 font-medium text-slate-800">{l.description}</td>
                <td className="px-4 py-3 text-right text-slate-700 tabular-nums">{l.quantity}</td>
                <td className="px-4 py-3 text-slate-500">{l.unit}</td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {l.unitCost != null
                    ? <span className="text-slate-800">{l.unitCost.toFixed(2)} €</span>
                    : <span className="text-amber-500 font-medium">—</span>
                  }
                </td>
                <td className="px-4 py-3 text-right tabular-nums font-bold">
                  {l.totalCost != null
                    ? <span className="text-slate-900">{l.totalCost.toFixed(2)} €</span>
                    : <span className="text-amber-500">Sin precio</span>
                  }
                </td>
                <td className="px-4 py-3 text-slate-400 text-xs">
                  {l.supplier?.name ?? <span className="italic">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-200 bg-slate-50">
              <td colSpan={4} className="px-5 py-3 font-bold text-slate-700">Subtotal {title}</td>
              <td className="px-4 py-3 text-right font-black text-slate-900 tabular-nums">{subtotal.toFixed(2)} €</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
