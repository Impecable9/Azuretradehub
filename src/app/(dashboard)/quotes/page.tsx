export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";

const ORG_ID = process.env.OWNER_ORG_ID ?? "seed-org-id";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  draft:    { label: "BORRADOR",    color: "bg-slate-200 text-slate-700" },
  rfq_sent: { label: "RFQ ENVIADO", color: "bg-amber-300 text-amber-900" },
  quoted:   { label: "COTIZADO",    color: "bg-blue-200 text-blue-900" },
  accepted: { label: "ACEPTADO",    color: "bg-[#d6ff6b] text-slate-900" },
  rejected: { label: "RECHAZADO",   color: "bg-rose-200 text-rose-900" },
};

export default async function QuotesPage() {
  const quotes = await prisma.quote.findMany({
    where: { organizationId: ORG_ID },
    include: { lines: true, rfqs: { include: { responses: true } } },
    orderBy: { createdAt: "desc" },
  });

  const total = quotes.reduce((a, q) => a + (q.totalCost ?? 0), 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Presupuestos</h1>
          <p className="text-sm text-slate-400 mt-1">{quotes.length} presupuesto{quotes.length !== 1 ? "s" : ""} · {total.toFixed(2)} € valor total</p>
        </div>
        <Link
          href="/chat"
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white text-sm font-bold px-4 py-2.5 rounded-2xl transition-all duration-200 hover:scale-105"
        >
          <Plus className="w-4 h-4" /> Nuevo presupuesto
        </Link>
      </div>

      {quotes.length === 0 ? (
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-white shadow-sm p-16 text-center">
          <div className="text-5xl mb-4">📋</div>
          <div className="font-black text-slate-700 text-lg mb-2">Aún no hay presupuestos</div>
          <p className="text-slate-400 text-sm mb-6">Habla con el agente y genera tu primer presupuesto en segundos.</p>
          <Link href="/chat" className="inline-flex items-center gap-2 bg-slate-900 text-white font-bold px-5 py-2.5 rounded-2xl hover:bg-slate-700 transition-all">
            Ir al agente <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-white shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="px-6 py-3.5 border-b border-slate-100 grid grid-cols-12 gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <span className="col-span-1">Nº</span>
            <span className="col-span-4">Presupuesto</span>
            <span className="col-span-2">Estado</span>
            <span className="col-span-2">Líneas</span>
            <span className="col-span-2 text-right">Total</span>
            <span className="col-span-1" />
          </div>

          {/* Rows */}
          <div className="divide-y divide-slate-100/60">
            {quotes.map((q, idx) => {
              const st = STATUS_MAP[q.status] ?? STATUS_MAP.draft;
              const responded = q.rfqs.filter((r) => r.status === "responded").length;
              const pending = q.rfqs.filter((r) => r.status === "pending").length;
              const withPrice = q.lines.filter((l) => l.unitCost).length;

              return (
                <Link
                  key={q.id}
                  href={`/quotes/${q.id}`}
                  className="px-6 py-4 grid grid-cols-12 gap-4 items-center hover:bg-violet-50/40 transition-colors duration-150 group"
                >
                  <div className="col-span-1 text-slate-300 font-black text-sm tabular-nums">
                    #{String(quotes.length - idx).padStart(3, "0")}
                  </div>
                  <div className="col-span-4">
                    <div className="font-bold text-slate-800 text-sm group-hover:text-violet-700 transition-colors leading-tight">{q.title}</div>
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
