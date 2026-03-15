import Link from "next/link";
import { LayoutDashboard, FileText, Users } from "lucide-react";
import { ChatDrawer } from "@/components/chat/ChatDrawer";

const ORG_ID = process.env.OWNER_ORG_ID ?? "seed-org-id";

const navItems = [
  { href: "/dashboard", label: "Dashboard",     icon: LayoutDashboard },
  { href: "/quotes",    label: "Presupuestos",  icon: FileText },
  { href: "/suppliers", label: "Proveedores",   icon: Users },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-52 bg-slate-900 flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-slate-800">
          <div className="text-lg font-black text-white tracking-tight">
            Azure<span className="text-sky-400">trade</span>hub
          </div>
          <div className="text-xs text-slate-500 mt-0.5">Panel privado</div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-sm font-medium"
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-slate-800">
          <div className="text-xs text-slate-500">MVP · Fase 0</div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {children}
      </main>

      {/* Chat drawer (floating, always visible) */}
      <ChatDrawer organizationId={ORG_ID} />
    </div>
  );
}
