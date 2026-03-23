import {
  MAGNET_MOQ_TABLE,
  PROFILE_BREAKEVEN,
  LAUNCH_CAPITAL,
  LAUNCH_TOTAL_CRITICAL,
  LAUNCH_TOTAL_ALL,
  PRODUCT_ECONOMICS,
  MONTHLY_PROJECTIONS,
  PENDING_DECISIONS,
} from "@/components/strategy/strategyCalc";

// ── ASSEMBLY ANALYSIS ─────────────────────────────────────────────────────────
const ASSEMBLY_TASKS = [
  {
    task: "Perforar MDF (336 agujeros D5)",
    who: "tú",
    time: "20 min",
    tool: "Taladro de columna + guía 30mm",
    skippable: false,
    note: "No delegable al cliente. Es la fabricación del tablero.",
  },
  {
    task: "Insertar imanes con epoxy (×336)",
    who: "tú",
    time: "45 min",
    tool: "Pistola epoxy rápido + plantilla",
    skippable: false,
    note: "El núcleo del producto. Requiere precisión y cura (~5 min epoxy rápido).",
  },
  {
    task: "Pegar NFC chip + VHB en panel",
    who: "tú",
    time: "3 min",
    tool: "Manual",
    skippable: false,
    note: "Rápido. NFC al dorso del tablero, VHB para la tela.",
  },
  {
    task: "Montar perfil SEG (4 barras + esquinas)",
    who: "cliente ✓",
    time: "15 min",
    tool: "Allen key M4",
    skippable: true,
    note: "El perfil SEG encaja con tornillos. Incluir guía de montaje PDF/QR.",
  },
  {
    task: "Insertar tela SEG con cordón silicona",
    who: "cliente ✓",
    time: "10 min",
    tool: "Rueda SEG (incluida en caja)",
    skippable: true,
    note: "Muy fácil con la herramienta correcta. Ver vídeo 60s en web.",
  },
  {
    task: "Colgar el sistema en pared",
    who: "cliente ✓",
    time: "10 min",
    tool: "Taco + tornillo (incluidos)",
    skippable: true,
    note: "2 puntos de anclaje al perfil superior. Nivel de burbuja recomendado.",
  },
];

const DELIVERY_MODES = [
  {
    mode: "Kit Fabricado",
    desc: "Tú fabricas el tablero (imanes+NFC). Cliente monta el marco SEG y cuelga.",
    youDo: ["Perforar MDF", "Insertar 336 imanes", "Pegar NFC + VHB"],
    clientDoes: ["Montar perfil SEG", "Insertar tela", "Colgar"],
    timeYou: "68 min/panel",
    includeGuide: true,
    margin: "+€7–12 vs modo ensamblado",
    recommended: true,
    note: "Reduce tu tiempo al mínimo. El montaje del marco es trivial para el cliente con guía de vídeo.",
  },
  {
    mode: "Listo para Colgar",
    desc: "Todo montado y probado. El cliente solo cuelga el sistema.",
    youDo: ["Perforar MDF", "Insertar imanes", "Pegar NFC", "Montar perfil", "Insertar tela"],
    clientDoes: ["Colgar (10 min)"],
    timeYou: "93 min/panel",
    includeGuide: false,
    margin: "Justifica +€30–50 de PVP",
    recommended: false,
    note: "Para clientes corporativos o instalaciones grandes. Premium tier.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────

export default function StrategyPage() {
  const criticalItems  = LAUNCH_CAPITAL.filter(i => i.critical);
  const optionalItems  = LAUNCH_CAPITAL.filter(i => !i.critical);
  const impactColors: Record<string, string> = {
    alto:  "bg-red-50 text-red-700 border-red-200",
    medio: "bg-amber-50 text-amber-700 border-amber-200",
    bajo:  "bg-slate-50 text-slate-600 border-slate-200",
  };

  return (
    <div className="space-y-10">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Estrategia</h1>
        <p className="text-sm text-slate-400 mt-1">
          Análisis de rentabilidad · MOQ imanes · Capital inicial · Fabricación vs cliente
        </p>
      </div>

      {/* ── 1. FABRICACIÓN — QUÉ HACES TÚ vs EL CLIENTE ─── */}
      <section>
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
          Fabricación — ¿Qué haces tú y qué hace el cliente?
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          El tablero lo fabricas siempre tú (es el producto diferencial). El marco SEG lo puede montar el cliente con una guía.
        </p>

        {/* Delivery modes */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {DELIVERY_MODES.map((m) => (
            <div
              key={m.mode}
              className={`bg-white rounded-3xl border shadow-sm p-5 ${
                m.recommended ? "border-lime-300 ring-1 ring-lime-200" : "border-slate-100"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-black text-slate-900 text-sm">{m.mode}</h3>
                {m.recommended && (
                  <span className="text-[9px] font-black bg-lime-100 text-lime-700 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                    Recomendado
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mb-3">{m.desc}</p>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-[9px] font-black text-red-600 uppercase tracking-wide mb-1.5">Tú haces</p>
                  {m.youDo.map(t => (
                    <div key={t} className="flex items-start gap-1 mb-0.5">
                      <span className="text-red-400 mt-0.5 shrink-0 text-[10px]">●</span>
                      <span className="text-[10px] text-slate-700">{t}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-[9px] font-black text-green-600 uppercase tracking-wide mb-1.5">Cliente hace</p>
                  {m.clientDoes.map(t => (
                    <div key={t} className="flex items-start gap-1 mb-0.5">
                      <span className="text-green-400 mt-0.5 shrink-0 text-[10px]">●</span>
                      <span className="text-[10px] text-slate-700">{t}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 flex-wrap mt-3">
                <span className="text-[10px] font-black bg-slate-100 text-slate-600 px-2.5 py-1 rounded-xl">
                  ⏱ {m.timeYou}
                </span>
                <span className="text-[10px] font-black bg-lime-50 text-lime-700 px-2.5 py-1 rounded-xl">
                  {m.margin}
                </span>
                {m.includeGuide && (
                  <span className="text-[10px] font-black bg-blue-50 text-blue-700 px-2.5 py-1 rounded-xl">
                    + Guía montaje PDF/QR
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 italic mt-2">{m.note}</p>
            </div>
          ))}
        </div>

        {/* Assembly task breakdown */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="text-left px-4 py-3 font-black text-[10px] uppercase tracking-wide">Tarea</th>
                <th className="text-center px-4 py-3 font-black text-[10px] uppercase tracking-wide">Quién</th>
                <th className="text-center px-4 py-3 font-black text-[10px] uppercase tracking-wide">Tiempo</th>
                <th className="text-left px-4 py-3 font-black text-[10px] uppercase tracking-wide">Herramienta</th>
                <th className="text-left px-4 py-3 font-black text-[10px] uppercase tracking-wide">Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {ASSEMBLY_TASKS.map((t, i) => (
                <tr key={i} className={t.skippable ? "bg-green-50/40" : "bg-red-50/30"}>
                  <td className="px-4 py-2.5 font-bold text-slate-800">{t.task}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      t.skippable
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {t.who}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-center font-black text-slate-700 tabular-nums">{t.time}</td>
                  <td className="px-4 py-2.5 text-slate-500">{t.tool}</td>
                  <td className="px-4 py-2.5 text-slate-400 italic text-[10px]">{t.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 bg-slate-50 flex gap-6 text-[10px]">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-200 inline-block" /> Fabricación — siempre tú</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-200 inline-block" /> Montaje — el cliente con guía</span>
          </div>
        </div>
      </section>

      {/* ── 2. RENTABILIDAD POR PRODUCTO ─── */}
      <section>
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
          Rentabilidad por Tamaño — Perfil España
        </h2>
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="text-left px-4 py-3 font-black text-[10px] uppercase tracking-wide">Tamaño</th>
                <th className="text-center px-4 py-3 font-black text-[10px] uppercase tracking-wide">Tableros</th>
                <th className="text-right px-4 py-3 font-black text-[10px] uppercase tracking-wide">Coste ALIGN</th>
                <th className="text-right px-4 py-3 font-black text-[10px] uppercase tracking-wide">PVP ALIGN</th>
                <th className="text-right px-4 py-3 font-black text-[10px] uppercase tracking-wide">Margen</th>
                <th className="text-right px-4 py-3 font-black text-[10px] uppercase tracking-wide">Coste FREE</th>
                <th className="text-right px-4 py-3 font-black text-[10px] uppercase tracking-wide">PVP FREE</th>
                <th className="text-right px-4 py-3 font-black text-[10px] uppercase tracking-wide">Margen</th>
                <th className="text-right px-4 py-3 font-black text-[10px] uppercase tracking-wide">Tiempo fab.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {PRODUCT_ECONOMICS.map((row) => {
                const mA = row.marginAlign >= 70 ? "text-green-600" : row.marginAlign >= 50 ? "text-amber-600" : "text-red-500";
                const mF = row.marginFree  >= 70 ? "text-green-600" : row.marginFree  >= 50 ? "text-amber-600" : "text-red-500";
                return (
                  <tr key={row.size} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-2.5 font-black text-slate-900">{row.size}</td>
                    <td className="px-4 py-2.5 text-center text-slate-500">{row.panels}</td>
                    <td className="px-4 py-2.5 text-right text-slate-700 tabular-nums">{row.cogAlign} €</td>
                    <td className="px-4 py-2.5 text-right font-black text-slate-900 tabular-nums">{row.pvpAlign} €</td>
                    <td className={`px-4 py-2.5 text-right font-black tabular-nums ${mA}`}>{row.marginAlign}%</td>
                    <td className="px-4 py-2.5 text-right text-slate-700 tabular-nums">{row.cogFree} €</td>
                    <td className="px-4 py-2.5 text-right font-black text-slate-900 tabular-nums">{row.pvpFree} €</td>
                    <td className={`px-4 py-2.5 text-right font-black tabular-nums ${mF}`}>{row.marginFree}%</td>
                    <td className="px-4 py-2.5 text-right text-slate-500 tabular-nums">{Math.round(row.assemblyH * 60)} min</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="px-4 py-2 text-[10px] text-slate-300 bg-slate-50">
            * Coste incluye fabricación (imanes+MDF+NFC+VHB) + perfil ES + tela + montaje tablero (68 min @ €15/h). Marco SEG lo monta el cliente.
            FREE = MDF sin imanes + chapa estimada €5.50.
          </p>
        </div>
      </section>

      {/* ── 3. MOQ IMANES ─── */}
      <section>
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
          MOQ Imanes D5×2mm — ¿Cuántos comprar?
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          Precio Zetar/Wendy: <span className="font-black text-slate-700">$0.06/ud</span> ·
          Alternativa local estimada: <span className="font-black text-slate-700">~€0.22/ud</span> ·
          Ahorro por imán: <span className="font-black text-lime-600">~€0.17</span>.
          <span className="ml-2 text-amber-600 font-bold">⚠ MOQ exacto pendiente confirmar con Wendy.</span>
        </p>
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="text-right px-4 py-3 font-black text-[10px] uppercase tracking-wide">Cantidad</th>
                <th className="text-right px-4 py-3 font-black text-[10px] uppercase tracking-wide">Inversión</th>
                <th className="text-right px-4 py-3 font-black text-[10px] uppercase tracking-wide">Tableros ALIGN Brilliant</th>
                <th className="text-right px-4 py-3 font-black text-[10px] uppercase tracking-wide">Coste imanes/tablero</th>
                <th className="text-right px-4 py-3 font-black text-[10px] uppercase tracking-wide">Ahorro vs local</th>
                <th className="text-center px-4 py-3 font-black text-[10px] uppercase tracking-wide"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {MAGNET_MOQ_TABLE.map((row) => (
                <tr key={row.qty} className={`hover:bg-slate-50 transition-colors ${row.tag === "recomendado" ? "bg-lime-50/50" : row.tag === "ideal" ? "bg-blue-50/30" : ""}`}>
                  <td className="px-4 py-2.5 text-right font-black text-slate-900 tabular-nums">
                    {row.qty.toLocaleString("es-ES")} ud
                  </td>
                  <td className="px-4 py-2.5 text-right font-bold text-slate-700 tabular-nums">{row.costEUR} €</td>
                  <td className="px-4 py-2.5 text-right text-slate-600 tabular-nums">{row.brilliantPanels} tableros</td>
                  <td className="px-4 py-2.5 text-right text-slate-600 tabular-nums">{row.costPerPanel} €</td>
                  <td className="px-4 py-2.5 text-right font-black text-lime-600 tabular-nums">+{row.savingVsLocal} €</td>
                  <td className="px-4 py-2.5 text-center">
                    {row.tag && (
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                        row.tag === "recomendado" ? "bg-lime-100 text-lime-700" : "bg-blue-100 text-blue-700"
                      }`}>
                        {row.tag}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 bg-slate-50">
            <p className="text-[10px] text-slate-500 font-bold">
              💡 Recomendación: 5,000 imanes = €276 → cubre ~14 tableros Brilliant o ~7 Joy.
              Es el lote mínimo sensato para no quedarte sin stock en las primeras semanas.
              A 10,000 tienes cobertura para los primeros 2-3 meses de lanzamiento.
            </p>
          </div>
        </div>
      </section>

      {/* ── 4. PERFIL — ES vs CN BREAKEVEN ─── */}
      <section>
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
          Perfil SEG — ¿Cuándo Pasarse a China?
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wide mb-1">Precio por set (Joy)</p>
            <div className="flex items-end gap-3">
              <div>
                <p className="text-[9px] text-slate-400">🇪🇸 España</p>
                <p className="text-2xl font-black text-slate-900">{PROFILE_BREAKEVEN.esPricePerSet} €</p>
              </div>
              <div className="text-slate-300 text-lg mb-1">→</div>
              <div>
                <p className="text-[9px] text-slate-400">🇨🇳 China</p>
                <p className="text-2xl font-black text-lime-600">{PROFILE_BREAKEVEN.cnPricePerSet} €</p>
              </div>
            </div>
            <p className="text-xs font-black text-lime-600 mt-2">
              -{PROFILE_BREAKEVEN.savingPerSet} € por set
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wide mb-1">Inversión mínima CN (MOQ 40)</p>
            <p className="text-2xl font-black text-slate-900">{PROFILE_BREAKEVEN.totalFixedCN} €</p>
            <div className="mt-2 space-y-1">
              <p className="text-[10px] text-slate-500">MOQ 40 sets: {PROFILE_BREAKEVEN.moqInvestEUR} €</p>
              <p className="text-[10px] text-slate-500">Logística estimada: {PROFILE_BREAKEVEN.logisticsCN} €</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wide mb-1">Breakeven China</p>
            <p className="text-2xl font-black text-slate-900">{PROFILE_BREAKEVEN.breakevenUnits} pedidos</p>
            <div className="mt-2 space-y-1">
              <p className="text-[10px] text-slate-500">Ahorro neto a 40 ud: <span className="font-black text-amber-600">{PROFILE_BREAKEVEN.netSavingAt40} €</span></p>
              <p className="text-[10px] text-slate-500">Ahorro neto a 100 ud: <span className="font-black text-green-600">{PROFILE_BREAKEVEN.netSavingAt100} €</span></p>
            </div>
          </div>
        </div>
        <div className="mt-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-xs text-amber-800">
          <span className="font-black">Conclusión: </span>
          Con menos de {PROFILE_BREAKEVEN.breakevenUnits} pedidos de Joy, España sale más barato en total. Cambia a China cuando tengas
          pedidos consistentes de al menos {PROFILE_BREAKEVEN.breakevenUnits} unidades por talla y tamaño.
        </div>
      </section>

      {/* ── 5. CAPITAL INICIAL ─── */}
      <section>
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
          Capital Inicial Necesario
        </h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-[10px] font-black text-red-600 uppercase tracking-wide mb-3">🔴 Crítico para arrancar</p>
            <div className="space-y-2">
              {criticalItems.map((item) => (
                <div key={item.item} className="bg-white border border-red-100 rounded-2xl p-3 flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-xs font-black text-slate-900">{item.item}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{item.supplier} · {item.covers}</p>
                    {item.note && <p className="text-[10px] text-amber-600 italic mt-0.5">{item.note}</p>}
                  </div>
                  <span className="text-xs font-black text-red-700 bg-red-50 px-2.5 py-1 rounded-xl shrink-0 tabular-nums">
                    {item.costEUR} €
                  </span>
                </div>
              ))}
              <div className="bg-red-900 text-white rounded-2xl p-3 flex justify-between items-center">
                <span className="text-xs font-black">MÍNIMO VIABLE</span>
                <span className="text-lg font-black tabular-nums">{LAUNCH_TOTAL_CRITICAL} €</span>
              </div>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wide mb-3">⚪ Opcional / puede esperar</p>
            <div className="space-y-2">
              {optionalItems.map((item) => (
                <div key={item.item} className="bg-white border border-slate-100 rounded-2xl p-3 flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-xs font-black text-slate-900">{item.item}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{item.supplier} · {item.covers}</p>
                    {item.note && <p className="text-[10px] text-slate-400 italic mt-0.5">{item.note}</p>}
                  </div>
                  <span className="text-xs font-black text-slate-600 bg-slate-50 px-2.5 py-1 rounded-xl shrink-0 tabular-nums">
                    {item.costEUR} €
                  </span>
                </div>
              ))}
              <div className="bg-slate-100 rounded-2xl p-3 flex justify-between items-center">
                <span className="text-xs font-black text-slate-600">TOTAL CON OPCIONALES</span>
                <span className="text-lg font-black text-slate-700 tabular-nums">{LAUNCH_TOTAL_ALL} €</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. PROYECCIÓN MENSUAL ─── */}
      <section>
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
          Proyección por Volumen Mensual
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          Mix estimado: 60% Brilliant ALIGN + 30% Joy ALIGN + 10% Abundant ALIGN · Perfil España · Marco monta el cliente.
        </p>
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="text-right px-4 py-3 font-black text-[10px] uppercase tracking-wide">Pedidos/mes</th>
                <th className="text-right px-4 py-3 font-black text-[10px] uppercase tracking-wide">Facturación</th>
                <th className="text-right px-4 py-3 font-black text-[10px] uppercase tracking-wide">COGS</th>
                <th className="text-right px-4 py-3 font-black text-[10px] uppercase tracking-wide">Margen bruto</th>
                <th className="text-right px-4 py-3 font-black text-[10px] uppercase tracking-wide">% Margen</th>
                <th className="text-right px-4 py-3 font-black text-[10px] uppercase tracking-wide">Horas fab.</th>
                <th className="text-right px-4 py-3 font-black text-[10px] uppercase tracking-wide">Días fab.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {MONTHLY_PROJECTIONS.map((row) => {
                const mColor = row.grossMarginPct >= 70 ? "text-green-600" : row.grossMarginPct >= 50 ? "text-amber-600" : "text-red-500";
                const overloaded = row.assemblyDays > 20;
                return (
                  <tr key={row.orders} className={overloaded ? "bg-red-50/40" : "hover:bg-slate-50"}>
                    <td className="px-4 py-2.5 text-right font-black text-slate-900 tabular-nums">{row.orders}</td>
                    <td className="px-4 py-2.5 text-right font-bold text-slate-700 tabular-nums">{row.revenue.toLocaleString("es-ES")} €</td>
                    <td className="px-4 py-2.5 text-right text-slate-500 tabular-nums">{row.cog.toLocaleString("es-ES")} €</td>
                    <td className="px-4 py-2.5 text-right font-black text-slate-900 tabular-nums">{row.grossProfit.toLocaleString("es-ES")} €</td>
                    <td className={`px-4 py-2.5 text-right font-black tabular-nums ${mColor}`}>{row.grossMarginPct}%</td>
                    <td className="px-4 py-2.5 text-right text-slate-500 tabular-nums">{row.assemblyHours}h</td>
                    <td className={`px-4 py-2.5 text-right font-black tabular-nums ${overloaded ? "text-red-600" : "text-slate-600"}`}>
                      {row.assemblyDays}d {overloaded && "⚠"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="px-4 py-2 text-[10px] text-slate-300 bg-slate-50">
            * Días fab. calculados a 4h productivas/día. ⚠ = supera 20 días/mes → necesitas externalizar montaje o contratar ayuda.
          </p>
        </div>
      </section>

      {/* ── 7. DECISIONES PENDIENTES ─── */}
      <section>
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
          Decisiones Pendientes
        </h2>
        <div className="space-y-3">
          {PENDING_DECISIONS.map((d) => (
            <div
              key={d.id}
              className={`bg-white rounded-2xl border p-4 flex items-start gap-4 ${impactColors[d.impact]}`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-black text-sm">{d.title}</h3>
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full border uppercase tracking-wide ${impactColors[d.impact]}`}>
                    {d.impact}
                  </span>
                </div>
                <p className="text-xs opacity-80 mb-2">{d.desc}</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-black uppercase tracking-wide opacity-60">Acción →</span>
                  <span className="text-[10px] font-bold">{d.action}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
