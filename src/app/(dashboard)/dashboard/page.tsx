export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import Link from "next/link";
import { ArrowRight, ChevronRight, AlertCircle, CheckCircle, Building2, Truck, Target, TrendingUp, Grid3x3, FileText } from "lucide-react";

const ORG_ID = process.env.OWNER_ORG_ID ?? "seed-org-id";

const PHOENIX_COMPONENTS = [
  { key: "mdf",       label: "MDF 8mm 780×390mm",       category: "Tablero" },
  { key: "chapa",     label: "Chapa magnética 0.5mm",   category: "Tablero" },
  { key: "iman",      label: "Imanes D5×2mm N52 ×336",  category: "Tablero" },
  { key: "perfil",    label: "Perfil SEG aluminio",     category: "SEG" },
  { key: "tela",      label: "Tela SEG impresa",        category: "SEG" },
  { key: "heartframe",label: "Heartframe PLA + NFC",    category: "Accesorio" },
  { key: "epoxy",     label: "Epoxy bicomponente",      category: "Adhesivos" },
  { key: "packaging", label: "Packaging / caja",        category: "Logística" },
];

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  draft:    { label: "BORRADOR",    color: "bg-slate-100 text-slate-500" },
  rfq_sent: { label: "RFQ ENVIADO", color: "bg-orange-100 text-orange-700" },
  quoted:   { label: "COTIZADO",    color: "bg-blue-100 text-blue-700" },
  accepted: { label: "PAGADO",      color: "bg-[#c8ff57] text-slate-900" },
  rejected: { label: "RECHAZADO",   color: "bg-red-100 text-red-700" },
};

export default async function DashboardPage() {
  const [quotes, supplierCount, rawWaitlist] = await Promise.all([
    prisma.quote.findMany({
      where: { organizationId: ORG_ID },
      include: { lines: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.supplier.count(),
    prisma.waitlist.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  // Cast para evitar errores de lint si prisma generate tarda en refrescar tipos
  const waitlist = rawWaitlist as any[];

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const accepted = quotes.filter((q) => q.status === "accepted");
  const thisMonth = accepted.filter((q) => new Date(q.createdAt) >= startOfMonth);
  const totalMonth = thisMonth.reduce((s, q) => s + (q.totalCost ?? 0), 0);
  const totalAll = accepted.reduce((s, q) => s + (q.totalCost ?? 0), 0);
  const allLines = quotes.flatMap((q) => q.lines);
  const missingPrices = allLines.filter((l) => !l.unitCost);
  const pendingRFQs    = 0;
  const respondedRFQs: any[] = [];

  const recentQuotes = quotes.slice(0, 5);
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

  return (
    <div className="space-y-5">
      {/* Alerts */}
      {(missingPrices.length > 0 || respondedRFQs.length > 0 || pendingRFQs.length > 0) && (
        <div className="space-y-2">
          {missingPrices.length > 0 && (
            <div className="flex items-center gap-3 bg-white rounded-2xl border border-orange-100 shadow-sm px-4 py-3">
              <AlertCircle className="w-4 h-4 text-orange-400 shrink-0" />
              <span className="text-sm font-semibold text-slate-700">{missingPrices.length} líneas sin precio</span>
              <span className="text-sm text-slate-400">— solicita RFQs al agente</span>
              <Link href="/quotes" className="ml-auto text-xs font-bold text-orange-500 hover:text-orange-700">Ver →</Link>
            </div>
          )}
          {respondedRFQs.length > 0 && (
            <div className="flex items-center gap-3 bg-white rounded-2xl border border-green-100 shadow-sm px-4 py-3">
              <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
              <span className="text-sm font-semibold text-slate-700">{respondedRFQs.length} cotizaciones recibidas</span>
              <Link href="/quotes" className="ml-auto text-xs font-bold text-green-600 hover:text-green-800">Revisar →</Link>
            </div>
          )}
        </div>
      )}

      {/* Top KPI row */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-5 rounded-3xl p-7 flex flex-col justify-between min-h-[200px] relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" }}>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Este mes</div>
            <div className="text-6xl font-black text-white leading-none">
              {totalMonth.toFixed(0)}<span className="text-3xl text-slate-400 ml-1">€</span>
            </div>
            <div className="text-slate-400 text-sm mt-3">
              {thisMonth.length} pedidos cerrados · {totalAll.toFixed(0)} € acumulado
            </div>
          </div>
          <Link href="/quotes" className="flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-white transition-colors w-fit mt-4">
            Ver presupuestos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="col-span-3 flex flex-col gap-4">
          <WhiteStat label="Proveedores" value={String(supplierCount)} sub="en la red" />
          <WhiteStat label="Waitlist" value={String(waitlist.length)} sub="nuevos leads" />
        </div>

        <div className="col-span-4 bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Phoenix Wall</div>
              <div className="text-4xl font-black text-slate-900">{progressPct}%</div>
            </div>
            {phoenixTotal > 0 && (
              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase tracking-wide">PVP Previsto</div>
                <div className="text-xl font-black text-slate-800">{phoenixTotal.toFixed(2)} €</div>
              </div>
            )}
          </div>
          <div className="h-2 bg-slate-100 rounded-full mb-4 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%`, background: "#6366f1" }} />
          </div>
          <div className="space-y-2">
            {componentStatus.slice(0, 4).map((c) => (
              <div key={c.key} className="flex items-center gap-2 text-xs">
                <span className={`w-1.5 h-1.5 rounded-full ${c.hasPrice ? "bg-green-400" : "bg-orange-300"}`} />
                <span className="text-slate-500 flex-1 truncate">{c.label}</span>
                <span className={`font-black tabular-nums ${c.hasPrice ? "text-slate-800" : "text-slate-300"}`}>
                  {c.hasPrice ? `${c.unitCost?.toFixed(2)} €` : "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick access — new sections */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { href: "/quotes",      icon: FileText,    label: "Presupuestos", sub: "RFQs y pedidos" },
          { href: "/products",    icon: Grid3x3,     label: "Productos",    sub: "Catálogo Phoenix Wall" },
          { href: "/pricing",     icon: TrendingUp,  label: "Precios",      sub: "Calculadora costes" },
          { href: "/operations",  icon: Truck,       label: "Operaciones",  sub: "BOM · proveedores · PDFs" },
          { href: "/strategy",    icon: Target,      label: "Estrategia",   sub: "MOQ · márgenes · plan" },
        ].map(({ href, icon: Icon, label, sub }) => (
          <Link key={href} href={href}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col gap-2 hover:border-indigo-200 hover:shadow-md transition-all group">
            <Icon className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" strokeWidth={1.75} />
            <div>
              <div className="text-sm font-black text-slate-900">{label}</div>
              <div className="text-[10px] text-slate-400 leading-tight mt-0.5">{sub}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* History */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">Presupuestos Recientes</h2>
          <Link href="/quotes" className="text-xs font-bold text-slate-400 hover:text-slate-700 flex items-center gap-1 transition-colors">
            Ver todos <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="px-4 py-3 space-y-2">
          {recentQuotes.map((q, idx) => {
            const st = STATUS_MAP[q.status] ?? STATUS_MAP.draft;
            return (
              <Link key={q.id} href={`/quotes/${q.id}`}
                className="grid grid-cols-12 gap-4 items-center bg-slate-100/50 hover:bg-slate-100 rounded-2xl px-4 py-3.5 transition-all group">
                <div className="col-span-1 text-xs font-black text-slate-300">#{String(quotes.length - idx).padStart(3, "0")}</div>
                <div className="col-span-5 font-bold text-slate-800 text-sm">{q.title}</div>
                <div className="col-span-3 text-right">
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${st.color}`}>{st.label}</span>
                </div>
                <div className="col-span-3 text-right font-black text-slate-900 tabular-nums text-sm">
                  {q.totalCost ? `${q.totalCost.toFixed(2)} €` : "—"}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Waitlist / Leads */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">Nuevos Leads</h2>
            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase">Waitlist</span>
          </div>
        </div>
        <div className="divide-y divide-slate-50">
          {waitlist.length === 0 ? (
            <div className="px-6 py-12 text-center text-slate-400 text-sm italic">Sin leads por ahora</div>
          ) : (
            waitlist.map((lead) => (
              <div key={lead.id} className="grid grid-cols-12 gap-4 items-center px-6 py-4 hover:bg-slate-50/50 transition-colors">
                <div className="col-span-4">
                  <div className="font-bold text-slate-800 text-sm">{lead.name}</div>
                  <div className="text-[11px] text-slate-400">{lead.email}</div>
                </div>
                <div className="col-span-3">
                  <div className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {lead.company}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate pl-5">{lead.role}</div>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-50 text-slate-500 rounded-md border border-slate-100">{lead.industry}</span>
                </div>
                <div className="col-span-3 text-right">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Uso: {lead.useCase}</div>
                  <div className="text-[10px] text-slate-400 uppercase">{new Date(lead.createdAt).toLocaleDateString("es-ES")}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function WhiteStat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
      <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</div>
      <div className="text-4xl font-black text-slate-900">{value}</div>
      <div className="text-xs text-slate-400 mt-1">{sub}</div>
    </div>
  );
}
