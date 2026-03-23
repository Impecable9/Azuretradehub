import { ExternalLink } from "lucide-react";
import { CostBreakdownChart, PvpVsCostChart } from "@/components/operations/CostCharts";
import { STRATEGY_TABLE } from "@/components/operations/strategyData";

const SUPPLIERS = [
  {
    name: "Impretienda",
    country: "🇪🇸 España",
    component: "Perfil SEG 19mm (pared)",
    price: "10.40 €/ml",
    moq: "Sin MOQ",
    delivery: "24/48h",
    date: "Mayo 2025",
    quotes: [
      { label: "Joy (4ml)", pdf: "/docs/quotes/Impretienda-A01179-Joy.pdf" },
      { label: "Abundant (5ml)", pdf: "/docs/quotes/Impretienda-A01180-Abundant.pdf" },
      { label: "Nova (7ml)", pdf: "/docs/quotes/Impretienda-A01181-Nova.pdf" },
      { label: "Luna (8ml)", pdf: "/docs/quotes/Impretienda-A01182-Luna.pdf" },
    ],
    highlight: true,
    note: "Proveedor local, sin riesgo de stock. Opción preferida para lanzamiento.",
  },
  {
    name: "MESCO Steel HK",
    country: "🇨🇳 China (EXW)",
    component: "Marco aluminio SEG completo",
    price: "5–13 USD/set",
    moq: "MOQ 40 ud/talla",
    delivery: "15–20 días",
    date: "Agosto 2025",
    quotes: [
      { label: "Todos los tamaños", pdf: "/docs/quotes/MESCO-perfil-alu-EXW.pdf" },
    ],
    highlight: false,
    note: "10× más barato que España pero requiere MOQ 40 + logística de importación.",
  },
  {
    name: "Zetar Industry (Wendy)",
    country: "🇨🇳 China (EXW)",
    component: "Tablero MDF perforado + imanes N52",
    price: "4.70 USD/panel (@500) · 0.06 USD/imán D5×2mm",
    moq: "MOQ 500 tableros",
    delivery: "30–40 días",
    date: "Noviembre 2025",
    quotes: [
      { label: "MDF + acrilico + magnets", pdf: "/docs/quotes/Zetar-Wendy-WI25001-MDF-magnets.pdf" },
      { label: "Imanes D5×2mm y D5×6mm", pdf: "/docs/quotes/Zetar-Wendy-magnets-D5x2mm-D5x6mm.pdf" },
    ],
    highlight: false,
    note: "Proveedor clave para ALIGN. Cubre MDF, imanes, acrílico y adhesivo 3M.",
  },
  {
    name: "Kamy Kung (GUNGI)",
    country: "🇨🇳 China (EXW)",
    component: "Heartframe MDF 8×8cm + 9 imanes D5×12mm",
    price: "3.58 USD/ud (@1000)",
    moq: "MOQ 1000",
    delivery: "15 días",
    date: "Octubre 2025",
    quotes: [
      { label: "Heartframe MDF completo", pdf: "/docs/quotes/KamyKung-MDF-Heartframe.pdf" },
    ],
    highlight: false,
    note: "Incluye imanes + VHB + laser engraving. Alternativa industrial al PLA artesanal.",
  },
  {
    name: "Terrence Metal (Ningbo)",
    country: "🇨🇳 China (CIF Málaga)",
    component: "Accesorios metálicos: Wing, Nest, Craw, Pins, Heartframe",
    price: "0.84–4.14 USD/ud CIF Málaga (@50)",
    moq: "MOQ 50 ud/pieza",
    delivery: "Mar por barco",
    date: "Noviembre 2025",
    quotes: [
      { label: "50 pcs cada accesorio", pdf: "/docs/quotes/Terrence-metal-accesorios-50pcs.pdf" },
    ],
    highlight: false,
    note: "Precio CIF Malaga incluye flete marítimo. El cliente hace el despacho en aduana.",
  },
  {
    name: "Changzhou Phoneto",
    country: "🇨🇳 China (EXW)",
    component: "Tela SEG impresa con silicona cosida",
    price: "6.00–9.90 USD/ud según tamaño",
    moq: "MOQ ~300 ud",
    delivery: "5 días hábiles",
    date: "2022–2023",
    quotes: [
      { label: "Telas SEG Joy + Abundant", pdf: "/docs/quotes/Changzhou-Phoneto-tela-SEG.pdf" },
    ],
    highlight: false,
    note: "Fabricante de tela con impresión de sublimación + cosido de cordón de silicona 4mm incluido.",
  },
  {
    name: "Dongguan Xingfenglin",
    country: "🇨🇳 China (EXW)",
    component: "Planchas acrílicas traseras para accesorios",
    price: "0.60–6.00 USD/ud según tamaño (@100)",
    moq: "MOQ 100 ud",
    delivery: "25 días",
    date: "Septiembre 2025",
    quotes: [
      { label: "Acrílico sin imanes", pdf: "/docs/quotes/Xingfenglin-acrylic-accesorio-backs.pdf" },
    ],
    highlight: false,
    note: "Planchas transparentes/negras/espejo CNC con tolerancias de ±0.1mm.",
  },
  {
    name: "Shenzhen IDRFID",
    country: "🇨🇳 China",
    component: "NFC Chip IDN7645 (NXP NTAG213)",
    price: "~0.10–0.15 USD/ud (@1000)",
    moq: "1000/rollo",
    delivery: "Estándar",
    date: "2025",
    quotes: [
      { label: "Datasheet IDN7645 NTAG213", pdf: "/docs/quotes/IDRFID-IDN7645-NTAG213-datasheet.pdf" },
    ],
    highlight: false,
    note: "NTAG213: 144 bytes, antena 76×45mm, lectura 0–80mm, 100k ciclos escritura. CE+RoHS.",
  },
  {
    name: "Yes Lab 82+",
    country: "🇩🇪 Alemania (Colombia)",
    component: "Packaging: cajas, insertos, fundas, esquineros",
    price: "0.26–3.61 €/ud según pieza (@1000)",
    moq: "500 ud/referencia",
    delivery: "Cotizar",
    date: "Junio 2024",
    quotes: [
      { label: "Empaques Phoenix Wall completo", pdf: "/docs/quotes/YesLab-packaging-cotizacion.pdf" },
    ],
    highlight: false,
    note: "Embalaje kraft microcorrugado con opción impresión 4 tintas plastificado mate.",
  },
];

type BomRow = {
  component: string;
  align_es: string;
  align_cn: string;
  free_es: string;
  free_cn: string;
  isTotals?: boolean;
};

const BOM_ROWS: BomRow[] = [
  { component: "MDF perforado (Zetar)", align_es: "€4.33", align_cn: "€4.33", free_es: "~€3.00*", free_cn: "~€3.00*" },
  { component: "Imanes D5×2mm ×336 (Zetar)", align_es: "€18.55", align_cn: "€18.55", free_es: "—", free_cn: "—" },
  { component: "Adhesivo 3M VHB", align_es: "€0.64", align_cn: "€0.64", free_es: "€0.64", free_cn: "€0.64" },
  { component: "Chip NFC NTAG213", align_es: "€0.11", align_cn: "€0.11", free_es: "€0.11", free_cn: "€0.11" },
  { component: "Perfil SEG 19mm ~2.55ml", align_es: "€26.52", align_cn: "€2.30", free_es: "€26.52", free_cn: "€2.30" },
  { component: "Tela SEG impresa (Joy)", align_es: "€6.08", align_cn: "€6.08", free_es: "€6.08", free_cn: "€6.08" },
  { component: "Silicona SEG cord", align_es: "€0.50", align_cn: "€0.50", free_es: "€0.50", free_cn: "€0.50" },
  { component: "Chapa acero (FREE)", align_es: "—", align_cn: "—", free_es: "~€5.50*", free_cn: "~€5.50*" },
  { component: "TOTAL s/montaje", align_es: "~€56.73", align_cn: "€32.51", free_es: "~€42.35", free_cn: "€18.13", isTotals: true },
  { component: "Montaje (30min @ €15/h)", align_es: "€7.50", align_cn: "€7.50", free_es: "€7.50", free_cn: "€7.50" },
  { component: "TOTAL c/montaje", align_es: "~€64.23", align_cn: "€40.01", free_es: "~€49.85", free_cn: "€25.63", isTotals: true },
];

const ORDER_STEPS = [
  { task: "Recepción y verificación de componentes", time: "15 min" },
  { task: "Ensamblaje del tablero (perforar/colocar imanes + epoxy)", time: "45 min" },
  { task: "Montaje perfil SEG + instalación tela", time: "30 min" },
  { task: "Control de calidad + programar NFC", time: "15 min" },
  { task: "Packaging (caja + insertos + etiquetado)", time: "20 min" },
  { task: "Preparar envío (label, tracking, drop-off)", time: "15 min" },
];

const HIDDEN_COSTS = [
  { item: "Tiempo de ensamblaje (2.5h @ €15/h)", cost: "€37.50" },
  { item: "Packaging material", cost: "€3–5" },
  { item: "Envío nacional", cost: "€8–15" },
  { item: "Envío internacional", cost: "€25–80" },
  { item: "Seguro envío (1% valor)", cost: "€1.50–5" },
  { item: "Herramientas/consumibles (prorrateados)", cost: "€2–3" },
];

type ScaleColor = "amber" | "lime" | "green";

const SCALE_PHASES: { phase: string; desc: string; color: ScaleColor }[] = [
  {
    phase: "Ahora (0–20 pedidos/mes)",
    desc: "Artesanal total. Bambu para Heartframe/accesorios. Perfil español sin MOQ. Máximo 4 tableros/día.",
    color: "amber",
  },
  {
    phase: "Fase 2 (20–100 pedidos/mes)",
    desc: "Lanzar MOQ China para MDF y magnets. Externalizar ensamblaje a taller local. Reducir coste/tablero un 40%.",
    color: "lime",
  },
  {
    phase: "Fase 3 (100+ pedidos/mes)",
    desc: "Pedido completo China todo incluido. Fulfillment center. Tú solo gestionas la plataforma y proveedores.",
    color: "green",
  },
];

const COLOR_MAP: Record<ScaleColor, { bg: string; border: string; text: string; label: string }> = {
  amber: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-800", label: "text-amber-600" },
  lime:  { bg: "bg-lime-50",  border: "border-lime-200",  text: "text-lime-800",  label: "text-lime-600" },
  green: { bg: "bg-green-50", border: "border-green-200", text: "text-green-800", label: "text-green-600" },
};

export default function OperationsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Operaciones</h1>
        <p className="text-sm text-slate-400 mt-1">Directorio de proveedores · BOM de costes · Realidad operativa</p>
      </div>

      {/* Section 1: Supplier Directory */}
      <section>
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Directorio de Proveedores</h2>
        <div className="grid grid-cols-3 gap-4">
          {SUPPLIERS.map((s) => (
            <div
              key={s.name}
              className={`bg-white rounded-3xl border shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-all duration-200 ${
                s.highlight ? "border-lime-300 ring-1 ring-lime-200" : "border-slate-100"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-black text-slate-900 text-sm">{s.name}</h3>
                    {s.highlight && (
                      <span className="text-[9px] font-black bg-lime-100 text-lime-700 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                        Preferido
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">{s.country}</p>
                </div>
                <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-xl shrink-0 text-right leading-tight">
                  {s.delivery}
                </span>
              </div>

              <div>
                <p className="text-xs text-slate-600 font-medium leading-snug">{s.component}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <div className="bg-slate-50 rounded-xl px-3 py-1.5">
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Precio</div>
                  <div className="text-xs font-black text-slate-900 mt-0.5">{s.price}</div>
                </div>
                <div className="bg-slate-50 rounded-xl px-3 py-1.5">
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-wide">MOQ</div>
                  <div className="text-xs font-black text-slate-900 mt-0.5">{s.moq}</div>
                </div>
                <div className="bg-slate-50 rounded-xl px-3 py-1.5">
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Cotización</div>
                  <div className="text-xs font-black text-slate-900 mt-0.5">{s.date}</div>
                </div>
              </div>

              {s.note && (
                <p className="text-[10px] text-slate-500 leading-relaxed italic border-t border-slate-100 pt-2">
                  {s.note}
                </p>
              )}

              <div className="flex flex-wrap gap-1.5 mt-auto">
                {s.quotes.map((q) => (
                  <a
                    key={q.pdf}
                    href={q.pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[10px] font-bold bg-slate-900 text-white px-2.5 py-1 rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    <ExternalLink className="w-2.5 h-2.5" />
                    {q.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 2: BOM Costs Summary */}
      <section>
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">BOM · Costes por Panel</h2>
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-5 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Componente</th>
                  <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">ALIGN (ES)</th>
                  <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">ALIGN (CN)</th>
                  <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">FREE (ES)</th>
                  <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">FREE (CN)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {BOM_ROWS.map((row) => (
                  <tr
                    key={row.component}
                    className={row.isTotals ? "bg-slate-900 text-white" : "hover:bg-slate-50 transition-colors"}
                  >
                    <td className={`px-5 py-3 text-sm ${row.isTotals ? "font-black text-white" : "font-medium text-slate-700"}`}>
                      {row.component}
                    </td>
                    <td className={`px-4 py-3 text-right text-sm tabular-nums ${row.isTotals ? "font-black text-lime-400" : "text-slate-600"}`}>
                      {row.align_es}
                    </td>
                    <td className={`px-4 py-3 text-right text-sm tabular-nums ${row.isTotals ? "font-black text-lime-400" : "text-slate-600"}`}>
                      {row.align_cn}
                    </td>
                    <td className={`px-4 py-3 text-right text-sm tabular-nums ${row.isTotals ? "font-black text-lime-400" : "text-slate-600"}`}>
                      {row.free_es}
                    </td>
                    <td className={`px-4 py-3 text-right text-sm tabular-nums ${row.isTotals ? "font-black text-lime-400" : "text-slate-600"}`}>
                      {row.free_cn}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50">
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Los costes marcados con * son estimaciones pendientes de cotización. Perfil ES = Impretienda sin MOQ. Perfil CN = MESCO MOQ 40 ud/talla + flete + aduana.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Solo Founder Reality Check */}
      <section>
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Operaciones Reales · Fundador Solo</h2>
        <p className="text-xs text-slate-400 mb-4">Tiempo real, costes ocultos y hoja de ruta de escala.</p>

        <div className="grid grid-cols-3 gap-4">
          {/* Card 1: Por cada pedido */}
          <div className="bg-white rounded-3xl border border-amber-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-sm">
                ⏱
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm">Por cada pedido</h3>
                <p className="text-[10px] text-amber-600 font-bold">Tiempo estimado total</p>
              </div>
            </div>
            <div className="space-y-2">
              {ORDER_STEPS.map((step) => (
                <div key={step.task} className="flex items-center justify-between gap-3">
                  <p className="text-xs text-slate-600 leading-snug flex-1">{step.task}</p>
                  <span className="text-[10px] font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full shrink-0 tabular-nums">
                    {step.time}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-amber-100 flex items-center justify-between">
              <span className="text-xs font-black text-slate-900">Total</span>
              <span className="text-sm font-black text-amber-600">~2.5 h/tablero</span>
            </div>
          </div>

          {/* Card 2: Costes ocultos */}
          <div className="bg-white rounded-3xl border border-orange-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center text-sm">
                ⚠
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm">Costes ocultos</h3>
                <p className="text-[10px] text-orange-600 font-bold">No están en el BOM</p>
              </div>
            </div>
            <div className="space-y-2">
              {HIDDEN_COSTS.map((c) => (
                <div key={c.item} className="flex items-center justify-between gap-3">
                  <p className="text-xs text-slate-600 leading-snug flex-1">{c.item}</p>
                  <span className="text-[10px] font-black text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full shrink-0 tabular-nums">
                    {c.cost}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-orange-100">
              <p className="text-xs font-black text-orange-700">
                Añadir €50–100 por tablero al coste base
              </p>
            </div>
          </div>

          {/* Card 3: Estrategia de escala */}
          <div className="bg-white rounded-3xl border border-green-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center text-sm">
                📈
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm">Estrategia de escala</h3>
                <p className="text-[10px] text-green-600 font-bold">Hoja de ruta 3 fases</p>
              </div>
            </div>
            <div className="space-y-3">
              {SCALE_PHASES.map((phase) => {
                const c = COLOR_MAP[phase.color];
                return (
                  <div key={phase.phase} className={`${c.bg} border ${c.border} rounded-2xl p-3`}>
                    <p className={`text-[10px] font-black ${c.label} uppercase tracking-wide mb-1`}>{phase.phase}</p>
                    <p className={`text-xs ${c.text} leading-snug`}>{phase.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Cost Charts */}
      <section>
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Análisis de Costes — Gráficas</h2>
        <div className="grid grid-cols-2 gap-4">
          <CostBreakdownChart />
          <PvpVsCostChart />
        </div>
      </section>

      {/* Section 5: Best Price & Strategy Table */}
      <section>
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Mejor Precio y Estrategia</h2>
        <p className="text-xs text-slate-400 mb-4">
          PVP óptimo por tamaño · margen real · cuándo escalar a China
        </p>
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest">Tamaño</th>
                <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest">Coste ALIGN (ES)</th>
                <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest">Coste ALIGN (CN)</th>
                <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest text-lime-400">PVP ALIGN</th>
                <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest text-lime-400">PVP FREE</th>
                <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest">Margen ALIGN</th>
                <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest">Margen FREE</th>
                <th className="px-5 py-3 text-right text-[10px] font-black uppercase tracking-widest text-amber-400">Escalar CN a partir de</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {STRATEGY_TABLE.map((row) => {
                const marginAlignColor = row.marginAlign >= 60 ? "text-green-600" : row.marginAlign >= 40 ? "text-amber-600" : "text-red-500";
                const marginFreeColor  = row.marginFree  >= 60 ? "text-green-600" : row.marginFree  >= 40 ? "text-amber-600" : "text-red-500";
                return (
                  <tr key={row.size} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-black text-slate-900">{row.size}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-500 text-xs">{row.cAlignES} €</td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-400 text-xs">{row.cAlignCN} €</td>
                    <td className="px-4 py-3 text-right tabular-nums font-black text-slate-900">{row.pvpAlign} €</td>
                    <td className="px-4 py-3 text-right tabular-nums font-black text-slate-700">{row.pvpFree} €</td>
                    <td className={`px-4 py-3 text-right tabular-nums font-black ${marginAlignColor}`}>{row.marginAlign}%</td>
                    <td className={`px-4 py-3 text-right tabular-nums font-black ${marginFreeColor}`}>{row.marginFree}%</td>
                    <td className="px-5 py-3 text-right text-xs text-amber-600 font-bold">{row.switchToCNAt}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-6 text-[10px] text-slate-500">
            <span><span className="text-green-600 font-bold">■</span> Margen ≥60% — Sostenible</span>
            <span><span className="text-amber-600 font-bold">■</span> Margen 40–60% — Aceptable</span>
            <span><span className="text-red-500 font-bold">■</span> Margen &lt;40% — Revisar</span>
            <span className="ml-auto text-slate-400">Coste incluye materiales + montaje (€7.50/panel) + packaging. PVP con charm pricing.</span>
          </div>
        </div>

        {/* Recommendation box */}
        <div className="mt-4 bg-slate-900 rounded-3xl p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-lime-400 flex items-center justify-center text-slate-900 text-lg shrink-0">💡</div>
            <div>
              <h3 className="font-black text-lg uppercase tracking-tight text-lime-400 mb-2">Recomendación de Lanzamiento</h3>
              <div className="grid grid-cols-3 gap-6 text-sm">
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase mb-1">Producto inicial</p>
                  <p className="text-white font-medium leading-snug">
                    Vende <strong className="text-lime-400">Brilliant ALIGN + Heartframe ×2 + Marco BGA ×2</strong> como pack de entrada.
                    Coste ~€100 · Pack PVP <strong className="text-lime-400">€399</strong> · Margen ~€300 (75%).
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase mb-1">Perfil SEG ahora</p>
                  <p className="text-white font-medium leading-snug">
                    Usa <strong className="text-lime-400">Impretienda (España)</strong> — sin MOQ, 24/48h. Cuando alcances
                    <strong className="text-lime-400"> 40 pedidos del mismo tamaño</strong> cambia a MESCO China: ahorra €20–30/panel en perfil.
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase mb-1">Cuello de botella</p>
                  <p className="text-white font-medium leading-snug">
                    Máx. <strong className="text-lime-400">4 tableros/día</strong> solo. A partir de 20 pedidos/mes
                    necesitas taller de montaje externo o socio. El mayor ahorro no es bajar costes de material
                    — es <strong className="text-lime-400">eliminar tu tiempo de montaje</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
