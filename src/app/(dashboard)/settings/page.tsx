"use client";

import { useState, useEffect } from "react";
import { Key, Shield, Trash2, CheckCircle, AlertCircle, ChevronRight, Zap } from "lucide-react";

type Provider = "anthropic" | "openai" | "groq" | "mistral" | "together";

const PROVIDERS: {
  id: Provider;
  name: string;
  logo: string;
  desc: string;
  placeholder: string;
  docsUrl: string;
  badge?: string;
}[] = [
  {
    id: "anthropic",
    name: "Anthropic Claude",
    logo: "🔮",
    desc: "Claude Sonnet, Opus, Haiku. El mejor para razonamiento complejo y agentes.",
    placeholder: "sk-ant-api03-...",
    docsUrl: "https://console.anthropic.com/settings/keys",
    badge: "Recomendado",
  },
  {
    id: "openai",
    name: "OpenAI",
    logo: "⚡",
    desc: "GPT-4o, GPT-4 Turbo. Amplia compatibilidad con herramientas del ecosistema.",
    placeholder: "sk-...",
    docsUrl: "https://platform.openai.com/api-keys",
  },
  {
    id: "groq",
    name: "Groq",
    logo: "🚀",
    desc: "LLaMA 3, Mixtral. Velocidad extrema con modelos open source.",
    placeholder: "gsk_...",
    docsUrl: "https://console.groq.com/keys",
    badge: "Rápido",
  },
  {
    id: "mistral",
    name: "Mistral AI",
    logo: "🌀",
    desc: "Mistral Large, Codestral. Modelos europeos con foco en privacidad.",
    placeholder: "...",
    docsUrl: "https://console.mistral.ai/api-keys",
  },
  {
    id: "together",
    name: "Together AI",
    logo: "🤝",
    desc: "Modelos open source en la nube. Alta disponibilidad y precios competitivos.",
    placeholder: "...",
    docsUrl: "https://api.together.xyz/settings/api-keys",
  },
];

export default function SettingsPage() {
  const [configuredProviders, setConfiguredProviders] = useState<string[]>([]);
  const [activeProvider, setActiveProvider] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [addingFor, setAddingFor] = useState<Provider | null>(null);
  const [keyInput, setKeyInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        setConfiguredProviders(d.configuredProviders ?? []);
        setActiveProvider(d.activeProvider ?? null);
        setLoading(false);
      });
  }, []);

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleSave(provider: Provider) {
    setSaving(true);
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, apiKey: keyInput, setActive: configuredProviders.length === 0 }),
    });
    const data = await res.json();
    if (res.ok) {
      setConfiguredProviders((prev) => prev.includes(provider) ? prev : [...prev, provider]);
      if (configuredProviders.length === 0) setActiveProvider(provider);
      setAddingFor(null);
      setKeyInput("");
      showToast(`API key de ${PROVIDERS.find((p) => p.id === provider)?.name} guardada`, true);
    } else {
      showToast(data.error ?? "Error al guardar", false);
    }
    setSaving(false);
  }

  async function handleDelete(provider: Provider) {
    const name = PROVIDERS.find((p) => p.id === provider)?.name;
    if (!confirm(`¿Eliminar la API key de ${name}?`)) return;
    await fetch("/api/settings", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider }),
    });
    const next = configuredProviders.filter((p) => p !== provider);
    setConfiguredProviders(next);
    if (activeProvider === provider) setActiveProvider(next[0] ?? null);
    showToast(`API key de ${name} eliminada`, true);
  }

  async function handleSetActive(provider: Provider) {
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activeProvider: provider }),
    });
    setActiveProvider(provider);
    showToast(`Agente cambiado a ${PROVIDERS.find((p) => p.id === provider)?.name}`, true);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Configuración</h1>
        <p className="text-sm text-slate-400 mt-1">Conecta tu propio modelo de IA · BYOK — cifrado AES-256-GCM</p>
      </div>

      {/* Security notice */}
      <div className="flex items-start gap-3 bg-white rounded-2xl border border-blue-100 shadow-sm px-5 py-4">
        <Shield className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <div className="text-sm text-slate-600 leading-relaxed">
          Todas las API keys se cifran con <strong>AES-256-GCM</strong> antes de guardarse en base de datos.
          Nunca se almacenan en texto plano ni son accesibles por nuestro equipo.
        </div>
      </div>

      {/* Active provider banner */}
      {activeProvider && !loading && (
        <div className="flex items-center gap-3 bg-white rounded-2xl border border-green-100 shadow-sm px-5 py-4">
          <Zap className="w-4 h-4 text-green-500 shrink-0" />
          <span className="text-sm font-semibold text-slate-700">
            Agente activo:
          </span>
          <span className="text-sm font-black text-slate-900">
            {PROVIDERS.find((p) => p.id === activeProvider)?.name ?? activeProvider}
          </span>
          <span className="ml-auto text-xs font-bold bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
            Activo
          </span>
        </div>
      )}

      {/* Provider cards */}
      <div className="space-y-3">
        {PROVIDERS.map((provider) => {
          const isConfigured = configuredProviders.includes(provider.id);
          const isActive = activeProvider === provider.id;
          const isAdding = addingFor === provider.id;

          return (
            <div
              key={provider.id}
              className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all duration-200 ${
                isActive ? "border-green-200" : "border-slate-100"
              }`}
            >
              {/* Provider header row */}
              <div className="px-5 py-4 flex items-center gap-4">
                <div className="text-2xl shrink-0">{provider.logo}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-black text-slate-900">{provider.name}</span>
                    {provider.badge && (
                      <span className="text-[10px] font-bold bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">
                        {provider.badge}
                      </span>
                    )}
                    {isActive && (
                      <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Zap className="w-2.5 h-2.5" /> En uso
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{provider.desc}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {loading ? (
                    <div className="w-16 h-7 bg-slate-100 rounded-lg animate-pulse" />
                  ) : isConfigured ? (
                    <>
                      {!isActive && (
                        <button
                          onClick={() => handleSetActive(provider.id)}
                          className="text-xs font-bold text-slate-500 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          Usar este
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(provider.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="w-7 h-7 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </div>
                    </>
                  ) : (
                    <button
                      onClick={() => { setAddingFor(provider.id); setKeyInput(""); }}
                      className="flex items-center gap-1.5 text-xs font-bold bg-slate-900 text-white px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors"
                    >
                      <Key className="w-3 h-3" /> Conectar
                    </button>
                  )}
                </div>
              </div>

              {/* Inline add form */}
              {isAdding && (
                <div className="border-t border-slate-100 px-5 py-4 bg-slate-50">
                  <form
                    onSubmit={(e) => { e.preventDefault(); handleSave(provider.id); }}
                    className="flex items-center gap-3"
                  >
                    <div className="flex-1">
                      <input
                        type="password"
                        value={keyInput}
                        onChange={(e) => setKeyInput(e.target.value)}
                        placeholder={provider.placeholder}
                        autoFocus
                        required
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-1.5 text-sm font-bold bg-slate-900 text-white px-4 py-2.5 rounded-xl hover:bg-slate-700 transition-colors disabled:opacity-50 shrink-0"
                    >
                      {saving ? "Guardando..." : "Guardar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAddingFor(null); setKeyInput(""); }}
                      className="text-sm text-slate-400 hover:text-slate-700 px-2 py-2 transition-colors shrink-0"
                    >
                      ✕
                    </button>
                  </form>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="text-xs text-slate-400">¿No tienes key?</span>
                    <a
                      href={provider.docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline flex items-center gap-0.5"
                    >
                      Consíguela aquí <ChevronRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Platform credits */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4">
        <div className="flex items-start gap-4">
          <div className="text-2xl shrink-0">🏦</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-black text-slate-900">Créditos de plataforma</span>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Próximamente</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sin API key propia, el agente usa los recursos de la plataforma. Sistema de créditos disponible pronto.
            </p>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-lg text-sm font-semibold z-50 transition-all ${
          toast.ok ? "bg-slate-900 text-white" : "bg-red-600 text-white"
        }`}>
          {toast.ok ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}
