import Link from "next/link";
import { ArrowRight, Zap, Shield, TrendingUp, Clock, CheckCircle, Users, FileText, Bot, ChevronRight } from "lucide-react";
import { FadeUp, FadeIn, StaggerChildren, StaggerItem } from "@/components/landing/AnimatedSection";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white overflow-x-hidden">

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[#09090b]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-black text-xl tracking-tight">
            Azure<span className="text-sky-400">trade</span>hub
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm text-zinc-400 hover:text-white transition-colors hidden sm:block">
              Iniciar sesión
            </Link>
            <Link
              href="/dashboard"
              className="bg-white text-black text-sm font-bold px-4 py-2 rounded-lg hover:bg-zinc-100 transition-all hover:scale-105 active:scale-95"
            >
              Solicitar acceso
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-36 pb-20 px-6 text-center relative overflow-hidden">
        {/* Animated glow */}
        <div className="absolute inset-0 flex items-start justify-center pt-20 pointer-events-none">
          <div className="w-[800px] h-[500px] bg-sky-500/8 rounded-full blur-[120px] animate-pulse" />
        </div>
        <div className="absolute inset-0 flex items-start justify-center pt-40 pointer-events-none">
          <div className="w-[400px] h-[300px] bg-blue-600/6 rounded-full blur-[80px]" />
        </div>

        <div className="relative max-w-5xl mx-auto">
          <FadeIn delay={0}>
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs font-medium text-zinc-400 mb-8 hover:bg-white/8 transition-colors cursor-default">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
              Fase 0 · Acceso anticipado gratuito
              <ChevronRight className="w-3 h-3" />
            </div>
          </FadeIn>

          <FadeUp delay={0.1}>
            <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-[1.05] mb-6">
              Presupuestos B2B{" "}
              <span className="relative">
                <span className="bg-gradient-to-r from-sky-400 via-blue-400 to-sky-500 bg-clip-text text-transparent">
                  en segundos
                </span>
              </span>
              <br />
              <span className="text-zinc-400">con IA</span>
            </h1>
          </FadeUp>

          <FadeUp delay={0.2}>
            <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Habla con tu agente, obtén el presupuesto completo con materiales y servicios,
              y envía solicitudes de precio a proveedores automáticamente.
            </p>
          </FadeUp>

          <FadeUp delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/dashboard"
                className="group inline-flex items-center justify-center gap-2 bg-white text-black font-bold px-8 py-4 rounded-xl text-base hover:bg-zinc-100 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-white/10"
              >
                Empezar gratis
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#como-funciona"
                className="inline-flex items-center justify-center gap-2 border border-white/10 text-zinc-300 font-medium px-8 py-4 rounded-xl text-base hover:bg-white/5 transition-all hover:border-white/20"
              >
                Ver cómo funciona
              </a>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Dashboard mockup */}
      <FadeUp delay={0.1}>
        <section className="px-6 pb-24">
          <div className="max-w-5xl mx-auto">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden shadow-2xl shadow-black/50 hover:border-white/15 transition-colors">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/[0.02]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                </div>
                <div className="flex-1 mx-4 bg-white/5 rounded-md px-3 py-1 text-xs text-zinc-500 font-mono">
                  azuretradehub.com/dashboard
                </div>
              </div>
              <div className="p-6 flex gap-4 min-h-[280px]">
                <div className="w-36 shrink-0 space-y-1">
                  <div className="px-2 py-1.5 text-xs text-zinc-600 font-bold uppercase tracking-wider mb-2">Panel</div>
                  {[["Dashboard", true], ["Presupuestos", false], ["Proveedores", false]].map(([item, active]) => (
                    <div key={String(item)} className={`px-3 py-2 rounded-lg text-xs font-medium ${active ? "bg-white/10 text-white" : "text-zinc-600"}`}>
                      {String(item)}
                    </div>
                  ))}
                </div>
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-4 gap-2">
                    {[["0 €", "Ventas mes", "text-white"], ["0 €", "Ventas año", "text-white"], ["—", "Próx. mes", "text-sky-400"], ["—", "Anual", "text-sky-400"]].map(([v, l, c]) => (
                      <div key={String(l)} className="bg-white/5 rounded-xl p-3 border border-white/5">
                        <div className={`text-lg font-black ${c}`}>{String(v)}</div>
                        <div className="text-xs text-zinc-600 mt-0.5">{String(l)}</div>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {["0 presupuestos", "1 proveedor", "0 RFQs", "0 mensajes"].map((s) => (
                      <div key={s} className="bg-white/3 rounded-lg p-2 border border-white/5">
                        <div className="text-xs text-zinc-600">{s}</div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white/3 rounded-xl p-4 border border-white/5 flex items-center justify-center h-20">
                    <div className="flex items-center gap-2 text-zinc-600 text-xs">
                      <Bot className="w-4 h-4" />
                      Habla con el agente para generar tu primer presupuesto
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </FadeUp>

      {/* Stats */}
      <FadeUp>
        <section className="border-y border-white/[0.06] py-14 px-6">
          <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
            {[
              ["10×", "más rápido que un presupuesto manual"],
              ["2 min", "para que un proveedor cotice"],
              ["0 €", "coste para proveedores"],
            ].map(([n, l]) => (
              <div key={String(n)} className="group">
                <div className="text-4xl sm:text-5xl font-black text-white mb-2 group-hover:text-sky-400 transition-colors">{n}</div>
                <div className="text-sm text-zinc-500">{l}</div>
              </div>
            ))}
          </div>
        </section>
      </FadeUp>

      {/* How it works */}
      <section id="como-funciona" className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <div className="text-center mb-16">
              <div className="text-xs font-bold text-sky-400 uppercase tracking-widest mb-3">Cómo funciona</div>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight">
                De idea a presupuesto<br />en 3 pasos
              </h2>
            </div>
          </FadeUp>

          <StaggerChildren className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { icon: Bot, step: "01", title: "Habla con el agente", desc: "Descríbele lo que necesitas en lenguaje natural. Materiales, mano de obra, cantidades. El agente lo estructura todo." },
              { icon: FileText, step: "02", title: "Presupuesto generado", desc: "BOM y BOS completos con precios del catálogo. Lo que falta, lo solicita automáticamente a proveedores." },
              { icon: Zap, step: "03", title: "Proveedores cotizan", desc: "Reciben un email con magic link. En 2 minutos tienen precio. Su perfil queda activo gratis en la red." },
            ].map((item) => (
              <StaggerItem key={item.step}>
                <div className="relative bg-white/[0.03] border border-white/[0.08] rounded-2xl p-7 hover:bg-white/[0.05] hover:border-white/15 transition-all group h-full">
                  <div className="text-xs font-mono text-zinc-700 mb-5 group-hover:text-sky-400 transition-colors">{item.step}</div>
                  <div className="w-12 h-12 bg-sky-500/10 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-sky-500/20 transition-colors">
                    <item.icon className="w-6 h-6 text-sky-400" />
                  </div>
                  <h3 className="font-bold text-white text-lg mb-3">{item.title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* Features */}
      <section className="py-28 px-6 bg-white/[0.015]">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <div className="text-center mb-16">
              <div className="text-xs font-bold text-sky-400 uppercase tracking-widest mb-3">Funcionalidades</div>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight">
                Todo para comprar<br />mejor y más rápido
              </h2>
            </div>
          </FadeUp>

          <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Bot, title: "Agente IA", desc: "Claude claude-sonnet-4-6 integrado. Entiende cualquier proyecto y lo convierte en presupuesto." },
              { icon: Users, title: "Red de proveedores", desc: "Acceso a una red creciente. Cada RFQ enviado amplía la red automáticamente." },
              { icon: TrendingUp, title: "Análisis de márgenes", desc: "Coste real vs teórico. Sabe qué proveedor tiene el mejor precio de mercado." },
              { icon: Clock, title: "RFQ automático", desc: "Genera y envía solicitudes de cotización a múltiples proveedores en paralelo." },
              { icon: Shield, title: "BOM + BOS", desc: "Materiales y servicios en el mismo presupuesto. Sin salir de la plataforma." },
              { icon: CheckCircle, title: "Pronósticos", desc: "Ventas del mes, año y proyecciones basadas en tu histórico real." },
            ].map((f) => (
              <StaggerItem key={f.title}>
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 flex gap-4 hover:bg-white/[0.05] hover:border-white/15 transition-all h-full group">
                  <div className="shrink-0 w-10 h-10 bg-sky-500/10 rounded-xl flex items-center justify-center group-hover:bg-sky-500/20 transition-colors">
                    <f.icon className="w-5 h-5 text-sky-400" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm mb-1.5">{f.title}</div>
                    <div className="text-xs text-zinc-500 leading-relaxed">{f.desc}</div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* For suppliers */}
      <section className="py-28 px-6">
        <div className="max-w-4xl mx-auto">
          <FadeUp>
            <div className="relative bg-gradient-to-br from-sky-500/8 via-blue-600/5 to-transparent border border-sky-500/15 rounded-3xl p-10 sm:p-14 text-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-sky-400/3 to-transparent pointer-events-none" />
              <div className="relative">
                <div className="text-xs font-bold text-sky-400 uppercase tracking-widest mb-4">Para proveedores</div>
                <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-5">
                  Tu perfil gratis.<br />Sin registro.
                </h2>
                <p className="text-zinc-400 text-lg max-w-xl mx-auto mb-8 leading-relaxed">
                  Recibes un email con la solicitud de un comprador real. Cotizas en 2 minutos.
                  Tu empresa queda registrada automáticamente en la red.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {["Sin registro previo", "Sin cuotas mensuales", "Más compradores te encuentran"].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-zinc-300 text-sm">
                      <CheckCircle className="w-4 h-4 text-sky-400 shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-28 px-6 text-center">
        <FadeUp>
          <div className="max-w-2xl mx-auto">
            <h2 className="text-5xl sm:text-6xl font-black tracking-tight mb-4">
              Empieza hoy.
              <br />
              <span className="text-zinc-600">Es gratis.</span>
            </h2>
            <p className="text-zinc-500 mb-10 text-lg">
              Acceso anticipado gratuito durante la fase MVP.<br />Sin tarjeta de crédito.
            </p>
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 bg-white text-black font-bold px-10 py-5 rounded-xl text-lg hover:bg-zinc-100 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-white/10"
            >
              Entrar al panel
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </FadeUp>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="font-black text-white tracking-tight text-lg">
            Azure<span className="text-sky-400">trade</span>hub
          </div>
          <div className="text-xs text-zinc-700">© 2026 Azuretradehub · Red B2B agéntica</div>
        </div>
      </footer>

    </div>
  );
}
