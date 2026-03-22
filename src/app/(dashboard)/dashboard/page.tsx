export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import Link from "next/link";
import {
  FileText, Users, TrendingUp, Clock,
  AlertCircle, CheckCircle, ArrowRight,
  MessageSquare, ChevronRight, Package,
} from "lucide-react";

const ORG_ID = process.env.OWNER_ORG_ID ?? "seed-org-id";

// Component categories for Phoenix Wall progress tracking
const PHOENIX_COMPONENTS = [
  { key: "mdf",      label: "MDF 10mm 38×78cm",         category: "Madera" },
  { key: "chapa",    label: "Chapa acero 0.6mm",         category: "Metal" },
  { key: "perfil",   label: "Perfil SEG aluminio",       category: "SEG" },
  { key: "silicona", label: "Tira silicona SEG",         category: "SEG" },
  { key: "tela",     label: "Tela SEG",                  category: "Textil" },
  { key: "nfc",      label: "Chip NFC NTAG213",          category: "Electrónica" },
  { key: "iman",     label: "Imanes neodimio D5×2mm",   category: "Electrónica" },
  { key: "epoxy",    label: "Epoxy bicomponente",        category: "Adhesivos" },
];

export default async function DashboardPage() {
  const [quotes, supplierCount, rfqs, messages, waitlist] = await Promise.all([
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
    prisma.waitlist.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const accepted = quotes.filter((q) => q.status === "accepted");
  const thisMonth = accepted.filter((q) => new Date(q.createdAt) >= startOfMonth);
  const thisYear = accepted.filter((q) => new Date(q.createdAt) >= startOfYear);
  const totalSalesMonth = thisMonth.reduce((s, q) => s + (q.totalCost ?? 0), 0);
  const totalSalesYear = thisYear.reduce((s, q) => s + (q.totalCost ?? 0), 0);
  const monthsElapsed = now.getMonth() + 1;
  const avgMonthly = monthsElapsed > 0 ? totalSalesYear / monthsElapsed : 0;

  const pendingRFQs = rfqs.filter((r) => r.status === "pending");
  const respondedRFQs = rfqs.filter((r) => r.status === "responded");
  const allLines = quotes.flatMap((q) => q.lines);
  const missingPrices = allLines.filter((l) => !l.unitCost);

  // Phoenix Wall progress — check which components have confirmed prices
  const phoenixQuote = quotes.find((q) => q.title.toLowerCase().includes("phoenix"));
  const phoenixLines = phoenixQuote?.lines ?? [];
  const componentStatus = PHOENIX_COMPONENTS.map((comp) => {
    const line = phoenixLines.find((l) =>
      l.description.toLowerCase().includes(comp.key) ||
      l.description.toLowerCase().includes(comp.label.toLowerCase().split(" ")[0])
    );
    const hasPrice = line && line.unitCost != null;
    const hasSupplier = line && line.supplier != null;
    return { ...comp, hasPrice, hasSupplier, unitCost: line?.unitCost, unit: line?.unit };
  });
  const confirmedCount = componentStatus.filter((c) => c.hasPrice).length;
  const progressPct = Math.round((confirmedCount / PHOENIX_COMPONENTS.length) * 100);
  const phoenixTotal = phoenixQuote?.totalCost ?? phoenixLines.reduce((a, l) => a + (l.totalCost ?? 0), 0);

  const recentQuotes = quotes.slice(0, 4);

  return (
    <div className="flex-1 overflow-y-auto bg-[#f8f9fc]">
      {/* Top header */}
      <div className="bg-white border-b border-slate-100 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Panel de control</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {now.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <Link href="/quotes" className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
            Ver presupuestos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="px-6 py-6 space-y-5">

        {/* Alerts */}
        {(missingPrices.length > 0 || pendingRFQs.length > 0 || respondedRFQs.length > 0) && (
          <div className="space-y-2">
            {missingPrices.length > 0 && (
              <Alert icon={AlertCircle} color="amber" label={`${missingPrices.length} línea${missingPrices.length > 1 ? "s" : ""} sin precio`} sub="Pide al agente que envíe RFQs" href="/quotes" />
            )}
            {pendingRFQs.length > 0 && (
              <Alert icon={Clock} color="blue" label={`${pendingRFQs.length} RFQ${pendingRFQs.length > 1 ? "s" : ""} esperando respuesta`} sub="de proveedores" />
            )}
            {respondedRFQs.length > 0 && (
              <Alert icon={CheckCircle} color="green" label={`${respondedRFQs.length} cotización${respondedRFQs.length > 1 ? "es" : ""} recibida${respondedRFQs.length > 1 ? "s" : ""}`} sub="Revisa los precios" href="/quotes" />
            )}
          </div>
        )}

        {/* KPI row */}
        <div className="grid grid-cols-4 gap-3">
          <KpiCard label="Ventas este mes" value={`${totalSalesMonth.toFixed(0)} €`} sub={`${thisMonth.length} pedidos`} accent="emerald" />
          <KpiCard label="Ventas este año" value={`${totalSalesYear.toFixed(0)} €`} sub={`${thisYear.length} pedidos`} accent="blue" />
          <KpiCard label="Proveedores" value={String(supplierCount)} sub="en la red" accent="violet" />
          <KpiCard label="Mensajes al agente" value={String(messages)} sub="conversaciones" accent="slate" />
        </div>

        {/* Phoenix Wall progress */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-black text-slate-900">Proyecto Phoenix Wall</h2>
              <p className="text-xs text-slate-400 mt-0.5">Progreso de precios confirmados</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-slate-900">{progressPct}%</div>
              {phoenixTotal > 0 && (
                <div className="text-xs text-slate-400">{phoenixTotal.toFixed(2)} € / módulo</div>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="px-5 pt-4 pb-2">
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${progressPct}%`,
                  background: progressPct === 100
                    ? "linear-gradient(90deg, #10b981, #059669)"
                    : progressPct > 50
                    ? "linear-gradient(90deg, #3b82f6, #6366f1)"
                    : "linear-gradient(90deg, #f59e0b, #f97316)",
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-1.5">
              <span>{confirmedCount} de {PHOENIX_COMPONENTS.length} componentes con precio</span>
              <span>{PHOENIX_COMPONENTS.length - confirmedCount} pendientes</span>
            </div>
          </div>

          {/* Component grid */}
          <div className="px-5 pb-5 mt-2 grid grid-cols-2 gap-2">
            {componentStatus.map((comp) => (
              <div key={comp.key} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 border ${
                comp.hasPrice
                  ? "bg-emerald-50 border-emerald-100"
                  : "bg-amber-50 border-amber-100"
              }`}>
                <div className={`w-2 h-2 rounded-full shrink-0 ${comp.hasPrice ? "bg-emerald-400" : "bg-amber-400"}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-700 truncate">{comp.label}</div>
                  <div className="text-xs text-slate-400">{comp.category}</div>
                </div>
                <div className="text-xs font-bold tabular-nums shrink-0">
                  {comp.hasPrice
                    ? <span className="text-emerald-700">{comp.unitCost?.toFixed(2)} €/{comp.unit}</span>
                    : <span className="text-amber-500">—</span>
                  }
                </div>
              </div>
            ))}
          </div>

          {phoenixQuote && (
            <div className="px-5 pb-4">
              <Link href={`/quotes/${phoenixQuote.id}`} className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl py-2 hover:bg-slate-50 transition-colors">
                <Package className="w-4 h-4" />
                Ver presupuesto completo
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Stats mini */}
        <div className="grid grid-cols-3 gap-3">
          <StatMini label="Presupuestos" value={quotes.length} icon={FileText} />
          <StatMini label="RFQs enviados" value={rfqs.length} icon={Clock} />
          <StatMini label="RFQs respondidos" value={respondedRFQs.length} icon={TrendingUp} />
        </div>

        {/* Recent quotes */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-900">Últimos presupuestos</h2>
            <Link href="/quotes" className="text-sm text-blue-600 hover:underline font-medium flex items-center gap-1">
              Ver todos <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {recentQuotes.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <div className="text-3xl mb-2">💬</div>
              <p className="text-slate-400 text-sm">Usa el agente para generar tu primer presupuesto</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentQuotes.map((q) => {
                const responded = q.rfqs.filter((r) => r.status === "responded").length;
                return (
                  <Link key={q.id} href={`/quotes/${q.id}`} className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div>
                      <div className="font-semibold text-slate-800 text-sm">{q.title}</div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-slate-400">{new Date(q.createdAt).toLocaleDateString("es-ES")}</span>
                        {responded > 0 && <span className="text-xs text-emerald-600 font-medium">✓ {responded} cotización{responded > 1 ? "es" : ""}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={q.status} />
                      <span className="font-bold text-slate-900 text-sm w-20 text-right">
                        {q.totalCost ? `${q.totalCost.toFixed(2)} €` : "—"}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Waitlist */}
        {waitlist.length > 0 && (
          <div className="bg-white rounded-2xl border border-amber-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-amber-100 flex items-center gap-2">
              <span className="text-amber-500">⏳</span>
              <h2 className="font-bold text-slate-900">Lista de espera ({waitlist.length})</h2>
              <span className="text-xs text-slate-400 ml-auto">Añade el email a ALLOWED_EMAILS en Vercel para dar acceso</span>
            </div>
            <div className="divide-y divide-slate-100">
              {waitlist.map((w) => (
                <div key={w.id} className="px-5 py-3 flex items-center gap-3">
                  {w.image && <img src={w.image} alt="" className="w-7 h-7 rounded-full" />}
                  <div>
                    <div className="text-sm font-medium text-slate-800">{w.name ?? "—"}</div>
                    <div className="text-xs text-slate-400 select-all">{w.email}</div>
                  </div>
                  <div className="ml-auto text-xs text-slate-400">{new Date(w.createdAt).toLocaleDateString("es-ES")}</div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function KpiCard({ label, value, sub, accent }: { label: string; value: string; sub: string; accent: string }) {
  const colors: Record<string, string> = {
    emerald: "from-emerald-500 to-emerald-600",
    blue: "from-blue-500 to-blue-600",
    violet: "from-violet-500 to-violet-600",
    slate: "from-slate-600 to-slate-700",
  };
  return (
    <div className={`bg-gradient-to-br ${colors[accent] ?? colors.slate} rounded-2xl p-5 text-white`}>
      <div className="text-xs font-semibold text-white/70 uppercase tracking-wide mb-2">{label}</div>
      <div className="text-3xl font-black">{value}</div>
      <div className="text-xs text-white/60 mt-1">{sub}</div>
    </div>
  );
}

function StatMini({ label, value, icon: Icon }: { label: string; value: number; icon: React.ElementType }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <Icon className="w-4 h-4 text-slate-400 mb-2" />
      <div className="text-2xl font-black text-slate-900">{value}</div>
      <div className="text-xs text-slate-400 mt-0.5">{label}</div>
    </div>
  );
}

function Alert({ icon: Icon, color, label, sub, href }: {
  icon: React.ElementType; color: string; label: string; sub: string; href?: string;
}) {
  const c: Record<string, string> = {
    amber: "bg-amber-50 border-amber-200 text-amber-800",
    blue: "bg-blue-50 border-blue-200 text-blue-800",
    green: "bg-emerald-50 border-emerald-200 text-emerald-800",
  };
  const ic: Record<string, string> = { amber: "text-amber-500", blue: "text-blue-500", green: "text-emerald-500" };
  return (
    <div className={`rounded-xl border px-4 py-3 flex items-center gap-3 ${c[color]}`}>
      <Icon className={`w-4 h-4 shrink-0 ${ic[color]}`} />
      <div className="flex-1 text-sm">
        <span className="font-semibold">{label}</span>
        <span className="opacity-70 ml-2">{sub}</span>
      </div>
      {href && (
        <Link href={href} className="text-xs font-bold opacity-70 hover:opacity-100 shrink-0">Ver →</Link>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; class: string }> = {
    draft:    { label: "Borrador",    class: "bg-slate-100 text-slate-500" },
    rfq_sent: { label: "RFQ enviado", class: "bg-amber-100 text-amber-700" },
    quoted:   { label: "Cotizado",    class: "bg-blue-100 text-blue-700" },
    accepted: { label: "Aceptado",    class: "bg-emerald-100 text-emerald-700" },
    rejected: { label: "Rechazado",   class: "bg-red-100 text-red-700" },
  };
  const s = map[status] ?? map.draft;
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.class}`}>{s.label}</span>;
}
