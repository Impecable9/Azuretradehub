import Link from "next/link";
import { ArrowRight, Zap, Shield, TrendingUp, Clock, CheckCircle, Users, FileText, Bot } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white">

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[#09090b]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-black text-xl tracking-tight">
            Azure<span className="text-sky-400">trade</span>hub
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Iniciar sesión
            </Link>
            <Link
              href="/dashboard"
              className="bg-white text-black text-sm font-semibold px-4 py-2 rounded-lg hover:bg-zinc-100 transition-colors"
            >
              Solicitar acceso
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-40 pb-24 px-6 text-center relative overflow-hidden">
        {/* Glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[400px] bg-sky-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs font-medium text-zinc-400 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            Fase 0 — Acceso anticipado
          </div>

          <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-[1.05] mb-6">
            Presupuestos B2B{" "}
            <span className="bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
              en segundos
            </span>
            <br />con IA
          </h1>

          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Habla con tu agente, obtén el presupuesto completo con materiales y servicios,
            y envía solicitudes de precio a proveedores automáticamente.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 bg-white text-black font-bold px-8 py-4 rounded-xl text-base hover:bg-zinc-100 transition-colors"
            >
              Empezar gratis <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#como-funciona"
              className="inline-flex items-center justify-center gap-2 border border-white/10 text-zinc-300 font-medium px-8 py-4 rounded-xl text-base hover:bg-white/5 transition-colors"
            >
              Ver cómo funciona
            </a>
          </div>
        </div>
      </section>

      {/* Dashboard mockup */}
      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden shadow-2xl">
            {/* Fake browser bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/[0.02]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <div className="flex-1 mx-4 bg-white/5 rounded-md px-3 py-1 text-xs text-zinc-500">
                azuretradehub.com/dashboard
              </div>
            </div>
            {/* Fake dashboard */}
            <div className="p-6 flex gap-4 min-h-[320px]">
              {/* Sidebar */}
              <div className="w-36 shrink-0 space-y-1">
                {["Dashboard", "Presupuestos", "Proveedores"].map((item, i) => (
                  <div key={item} className={`px-3 py-2 rounded-lg text-xs font-medium ${i === 0 ? "bg-white/10 text-white" : "text-zinc-500"}`}>
                    {item}
                  </div>
                ))}
              </div>
              {/* Content */}
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-4 gap-3">
                  {[["0 €", "Ventas mes"], ["0 €", "Ventas año"], ["—", "Próx. mes"], ["—", "Anual"]].map(([v, l]) => (
                    <div key={l} className="bg-white/5 rounded-xl p-3">
                      <div className="text-xl font-black text-white">{v}</div>
                      <div className="text-xs text-zinc-500 mt-0.5">{l}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-xs text-zinc-500 mb-3">Últimos presupuestos</div>
                  <div className="text-center py-4 text-zinc-600 text-xs">
                    Usa el agente para generar tu primer presupuesto
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-white/[0.06] py-12 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
          {[
            ["10×", "más rápido que un presupuesto manual"],
            ["2 min", "para que un proveedor cotice"],
            ["0 €", "coste para proveedores"],
          ].map(([n, l]) => (
            <div key={n}>
              <div className="text-4xl font-black text-white mb-1">{n}</div>
              <div className="text-sm text-zinc-500">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs font-bold text-sky-400 uppercase tracking-widest mb-3">Cómo funciona</div>
            <h2 className="text-4xl font-black tracking-tight">De idea a presupuesto en 3 pasos</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: Bot,
                step: "01",
                title: "Habla con el agente",
                desc: "Descríbele lo que necesitas en lenguaje natural. Materiales, mano de obra, cantidades. El agente estructura todo.",
              },
              {
                icon: FileText,
                step: "02",
                title: "Presupuesto generado",
                desc: "El agente crea automáticamente el BOM y BOS con precios del catálogo. Lo que falta, lo solicita a proveedores.",
              },
              {
                icon: Zap,
                step: "03",
                title: "Proveedores cotizan",
                desc: "Los proveedores reciben un email con magic link. En 2 minutos tienen precio. Su perfil queda activo gratis.",
              },
            ].map((item) => (
              <div key={item.step} className="relative bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
                <div className="text-xs font-mono text-zinc-600 mb-4">{item.step}</div>
                <item.icon className="w-8 h-8 text-sky-400 mb-4" />
                <h3 className="font-bold text-white text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs font-bold text-sky-400 uppercase tracking-widest mb-3">Funcionalidades</div>
            <h2 className="text-4xl font-black tracking-tight">Todo lo que necesitas para comprar bien</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Bot, title: "Agente IA", desc: "Claude claude-sonnet-4-6 integrado. Entiende cualquier proyecto y lo traduce en líneas de presupuesto." },
              { icon: Users, title: "Red de proveedores", desc: "Acceso a una red creciente de proveedores verificados. Cada RFQ amplía la red automáticamente." },
              { icon: TrendingUp, title: "Análisis de márgenes", desc: "Visualiza el coste real vs teórico. Sabe qué proveedor te ofrece el mejor precio de mercado." },
              { icon: Clock, title: "RFQ automático", desc: "El agente genera y envía solicitudes de cotización a múltiples proveedores simultáneamente." },
              { icon: Shield, title: "BOM + BOS", desc: "Gestiona materiales (BOM) y servicios (BOS) en el mismo presupuesto. Sin herramientas externas." },
              { icon: CheckCircle, title: "Pronósticos", desc: "Dashboard con ventas del mes, año y proyecciones basadas en tu histórico real." },
            ].map((f) => (
              <div key={f.title} className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 flex gap-4">
                <div className="shrink-0 w-10 h-10 bg-sky-500/10 rounded-xl flex items-center justify-center">
                  <f.icon className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm mb-1">{f.title}</div>
                  <div className="text-xs text-zinc-500 leading-relaxed">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For suppliers */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-sky-500/10 to-blue-600/10 border border-sky-500/20 rounded-3xl p-10 text-center">
            <div className="text-xs font-bold text-sky-400 uppercase tracking-widest mb-4">Para proveedores</div>
            <h2 className="text-4xl font-black tracking-tight mb-4">
              Tu perfil gratis.<br />Sin registro.
            </h2>
            <p className="text-zinc-400 text-lg max-w-xl mx-auto mb-6 leading-relaxed">
              Recibes un email con la solicitud de un comprador real. Cotizas en 2 minutos.
              Tu empresa queda registrada automáticamente en la red.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center text-sm">
              {["Sin registro previo", "Sin cuotas mensuales", "Más compradores te encuentran"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-zinc-300">
                  <CheckCircle className="w-4 h-4 text-sky-400 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-5xl font-black tracking-tight mb-4">
            Empieza hoy.<br />
            <span className="text-zinc-500">Es gratis.</span>
          </h2>
          <p className="text-zinc-400 mb-8">
            Acceso anticipado gratuito durante la fase MVP. Sin tarjeta de crédito.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-white text-black font-bold px-10 py-4 rounded-xl text-lg hover:bg-zinc-100 transition-colors"
          >
            Entrar al panel <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="font-black text-white tracking-tight">
            Azure<span className="text-sky-400">trade</span>hub
          </div>
          <div className="text-xs text-zinc-600">© 2026 Azuretradehub. Red B2B agéntica.</div>
        </div>
      </footer>

    </div>
  );
}
