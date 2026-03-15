export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import Link from "next/link";

const ORG_ID = process.env.OWNER_ORG_ID ?? "seed-org-id";

const STATUS_MAP: Record<string, { label: string; class: string }> = {
  draft:     { label: "Borrador",    class: "bg-slate-100 text-slate-600" },
  rfq_sent:  { label: "RFQ enviado", class: "bg-amber-100 text-amber-700" },
  quoted:    { label: "Cotizado",    class: "bg-blue-100 text-blue-700" },
  accepted:  { label: "Aceptado",   class: "bg-green-100 text-green-700" },
  rejected:  { label: "Rechazado",  class: "bg-red-100 text-red-700" },
};

export default async function QuotesPage() {
  const quotes = await prisma.quote.findMany({
    where: { organizationId: ORG_ID },
    include: { lines: true, rfqs: { include: { responses: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Presupuestos</h1>
          <p className="text-sm text-slate-500 mt-0.5">{quotes.length} presupuestos generados</p>
        </div>
        <Link
          href="/chat"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-colors"
        >
          + Nuevo presupuesto
        </Link>
      </div>

      {quotes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="text-4xl mb-3">📋</div>
          <div className="font-bold text-slate-700 mb-1">Aún no hay presupuestos</div>
          <p className="text-slate-400 text-sm mb-4">
            Habla con el agente y genera tu primer presupuesto en segundos.
          </p>
          <Link href="/chat" className="text-blue-600 font-semibold text-sm hover:underline">
            Ir al agente →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {quotes.map((q) => {
            const s = STATUS_MAP[q.status] ?? STATUS_MAP.draft;
            const responded = q.rfqs.filter((r) => r.status === "responded").length;
            const pending = q.rfqs.filter((r) => r.status === "pending").length;
            return (
              <div key={q.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-blue-200 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.class}`}>
                        {s.label}
                      </span>
                      {q.clientName && (
                        <span className="text-xs text-slate-400">Cliente: {q.clientName}</span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-900 truncate">{q.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                      <span>{q.lines.length} líneas</span>
                      {responded > 0 && <span className="text-green-600 font-medium">✓ {responded} cotización{responded > 1 ? "es" : ""} recibida{responded > 1 ? "s" : ""}</span>}
                      {pending > 0 && <span className="text-amber-600">{pending} RFQ pendiente{pending > 1 ? "s" : ""}</span>}
                      <span>{new Date(q.createdAt).toLocaleDateString("es-ES")}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    {q.totalCost ? (
                      <div className="text-xl font-black text-slate-900">{q.totalCost.toFixed(2)} €</div>
                    ) : (
                      <div className="text-slate-400 text-sm">Sin precio</div>
                    )}
                    {q.margin && (
                      <div className="text-xs text-green-600 font-medium">+{q.margin}% margen</div>
                    )}
                  </div>
                </div>

                {q.lines.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                    {q.lines.slice(0, 4).map((l, i) => (
                      <span key={i} className={`text-xs px-2 py-1 rounded-lg font-medium ${
                        l.type === "BOM" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"
                      }`}>
                        {l.description} × {l.quantity} {l.unit}
                      </span>
                    ))}
                    {q.lines.length > 4 && (
                      <span className="text-xs px-2 py-1 rounded-lg bg-slate-100 text-slate-500">
                        +{q.lines.length - 4} más
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
