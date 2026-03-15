import { prisma } from "@/lib/db";
import Link from "next/link";
import { FileText, Users, TrendingUp, Clock } from "lucide-react";

const ORG_ID = process.env.OWNER_ORG_ID ?? "seed-org-id";

export default async function DashboardPage() {
  const [quotes, suppliers, rfqs] = await Promise.all([
    prisma.quote.findMany({
      where: { organizationId: ORG_ID },
      include: { lines: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.supplier.count(),
    prisma.rFQ.findMany({
      where: { quote: { organizationId: ORG_ID } },
      include: { responses: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const totalQuotesValue = quotes.reduce((sum, q) => sum + (q.totalCost ?? 0), 0);
  const pendingRFQs = rfqs.filter((r) => r.status === "pending").length;
  const respondedRFQs = rfqs.filter((r) => r.status === "responded").length;

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6">
      <h1 className="text-2xl font-black text-slate-900 mb-6">Dashboard</h1>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard icon={FileText} label="Presupuestos" value={quotes.length.toString()} sub="últimos generados" color="blue" />
        <StatCard icon={Users} label="Proveedores" value={suppliers.toString()} sub="en la red" color="purple" />
        <StatCard icon={TrendingUp} label="Valor total" value={`${totalQuotesValue.toFixed(0)} €`} sub="en presupuestos" color="green" />
        <StatCard icon={Clock} label="RFQ pendientes" value={pendingRFQs.toString()} sub={`${respondedRFQs} respondidos`} color="amber" />
      </div>

      {/* Recent quotes */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900">Últimos presupuestos</h2>
          <Link href="/quotes" className="text-sm text-blue-600 hover:underline">Ver todos →</Link>
        </div>
        {quotes.length === 0 ? (
          <div className="px-5 py-10 text-center text-slate-400 text-sm">
            Aún no hay presupuestos. <Link href="/chat" className="text-blue-600 hover:underline">Empieza hablando con el agente →</Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {quotes.map((q) => (
              <div key={q.id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50">
                <div>
                  <div className="font-medium text-slate-800 text-sm">{q.title}</div>
                  <div className="text-xs text-slate-400">{new Date(q.createdAt).toLocaleDateString("es-ES")}</div>
                </div>
                <div className="flex items-center gap-4">
                  <StatusBadge status={q.status} />
                  <div className="font-bold text-slate-900">
                    {q.totalCost ? `${q.totalCost.toFixed(2)} €` : "—"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent RFQs */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-900">RFQs enviados</h2>
        </div>
        {rfqs.length === 0 ? (
          <div className="px-5 py-10 text-center text-slate-400 text-sm">
            Aún no has enviado solicitudes de cotización a proveedores.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {rfqs.map((r) => (
              <div key={r.id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50">
                <div>
                  <div className="font-medium text-slate-800 text-sm">{r.supplierEmail}</div>
                  <div className="text-xs text-slate-400">
                    Vence: {new Date(r.expiresAt).toLocaleDateString("es-ES")}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    r.status === "responded"
                      ? "bg-green-100 text-green-700"
                      : r.status === "expired"
                      ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-700"
                  }`}>
                    {r.status === "responded" ? "Respondido" : r.status === "expired" ? "Vencido" : "Pendiente"}
                  </span>
                  {r.responses.length > 0 && (
                    <span className="text-sm font-bold text-green-700">
                      {r.responses[0].totalPrice.toFixed(2)} €
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
  color: "blue" | "purple" | "green" | "amber";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600",
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className={`inline-flex p-2 rounded-xl mb-3 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-2xl font-black text-slate-900">{value}</div>
      <div className="text-sm font-semibold text-slate-700">{label}</div>
      <div className="text-xs text-slate-400 mt-0.5">{sub}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; class: string }> = {
    draft: { label: "Borrador", class: "bg-slate-100 text-slate-600" },
    rfq_sent: { label: "RFQ enviado", class: "bg-amber-100 text-amber-700" },
    quoted: { label: "Cotizado", class: "bg-blue-100 text-blue-700" },
    accepted: { label: "Aceptado", class: "bg-green-100 text-green-700" },
    rejected: { label: "Rechazado", class: "bg-red-100 text-red-700" },
  };
  const s = map[status] ?? { label: status, class: "bg-slate-100 text-slate-600" };
  return <span className={`text-xs font-semibold px-2 py-1 rounded-full ${s.class}`}>{s.label}</span>;
}
