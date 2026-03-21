export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import Link from "next/link";
import { FileText, Users, TrendingUp, Clock, AlertCircle, CheckCircle, ArrowRight, MessageSquare } from "lucide-react";

const ORG_ID = process.env.OWNER_ORG_ID ?? "seed-org-id";

export default async function DashboardPage() {
  const [quotes, suppliers, rfqs, messages, waitlist] = await Promise.all([
    prisma.quote.findMany({
      where: { organizationId: ORG_ID },
      include: { lines: true, rfqs: { include: { responses: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.supplier.count(),
    prisma.rFQ.findMany({
      where: { quote: { organizationId: ORG_ID } },
      include: { responses: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.message.count({
      where: { conversation: { organizationId: ORG_ID } },
    }),
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

  const pendingRFQs = rfqs.filter((r) => r.status === "pending");
  const respondedRFQs = rfqs.filter((r) => r.status === "responded");

  // Lines without price
  const missingPrices = quotes.flatMap((q) =>
    q.lines.filter((l) => !l.unitCost)
  );

  // Forecast: avg monthly sales × remaining months
  const monthsElapsed = now.getMonth() + 1;
  const avgMonthly = monthsElapsed > 0 ? totalSalesYear / monthsElapsed : 0;
  const forecastYear = avgMonthly * 12;
  const forecastNextMonth = avgMonthly;

  const recentQuotes = quotes.slice(0, 4);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      {/* Top header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Panel de control</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <Link
            href="/quotes"
            className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
          >
            Ver todos los presupuestos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">

        {/* Alerts */}
        {(missingPrices.length > 0 || pendingRFQs.length > 0) && (
          <div className="space-y-2">
            {missingPrices.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                <div className="flex-1">
                  <span className="font-semibold text-amber-800 text-sm">
                    {missingPrices.length} línea{missingPrices.length > 1 ? "s" : ""} sin precio
                  </span>
                  <span className="text-amber-600 text-sm ml-2">
                    — pide al agente que envíe RFQs a proveedores
                  </span>
                </div>
                <Link href="/quotes" className="text-xs font-bold text-amber-700 hover:underline shrink-0">
                  Ver →
                </Link>
              </div>
            )}
            {pendingRFQs.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-500 shrink-0" />
                <div className="flex-1">
                  <span className="font-semibold text-blue-800 text-sm">
                    {pendingRFQs.length} RFQ{pendingRFQs.length > 1 ? "s" : ""} esperando respuesta
                  </span>
                  <span className="text-blue-600 text-sm ml-2">de proveedores</span>
                </div>
              </div>
            )}
            {respondedRFQs.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                <div className="flex-1">
                  <span className="font-semibold text-green-800 text-sm">
                    {respondedRFQs.length} cotización{respondedRFQs.length > 1 ? "es" : ""} recibida{respondedRFQs.length > 1 ? "s" : ""}
                  </span>
                  <span className="text-green-600 text-sm ml-2">— revisa los precios</span>
                </div>
                <Link href="/quotes" className="text-xs font-bold text-green-700 hover:underline shrink-0">
                  Revisar →
                </Link>
              </div>
            )}
          </div>
        )}

        {/* KPI grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Sales this month */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 col-span-1">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Ventas este mes</span>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-3xl font-black text-slate-900">{totalSalesMonth.toFixed(0)} €</div>
            <div className="text-xs text-slate-400 mt-1">{thisMonth.length} pedido{thisMonth.length !== 1 ? "s" : ""} cerrado{thisMonth.length !== 1 ? "s" : ""}</div>
          </div>

          {/* Sales this year */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 col-span-1">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Ventas este año</span>
              <TrendingUp className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-3xl font-black text-slate-900">{totalSalesYear.toFixed(0)} €</div>
            <div className="text-xs text-slate-400 mt-1">{thisYear.length} pedido{thisYear.length !== 1 ? "s" : ""} cerrado{thisYear.length !== 1 ? "s" : ""}</div>
          </div>

          {/* Forecast next month */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-5 col-span-1">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-blue-200 uppercase tracking-wide">Pronóstico mes siguiente</span>
            </div>
            <div className="text-3xl font-black text-white">
              {forecastNextMonth > 0 ? `${forecastNextMonth.toFixed(0)} €` : "—"}
            </div>
            <div className="text-xs text-blue-200 mt-1">
              {forecastNextMonth > 0 ? "Basado en media mensual" : "Sin datos suficientes aún"}
            </div>
          </div>

          {/* Forecast year */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 col-span-1">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Pronóstico anual</span>
            </div>
            <div className="text-3xl font-black text-white">
              {forecastYear > 0 ? `${forecastYear.toFixed(0)} €` : "—"}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {forecastYear > 0 ? `Media de ${avgMonthly.toFixed(0)} €/mes` : "Cierra tu primera venta"}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3">
          <StatMini label="Presupuestos" value={quotes.length} icon={FileText} />
          <StatMini label="Proveedores" value={suppliers} icon={Users} />
          <StatMini label="RFQs enviados" value={rfqs.length} icon={Clock} />
          <StatMini label="Mensajes al agente" value={messages} icon={MessageSquare} />
        </div>

        {/* Recent quotes */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-900">Últimos presupuestos</h2>
            <Link href="/quotes" className="text-sm text-blue-600 hover:underline font-medium">
              Ver todos →
            </Link>
          </div>
          {recentQuotes.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <div className="text-3xl mb-2">💬</div>
              <p className="text-slate-400 text-sm">
                Usa el agente para generar tu primer presupuesto
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentQuotes.map((q) => {
                const responded = q.rfqs.filter((r) => r.status === "responded").length;
                return (
                  <div key={q.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <div className="font-medium text-slate-800 text-sm">{q.title}</div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-slate-400">
                          {new Date(q.createdAt).toLocaleDateString("es-ES")}
                        </span>
                        {responded > 0 && (
                          <span className="text-xs text-green-600 font-medium">
                            ✓ {responded} cotización{responded > 1 ? "es" : ""}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={q.status} />
                      <span className="font-bold text-slate-900 text-sm">
                        {q.totalCost ? `${q.totalCost.toFixed(2)} €` : "—"}
                      </span>
                    </div>
                  </div>
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
                  <div className="ml-auto text-xs text-slate-400">
                    {new Date(w.createdAt).toLocaleDateString("es-ES")}
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

function StatMini({ label, value, icon: Icon }: { label: string; value: number; icon: React.ElementType }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <Icon className="w-4 h-4 text-slate-400 mb-2" />
      <div className="text-xl font-black text-slate-900">{value}</div>
      <div className="text-xs text-slate-400 mt-0.5">{label}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; class: string }> = {
    draft:    { label: "Borrador",    class: "bg-slate-100 text-slate-500" },
    rfq_sent: { label: "RFQ enviado", class: "bg-amber-100 text-amber-700" },
    quoted:   { label: "Cotizado",    class: "bg-blue-100 text-blue-700" },
    accepted: { label: "Aceptado",    class: "bg-green-100 text-green-700" },
    rejected: { label: "Rechazado",   class: "bg-red-100 text-red-700" },
  };
  const s = map[status] ?? map.draft;
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.class}`}>
      {s.label}
    </span>
  );
}

