export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Mail, Inbox, Send, CheckCircle, XCircle, Clock } from "lucide-react";

export default async function EmailsPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const emails = await prisma.emailLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const sent     = emails.filter((e) => e.direction === "sent");
  const received = emails.filter((e) => e.direction === "received");
  const failed   = emails.filter((e) => e.status === "failed");

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Comunicaciones</div>
          <h1 className="text-3xl font-black text-slate-900 leading-none">Emails</h1>
        </div>
        <div className="text-xs text-slate-400 font-semibold">{session.user.email}</div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total",     value: emails.length,   sub: "registros",  icon: Mail },
          { label: "Enviados",  value: sent.length,     sub: "outbox",     icon: Send },
          { label: "Recibidos", value: received.length, sub: "inbox",      icon: Inbox },
          { label: "Fallidos",  value: failed.length,   sub: "con error",  icon: XCircle },
        ].map(({ label, value, sub, icon: Icon }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-3.5 h-3.5 text-slate-300" />
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</div>
            </div>
            <div className="text-4xl font-black text-slate-900">{value}</div>
            <div className="text-xs text-slate-400 mt-1">{sub}</div>
          </div>
        ))}
      </div>

      {/* Email list */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Todos los correos</h2>
          <span className="text-xs text-slate-400">{emails.length} registros</span>
        </div>

        {emails.length === 0 ? (
          <div className="px-6 py-16 text-center text-slate-400 text-sm italic">
            Sin correos registrados aún.
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {emails.map((email) => {
              const isReceived = email.direction === "received";
              const isFailed   = email.status === "failed";
              return (
                <details key={email.id} className="group">
                  <summary className="grid grid-cols-12 gap-4 items-center px-6 py-4 hover:bg-slate-50/50 transition-colors cursor-pointer list-none">
                    {/* Direction badge */}
                    <div className="col-span-1 flex justify-center">
                      {isFailed ? (
                        <XCircle className="w-4 h-4 text-red-400" />
                      ) : isReceived ? (
                        <Inbox className="w-4 h-4 text-indigo-400" />
                      ) : (
                        <Send className="w-4 h-4 text-emerald-400" />
                      )}
                    </div>

                    {/* From / To */}
                    <div className="col-span-3">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                        {isReceived ? "De" : "Para"}
                      </div>
                      <div className="text-xs font-semibold text-slate-700 truncate">
                        {isReceived ? email.from : email.to}
                      </div>
                    </div>

                    {/* Subject */}
                    <div className="col-span-5">
                      <div className="text-sm text-slate-800 font-medium truncate">{email.subject}</div>
                    </div>

                    {/* Status + date */}
                    <div className="col-span-3 text-right flex flex-col items-end gap-1">
                      <span className={`text-[9px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full ${
                        isFailed
                          ? "bg-red-50 text-red-500"
                          : isReceived
                          ? "bg-indigo-50 text-indigo-600"
                          : "bg-emerald-50 text-emerald-600"
                      }`}>
                        {isFailed ? "fallido" : isReceived ? "recibido" : "enviado"}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold">
                        {new Date(email.createdAt).toLocaleDateString("es-ES", {
                          day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
                        })}
                      </span>
                    </div>
                  </summary>

                  {/* Expanded body */}
                  <div className="px-6 pb-5 pt-2 bg-slate-50/50 border-t border-slate-100">
                    <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                      <div><span className="font-black text-slate-400 uppercase tracking-widest text-[9px]">De: </span><span className="text-slate-700">{email.from}</span></div>
                      <div><span className="font-black text-slate-400 uppercase tracking-widest text-[9px]">Para: </span><span className="text-slate-700">{email.to}</span></div>
                    </div>
                    {email.bodyText ? (
                      <pre className="text-xs text-slate-600 whitespace-pre-wrap font-sans leading-relaxed bg-white rounded-xl border border-slate-100 p-4 max-h-80 overflow-y-auto">
                        {email.bodyText}
                      </pre>
                    ) : email.bodyHtml ? (
                      <div
                        className="text-xs text-slate-600 bg-white rounded-xl border border-slate-100 p-4 max-h-80 overflow-y-auto prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: email.bodyHtml }}
                      />
                    ) : (
                      <p className="text-xs text-slate-400 italic">Sin contenido</p>
                    )}
                  </div>
                </details>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
