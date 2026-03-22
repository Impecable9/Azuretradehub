import Link from "next/link";
import { LayoutDashboard, FileText, Users, Settings, LogOut, Star, Folder, Monitor } from "lucide-react";
import { ChatDrawer } from "@/components/chat/ChatDrawer";
import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";

const ORG_ID = process.env.OWNER_ORG_ID ?? "seed-org-id";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard },
  { href: "/quotes",    icon: FileText },
  { href: "/suppliers", icon: Users },
  { href: "/settings",  icon: Settings },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  const name = session.user?.name ?? session.user?.email ?? "Usuario";
  const initials = name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "#f2f2f6",
        backgroundImage: "radial-gradient(ellipse 80% 60% at 80% 100%, rgba(167,139,250,0.18) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 20% 0%, rgba(196,181,253,0.10) 0%, transparent 60%)",
      }}
    >
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200/60 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 bg-slate-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-xs">AT</span>
            </div>
            <span className="font-black text-slate-900 tracking-tight text-sm">AZURE<span className="text-slate-900">TRADE</span>HUB</span>
          </div>

          {/* Nav icons — center */}
          <nav className="flex items-center gap-1 flex-1 justify-center">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all duration-150"
              >
                <item.icon className="w-4 h-4" strokeWidth={1.75} />
              </Link>
            ))}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs text-slate-400 hidden md:block">{name.split(" ")[0].toUpperCase()}</span>
            <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
              <button type="submit" className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all duration-150">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </form>
            <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-black">
              {initials}
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="max-w-6xl mx-auto px-6 pb-3">
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-400">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Buscar presupuesto, proveedor, producto...
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-6">
        {children}
      </main>

      <ChatDrawer organizationId={ORG_ID} />
    </div>
  );
}
