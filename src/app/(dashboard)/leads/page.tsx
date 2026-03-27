export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Building2, Mail, Briefcase, Calendar, Tag, MessageSquare } from "lucide-react";

const OWNER_EMAILS = process.env.ALLOWED_EMAILS?.split(",").map((e) => e.trim()) ?? [];

export default async function LeadsPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  // Solo el owner puede ver esta página
  if (OWNER_EMAILS.length > 0 && !OWNER_EMAILS.includes(session.user.email)) {
    redirect("/dashboard");
  }

  const leads = await prisma.waitlist.findMany({
    orderBy: { createdAt: "desc" },
  });

  const total      = leads.length;
  const notified   = leads.filter((l) => l.notified).length;
  const thisMonth  = leads.filter((l) => {
    const d = new Date(l.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const industries = Array.from(new Set(leads.map((l) => l.industry).filter(Boolean)));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Acceso privado</div>
          <h1 className="text-3xl font-black text-slate-900 leading-none">Leads · Waitlist</h1>
        </div>
        <div className="text-xs text-slate-400 font-semibold">{session.user.email}</div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total leads",     value: total,         sub: "registros" },
          { label: "Este mes",        value: thisMonth,     sub: "nuevos" },
          { label: "Notificados",     value: notified,      sub: "contactados" },
          { label: "Pendientes",      value: total - notified, sub: "por contactar" },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</div>
            <div className="text-4xl font-black text-slate-900">{value}</div>
            <div className="text-xs text-slate-400 mt-1">{sub}</div>
          </div>
        ))}
      </div>

      {/* Industry pills */}
      {industries.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sectores:</span>
          {industries.map((ind) => (
            <span key={ind} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-bold">
              {ind} ({leads.filter((l) => l.industry === ind).length})
            </span>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Todos los leads</h2>
          <span className="text-xs text-slate-400">{total} registros</span>
        </div>

        {leads.length === 0 ? (
          <div className="px-6 py-16 text-center text-slate-400 text-sm italic">
            Sin leads por ahora. Comparte la waitlist.
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {leads.map((lead, i) => (
              <div key={lead.id}
                className={`grid grid-cols-12 gap-4 items-start px-6 py-4 hover:bg-slate-50/50 transition-colors ${lead.notified ? "opacity-60" : ""}`}
              >
                {/* Index + status */}
                <div className="col-span-1 flex flex-col items-center gap-1 pt-0.5">
                  <span className="text-[10px] font-black text-slate-300">#{String(total - i).padStart(3, "0")}</span>
                  <span className={`w-2 h-2 rounded-full ${lead.notified ? "bg-green-400" : "bg-orange-400"}`} />
                </div>

                {/* Name + email */}
                <div className="col-span-3">
                  <div className="font-bold text-slate-800 text-sm leading-tight">{lead.name ?? "—"}</div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3 text-slate-300 shrink-0" />
                    <a href={`mailto:${lead.email}`}
                      className="text-[11px] text-indigo-500 hover:text-indigo-700 truncate">
                      {lead.email}
                    </a>
                  </div>
                </div>

                {/* Company + role */}
                <div className="col-span-3">
                  {lead.company && (
                    <div className="flex items-center gap-1 text-xs font-semibold text-slate-700">
                      <Building2 className="w-3 h-3 text-slate-300 shrink-0" />
                      {lead.company}
                    </div>
                  )}
                  {lead.role && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Briefcase className="w-3 h-3 text-slate-300 shrink-0" />
                      <span className="text-[11px] text-slate-500">{lead.role}</span>
                    </div>
                  )}
                </div>

                {/* Industry */}
                <div className="col-span-2">
                  {lead.industry && (
                    <div className="flex items-center gap-1">
                      <Tag className="w-3 h-3 text-slate-300 shrink-0" />
                      <span className="text-[11px] font-bold text-slate-600">{lead.industry}</span>
                    </div>
                  )}
                </div>

                {/* Use case */}
                <div className="col-span-2">
                  {lead.useCase && (
                    <div className="flex items-start gap-1">
                      <MessageSquare className="w-3 h-3 text-slate-300 shrink-0 mt-0.5" />
                      <span className="text-[11px] text-slate-500 leading-tight">{lead.useCase}</span>
                    </div>
                  )}
                </div>

                {/* Date */}
                <div className="col-span-1 text-right">
                  <div className="flex items-center gap-1 justify-end">
                    <Calendar className="w-3 h-3 text-slate-300 shrink-0" />
                    <span className="text-[10px] text-slate-400 font-bold">
                      {new Date(lead.createdAt).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}
                    </span>
                  </div>
                  {!lead.notified && (
                    <span className="text-[9px] font-black text-orange-500 uppercase tracking-wide">Pendiente</span>
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
