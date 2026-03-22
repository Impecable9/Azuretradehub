import Link from "next/link";
import { LayoutDashboard, FileText, Users, Settings, LogOut, MessageSquare } from "lucide-react";
import { ChatDrawer } from "@/components/chat/ChatDrawer";
import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";

const ORG_ID = process.env.OWNER_ORG_ID ?? "seed-org-id";

const navItems = [
  { href: "/dashboard",  icon: LayoutDashboard, label: "Dashboard" },
  { href: "/quotes",     icon: FileText,         label: "Presupuestos" },
  { href: "/suppliers",  icon: Users,            label: "Proveedores" },
  { href: "/settings",   icon: Settings,         label: "Configuración" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  const initials = session.user?.name
    ? session.user.name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)
    : session.user?.email?.[0].toUpperCase() ?? "U";

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(135deg, #f0f0f8 0%, #f8f8fc 40%, #f0eef8 100%)" }}>
      {/* Top navigation bar */}
      <header className="sticky top-0 z-30 backdrop-blur-md border-b border-white/60" style={{ background: "rgba(255,255,255,0.7)" }}>
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/dashboard" className="font-black text-base tracking-tight text-slate-900 shrink-0">
            Azure<span className="text-violet-500">trade</span>hub
          </Link>

          {/* Nav icons */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-900 hover:bg-white/80 transition-all duration-200"
              >
                <item.icon className="w-4.5 h-4.5" strokeWidth={1.8} />
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs text-slate-400 hidden sm:block truncate max-w-40">{session.user?.email}</span>
            <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
              <button
                type="submit"
                title="Cerrar sesión"
                className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {initials}
            </div>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-6">
        {children}
      </main>

      <ChatDrawer organizationId={ORG_ID} />
    </div>
  );
}
