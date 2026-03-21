"use client";

import { useState, useEffect } from "react";
import { Key, Shield, Trash2, CheckCircle, AlertCircle, ExternalLink } from "lucide-react";

export default function SettingsPage() {
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((d) => setHasKey(d.hasApiKey));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setErrorMsg("");
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey }),
    });
    const data = await res.json();
    if (res.ok) {
      setStatus("success");
      setHasKey(true);
      setApiKey("");
    } else {
      setStatus("error");
      setErrorMsg(data.error ?? "Error al guardar");
    }
  }

  async function handleDelete() {
    if (!confirm("¿Eliminar tu API key? El agente usará los créditos de la plataforma.")) return;
    await fetch("/api/settings", { method: "DELETE" });
    setHasKey(false);
    setStatus("idle");
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <h1 className="text-2xl font-black text-slate-900">Configuración del agente</h1>
        <p className="text-sm text-slate-400 mt-0.5">Conecta tu propia API key de Anthropic</p>
      </div>

      <div className="px-6 py-6 max-w-xl space-y-6">

        {/* Security notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex gap-3">
          <Shield className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700 leading-relaxed">
            Tu API key se cifra con <strong>AES-256-GCM</strong> antes de guardarse. Nunca se almacena en texto plano. Ni nosotros podemos leerla.
          </div>
        </div>

        {/* Current status */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-4">
            <Key className="w-5 h-5 text-slate-500" />
            <h2 className="font-bold text-slate-900">API key de Anthropic</h2>
          </div>

          {hasKey === null && (
            <div className="text-sm text-slate-400 animate-pulse">Cargando...</div>
          )}

          {hasKey === true && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-lg px-4 py-3">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">API key configurada y cifrada</span>
              </div>
              <p className="text-xs text-slate-400">
                El agente usa tu key de Anthropic directamente. No se descuentan créditos de plataforma.
              </p>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar API key
              </button>
            </div>
          )}

          {hasKey === false && (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  Tu API key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-ant-api03-..."
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {status === "error" && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={status === "saving"}
                className="w-full bg-slate-900 hover:bg-slate-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-50"
              >
                {status === "saving" ? "Cifrando y guardando..." : "Guardar API key"}
              </button>

              <p className="text-xs text-slate-400 leading-relaxed">
                ¿No tienes API key?{" "}
                <a
                  href="https://console.anthropic.com/settings/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-500 hover:underline inline-flex items-center gap-1"
                >
                  Consíguela en console.anthropic.com <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </form>
          )}
        </div>

        {/* How it works */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-bold text-slate-900 mb-3">Cómo funciona</h2>
          <div className="space-y-3">
            {[
              { title: "Tu propia key", desc: "El agente usa tu cuenta de Anthropic. Pagas directamente a Anthropic según uso.", active: hasKey === true },
              { title: "Créditos de plataforma", desc: "Usas la key de la plataforma. Próximamente disponible con sistema de créditos.", active: hasKey === false },
            ].map((item) => (
              <div key={item.title} className={`rounded-xl border px-4 py-3 ${item.active ? "border-sky-300 bg-sky-50" : "border-slate-100"}`}>
                <div className="flex items-center gap-2 mb-1">
                  {item.active && <span className="w-2 h-2 rounded-full bg-sky-500 inline-block" />}
                  <span className="text-sm font-semibold text-slate-800">{item.title}</span>
                  {item.active && <span className="text-xs text-sky-600 font-medium ml-auto">Activo</span>}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
