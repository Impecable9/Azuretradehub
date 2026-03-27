"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronRight, Loader2, Sparkles } from "lucide-react";
import { FadeIn, FadeUp } from "@/components/landing/AnimatedSection";
import { submitWaitlist } from "./actions";

export default function WaitlistPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    company: "",
    role: "",
    industry: "",
    useCase: "Buy",
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const data = new FormData();
    Object.entries(formData).forEach(([k, v]) => data.append(k, v));

    const res = await submitWaitlist(data);
    setLoading(false);

    if (res.success) {
      setSubmitted(true);
    } else {
      setError(res.error || "Algo salió mal");
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center p-6">
        <FadeUp>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-10 max-w-lg w-full text-center">
            <div className="w-20 h-20 bg-sky-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-sky-400" />
            </div>
            <h1 className="text-3xl font-black mb-4">¡Ya estás en la lista!</h1>
            <p className="text-zinc-400 mb-8 leading-relaxed">
              Gracias por tu interés en Azuretradehub. Te contactaremos pronto cuando abramos los próximos accesos a la Fase 0.
            </p>
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 bg-white text-black font-bold px-8 py-3 rounded-xl hover:bg-zinc-100 transition-all"
            >
              Volver al inicio
            </Link>
          </div>
        </FadeUp>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white overflow-hidden relative">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-sky-500/5 blur-[120px] pointer-events-none" />
      
      <div className="max-w-xl mx-auto px-6 pt-20 pb-32 relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm mb-12">
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>
        
        <FadeIn>
          <div className="flex items-center gap-2 mb-4">
            <div className="px-3 py-1 bg-sky-500/10 border border-sky-500/20 rounded-full text-[10px] font-black text-sky-400 uppercase tracking-widest">
              Waitlist Fase 0
            </div>
            <div className="h-px flex-1 bg-white/10" />
            <div className="text-[10px] font-bold text-zinc-600 uppercase tabular-nums">Paso {step} de 3</div>
          </div>
          
          <h1 className="text-4xl font-black tracking-tight mb-2">Solicitar acceso</h1>
          <p className="text-zinc-500 mb-10">Queremos conocerte mejor para darte la mejor experiencia.</p>
        </FadeIn>

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && (
            <FadeUp delay={0.1}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Tu nombre</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Ej. Juan Pérez"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-sky-500/50 focus:bg-white/8 transition-all"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Correo profesional</label>
                  <input 
                    required
                    type="email" 
                    placeholder="juan@empresa.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-sky-500/50 focus:bg-white/8 transition-all"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <button 
                  type="button" 
                  onClick={nextStep}
                  disabled={!formData.name || !formData.email}
                  className="w-full flex items-center justify-center gap-2 bg-white text-black font-bold py-4 rounded-xl hover:bg-zinc-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed group mt-4"
                >
                  Siguiente <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </FadeUp>
          )}

          {step === 2 && (
            <FadeUp delay={0.1}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Empresa</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Nombre de tu empresa"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-sky-500/50 focus:bg-white/8 transition-all"
                    value={formData.company}
                    onChange={e => setFormData({ ...formData, company: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Tu cargo</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Ej. Director de Compras"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-sky-500/50 focus:bg-white/8 transition-all"
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button type="button" onClick={prevStep} className="font-bold py-4 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-sm">Atrás</button>
                  <button 
                    type="button" 
                    onClick={nextStep}
                    disabled={!formData.company || !formData.role}
                    className="flex items-center justify-center gap-2 bg-white text-black font-bold py-4 rounded-xl hover:bg-zinc-100 transition-all disabled:opacity-50 group"
                  >
                    Siguiente <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </FadeUp>
          )}

          {step === 3 && (
            <FadeUp delay={0.1}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Industria</label>
                  <select 
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-sky-500/50 focus:bg-white/8 transition-all appearance-none"
                    value={formData.industry}
                    onChange={e => setFormData({ ...formData, industry: e.target.value })}
                  >
                    <option value="" disabled>Selecciona una...</option>
                    <option value="Construcción">Construcción</option>
                    <option value="Arquitectura">Arquitectura / Diseño</option>
                    <option value="Retail">Retail</option>
                    <option value="Manufactura">Manufactura</option>
                    <option value="Proveedor">Proveedor de materiales</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">¿Cómo usarás Azuretradehub?</label>
                  <div className="grid grid-cols-2 gap-3">
                    {["Buy", "Sell", "Both"].map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setFormData({ ...formData, useCase: mode })}
                        className={`py-3 px-4 rounded-xl border transition-all text-xs font-bold ${
                          formData.useCase === mode 
                            ? "bg-sky-500/10 border-sky-500/50 text-sky-400" 
                            : "bg-white/5 border-white/10 text-zinc-400 hover:border-white/20"
                        }`}
                      >
                        {mode === "Buy" ? "Comprar" : mode === "Sell" ? "Vender" : "Ambos"}
                      </button>
                    ))}
                  </div>
                </div>
                
                {error && <p className="text-red-400 text-xs px-1">{error}</p>}

                <div className="grid grid-cols-2 gap-3 pt-4">
                  <button type="button" onClick={prevStep} className="font-bold py-4 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-sm">Atrás</button>
                  <button 
                    type="submit" 
                    disabled={loading || !formData.industry}
                    className="flex items-center justify-center gap-2 bg-sky-500 text-white font-bold py-4 rounded-xl hover:bg-sky-400 transition-all disabled:opacity-50 group shadow-lg shadow-sky-500/20"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Finalizar <Sparkles className="w-4 h-4" /></>}
                  </button>
                </div>
              </div>
            </FadeUp>
          )}
        </form>
      </div>
    </div>
  );
}
