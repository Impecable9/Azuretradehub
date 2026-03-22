export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import Link from "next/link";
import { ArrowRight, ChevronRight, Package, AlertCircle, Clock, CheckCircle } from "lucide-react";

const ORG_ID = process.env.OWNER_ORG_ID ?? "seed-org-id";

const PHOENIX_COMPONENTS = [
  { key: "mdf",      label: "MDF 10mm 38×78cm",       category: "Madera" },
  { key: "chapa",    label: "Chapa acero 0.6mm",       category: "Metal" },
  { key: "perfil",   label: "Perfil SEG aluminio",     category: "SEG" },
  { key: "silicona", label: "Silicona SEG",            category: "SEG" },
  { key: "tela",     label: "Tela SEG",                category: "Textil" },
  { key: "nfc",      label: "Chip NFC NTAG213",        category: "Electrónica" },
  { key: "iman",     label: "Imanes neodimio",         category: "Electrónica" },
  { key: "epoxy",    label: "Epoxy bicomponente",      category: "Adhesivos" },
];

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  draft:    { label: "BORRADOR",    color: "bg-slate-200 text-slate-600" },
  rfq_sent: { label: "RFQ ENVIADO", color: "bg-amber-300 text-amber-900" },
  quoted:   { label: "COTIZADO",    color: "bg-blue-200 text-blue-800" },
  accepted: { label: "ACEPTADO",    color: "bg-[#d6ff6b] text-slate-900" },
  rejected: { label: "RECHAZADO",   color: "bg-rose-200 text-rose-800" },
};

export default async function DashboardPage() {
  const [quotes, supplierCount, rfqs, messages] = await Promise.all([
    prisma.quote.findMany({
      where: { organizationId: ORG_ID },
      include: { lines: { include: { supplier: true } }, rfqs: { include: { responses: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.supplier.count(),
    prisma.rFQ.findMany({
      where: { quote: { organizationId: ORG_ID } },
      include: { responses: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.message.count({ where: { conversation: { organizationId: ORG_ID } } }),
  ]);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const accepted = quotes.filter((q) => q.status === "accepted");
  const thisMonth = accepted.filter((q) => new Date(q.createdAt) >= startOfMonth);
  const totalMonth = thisMonth.reduce((s, q) => s + (q.totalCost ?? 0), 0);
  const totalAll = accepted.reduce((s, q) => s + (q.totalCost ?? 0), 0);
  const allLines = quotes.flatMap((q) => q.lines);
  const missingPrices = allLines.filter((l) => !l.unitCost);
  const pendingRFQs = rfqs.filter((r) => r.status === "pending");
  const respondedRFQs = rfqs.filter((r) => r.status === "responded");

  // Phoenix Wall progress
  const phoenixQuote = quotes.find((q) => q.title.toLowerCase().includes("phoenix"));
  const phoenixLines = phoenixQuote?.lines ?? [];
  const componentStatus = PHOENIX_COMPONENTS.map((comp) => {
    const line = phoenixLines.find((l) =>
      l.description.toLowerCase().includes(comp.key) ||
      l.description.toLowerCase().includes(comp.label.toLowerCase().split(" ")[0])
    );
    return { ...comp, hasPrice: !!(line?.unitCost), unitCost: line?.unitCost, unit: line?.unit };
  });
  const confirmedCount = componentStatus.filter((c) => c.hasPrice).length;
  const progressPct = Math.round((confirmedCount / PHOENIX_COMPONENTS.length) * 100);
  const phoenixTotal = phoenixLines.reduce((a, l) => a + (l.totalCost ?? 0), 0);

  const recentQuotes = quotes.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {(missingPrices.length > 0 || pendingRFQs.length > 0 || respondedRFQs.length > 0) && (
        <div className="space-y-2">
          {missingPrices.length > 0 && (
            <div className="flex items-center gap-3 bg-amber-50/80 border border-amber-200 rounded-2xl px-4 py-3 backdrop-blur-sm">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="text-sm text-amber-800 font-medium">{missingPrices.length} líneas sin precio</span>
              <span className="text-sm text-amber-600">— pide al agente que envíe RFQs</span>
              <Link href="/quotes" className="ml-auto text-xs font-bold text-amber-700 hover:underline">Ver →</Link>
            </div>
          )}
          {respondedRFQs.length > 0 && (
            <div className="flex items-center gap-3 bg-emerald-50/80 border border-emerald-200 rounded-2xl px-4 py-3">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="text-sm text-emerald-800 font-medium">{respondedRFQs.length} cotizaciones recibidas</span>
              <Link href="/quotes" className="ml-auto text-xs font-bold text-emerald-700 hover:underline">Revisar →</Link>
            </div>
          )}
          {pendingRFQs.length > 0 && (
            <div className="flex items-center gap-3 bg-blue-50/80 border border-blue-200 rounded-2xl px-4 py-3">
              <Clock className="w-4 h-4 text-blue-500 shrink-0" />
              <span className="text-sm text-blue-800 font-medium">{pendingRFQs.length} RFQs esperando respuesta</span>
            </div>
          )}
        </div>
      )}

      {/* Hero row */}
      <div className="grid grid-cols-12 gap-4">
        {/* Main KPI */}
        <div className="col-span-5 bg-slate-900 rounded-3xl p-7 flex flex-col justify-between min-h-[180px] relative overflow-hidden">
          <div className="absolute inset-0 opacity-20"
            style={{ background: "radial-gradient(ellipse at top right, #7c3aed, transparent 60%), radial-gradient(ellipse at bottom left, #2563eb, transparent 60%)" }} />
          <div className="relative">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Este mes</div>
            <div className="text-5xl font-black text-white tracking-tight">
              {totalMonth.toFixed(0)} <span className="text-2xl text-slate-400">€</span>
            </div>
            <div className="text-slate-400 text-sm mt-2">
              {thisMonth.length} pedidos cerrados · Total acumulado {totalAll.toFixed(0)} €
            </div>
          </div>
          <Link href="/quotes" className="relative flex items-center gap-2 text-sm font-semibold text-white/70 hover:text-white transition-colors w-fit">
            Ver presupuestos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Stats column */}
        <div className="col-span-3 flex flex-col gap-4">
          <StatCard label="Proveedores" value={supplierCount} sub="en la red" color="violet" />
          <StatCard label="RFQs totales" value={rfqs.length} sub={`${respondedRFQs.length} respondidos`} color="blue" />
        </div>

        {/* Phoenix Wall progress */}
        <div className="col-span-4 bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-white shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Phoenix Wall</div>
              <div className="text-2xl font-black text-slate-900 mt-0.5">{progressPct}%</div>
            </div>
            {phoenixTotal > 0 && (
              <div className="text-right">
                <div className="text-xs text-slate-400">Coste base</div>
                <div className="text-lg font-black text-slate-800">{phoenixTotal.toFixed(2)} €</div>
              </div>
            )}
          </div>
          {/* Progress bar */}
          <div className="h-2 bg-slate-100 rounded-full mb-4 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${progressPct}%`,
                background: progressPct === 100 ? "#10b981" : progressPct > 50 ? "#7c3aed" : "#f59e0b",
              }}
            />
          </div>
          {/* Mini component list */}
          <div className="space-y-1.5">
            {componentStatus.slice(0, 4).map((c) => (
              <div key={c.key} className="flex items-center gap-2 text-xs">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.hasPrice ? "bg-emerald-400" : "bg-amber-400"}`} />
                <span className="text-slate-600 flex-1 truncate">{c.label}</span>
                <span className={`font-semibold tabular-nums ${c.hasPrice ? "text-slate-700" : "text-amber-500"}`}>
                  {c.hasPrice ? `${c.unitCost?.toFixed(2)} €` : "—"}
                </span>
              </div>
            ))}
            {componentStatus.length > 4 && (
              <div className="text-xs text-slate-400 pl-3">+{componentStatus.length - 4} componentes más</div>
            )}
          </div>
          {phoenixQuote && (
            <Link href={`/quotes/${phoenixQuote.id}`} className="mt-3 flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-800 transition-colors">
              <Package className="w-3 h-3" /> Ver presupuesto completo
            </Link>
          )}
        </div>
      </div>

      {/* Recent quotes table */}
      <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100">
          <h2 className="font-black text-slate-900 uppercase tracking-wide text-sm">Últimos presupuestos</h2>
          <Link href="/quotes" className="text-xs font-bold text-slate-400 hover:text-slate-700 flex items-center gap-1 transition-colors">
            Ver todos <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentQuotes.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="text-3xl mb-2">💬</div>
            <p className="text-slate-400 text-sm">Usa el agente para generar tu primer presupuesto</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100/80">
            {/* Header row */}
            <div className="px-6 py-2.5 grid grid-cols-12 gap-4 text-xs font-bold text-slate-400 uppercase tracking-wide">
              <span className="col-span-5">Presupuesto</span>
              <span className="col-span-2">Estado</span>
              <span className="col-span-2">RFQs</span>
              <span className="col-span-2 text-right">Total</span>
              <span className="col-span-1" />
            </div>
            {recentQuotes.map((q) => {
              const responded = q.rfqs.filter((r) => r.status === "responded").length;
              const pending = q.rfqs.filter((r) => r.status === "pending").length;
              const st = STATUS_MAP[q.status] ?? STATUS_MAP.draft;
              return (
                <Link
                  key={q.id}
                  href={`/quotes/${q.id}`}
                  className="px-6 py-4 grid grid-cols-12 gap-4 items-center hover:bg-violet-50/40 transition-colors duration-150 group"
                >
                  <div className="col-span-5">
                    <div className="font-semibold text-slate-800 text-sm group-hover:text-violet-700 transition-colors">{q.title}</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {new Date(q.createdAt).toLocaleDateString("es-ES")}
                      {q.clientName && ` · ${q.clientName}`}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${st.color}`}>{st.label}</span>
                  </div>
                  <div className="col-span-2 text-sm text-slate-500">
                    {responded > 0 && <span className="text-emerald-600 font-medium">✓ {responded}</span>}
                    {pending > 0 && <span className="text-amber-500 ml-1">{pending} pend.</span>}
                    {responded === 0 && pending === 0 && <span className="text-slate-300">—</span>}
                  </div>
                  <div className="col-span-2 text-right font-black text-slate-900 tabular-nums">
                    {q.totalCost ? `${q.totalCost.toFixed(2)} €` : <span className="text-slate-300 font-normal">—</span>}
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-violet-400 transition-colors" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color }: { label: string; value: number; sub: string; color: string }) {
  const gradients: Record<string, string> = {
    violet: "from-violet-500 to-purple-600",
    blue: "from-blue-500 to-cyan-500",
  };
  return (
    <div className={`flex-1 bg-gradient-to-br ${gradients[color]} rounded-2xl p-5 text-white flex flex-col justify-between`}>
      <div className="text-xs font-bold text-white/60 uppercase tracking-widest">{label}</div>
      <div>
        <div className="text-3xl font-black">{value}</div>
        <div className="text-xs text-white/60 mt-0.5">{sub}</div>
      </div>
    </div>
  );
}
