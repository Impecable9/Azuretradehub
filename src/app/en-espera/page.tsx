export default function EnEsperaPage() {
  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <div className="font-black text-3xl text-white tracking-tight mb-2">
          Azure<span className="text-sky-400">trade</span>hub
        </div>
      </div>

      <div className="w-full max-w-sm">
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-8 text-center">
          <div className="text-5xl mb-5">⏳</div>
          <h2 className="text-xl font-bold text-white mb-3">Solicitud recibida</h2>
          <p className="text-zinc-400 text-sm leading-relaxed mb-6">
            Hemos registrado tu cuenta. En cuanto el equipo apruebe tu acceso recibirás una notificación.
          </p>
          <a
            href="/"
            className="text-xs text-sky-400 hover:underline"
          >
            ← Volver al inicio
          </a>
        </div>
      </div>
    </div>
  );
}
