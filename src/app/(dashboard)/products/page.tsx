"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

const SIZES = [
  {
    name: "Brilliant",
    dims: "442 × 832 mm",
    wMM: 442, hMM: 832,
    cols: 1, rows: 1,
    panels: 1,
    desc: "El más pequeño de la colección. Ideal para espacios reducidos, rincones especiales o como primer paso.",
    ideal: "Recibidores, habitaciones, despachos",
  },
  {
    name: "Joy",
    dims: "832 × 832 mm",
    wMM: 832, hMM: 832,
    cols: 2, rows: 1,
    panels: 2,
    desc: "Compacto pero impactante. Convierte una esquina olvidada en un punto de expresión visual.",
    ideal: "Cafeterías, recibidores, zonas de paso",
  },
  {
    name: "Abundant",
    dims: "1222 × 832 mm",
    wMM: 1222, hMM: 832,
    cols: 3, rows: 1,
    panels: 3,
    desc: "Equilibra funcionalidad y diseño visual. Proporción perfecta para storytelling sin dominar la pared.",
    ideal: "Salones, oficinas, escaparates",
  },
  {
    name: "Nova",
    dims: "1222 × 1612 mm",
    wMM: 1222, hMM: 1612,
    cols: 3, rows: 2,
    panels: 6,
    desc: "Versátil y envolvente. Composición cuadrada que se convierte en centro de atención en zonas amplias.",
    ideal: "Cafeterías, coworkings, galerías",
  },
  {
    name: "Luna",
    dims: "1612 × 2002 mm",
    wMM: 1612, hMM: 2002,
    cols: 4, rows: 2,
    panels: 8,
    desc: "Experiencia visual inmersiva. Composiciones emocionales, narrativas o producto en exposición.",
    ideal: "Hoteles boutique, showrooms, áreas VIP",
  },
  {
    name: "Gea",
    dims: "2002 × 2392 mm",
    wMM: 2002, hMM: 2392,
    cols: 4, rows: 3,
    panels: 12,
    desc: "Mural con alma. Instalación escenográfica donde cada cuadro es una historia conectada.",
    ideal: "Vestíbulos hotel, tiendas flagship, exposiciones",
  },
];

function PanelGrid({ wMM, hMM, cols, rows }: { wMM: number; hMM: number; cols: number; rows: number }) {
  const BOX_W = 160;
  const BOX_H = 110;
  const aspect = wMM / hMM;
  let dispW: number, dispH: number;
  if (aspect > BOX_W / BOX_H) {
    dispW = BOX_W;
    dispH = BOX_W / aspect;
  } else {
    dispH = BOX_H;
    dispW = BOX_H * aspect;
  }
  const ox = (BOX_W - dispW) / 2;
  const oy = (BOX_H - dispH) / 2;
  const cellW = dispW / cols;
  const cellH = dispH / rows;
  // Person silhouette: 1.80m at same scale
  const pxPerMM = dispH / hMM;
  const personH = Math.min(1800 * pxPerMM, BOX_H * 0.95);
  const personW = personH * 0.15;
  const personX = ox + dispW + 6;
  const personY = oy + dispH - personH;

  return (
    <svg viewBox={`0 0 ${BOX_W + (personX + personW + 4 < BOX_W + 30 ? 30 : personW + 14)} ${BOX_H}`} className="w-full h-full">
      {/* Wall panel grid */}
      <rect x={ox} y={oy} width={dispW} height={dispH} fill="#1e293b" rx={3} />
      {Array.from({ length: cols - 1 }).map((_, i) => (
        <line key={`v${i}`} x1={ox + (i + 1) * cellW} y1={oy} x2={ox + (i + 1) * cellW} y2={oy + dispH} stroke="#334155" strokeWidth={1} />
      ))}
      {Array.from({ length: rows - 1 }).map((_, i) => (
        <line key={`h${i}`} x1={ox} y1={oy + (i + 1) * cellH} x2={ox + dispW} y2={oy + (i + 1) * cellH} stroke="#334155" strokeWidth={1} />
      ))}
      <rect x={ox} y={oy} width={dispW} height={dispH} fill="none" stroke="#475569" strokeWidth={1} rx={3} />
      {/* Dimension labels */}
      <text x={ox + dispW / 2} y={oy + dispH + 10} textAnchor="middle" fontSize={7} fill="#64748b">{(wMM / 1000).toFixed(2)}m</text>
      <text x={ox - 5} y={oy + dispH / 2} textAnchor="end" fontSize={7} fill="#64748b" dominantBaseline="middle">{(hMM / 1000).toFixed(2)}m</text>
      {/* Person silhouette */}
      {personX + personW + 4 <= BOX_W + 30 && (
        <>
          <rect x={personX} y={personY} width={personW} height={personH} fill="#94a3b8" rx={2} opacity={0.5} />
          <circle cx={personX + personW / 2} cy={personY - personW * 0.6} r={personW * 0.55} fill="#94a3b8" opacity={0.5} />
          <text x={personX + personW / 2} y={personY + personH + 9} textAnchor="middle" fontSize={6} fill="#64748b">1.80m</text>
        </>
      )}
    </svg>
  );
}

const FABRICS = [
  { name: "Atenas",    style: "Mármol azul grisáceo",  img: "/products/fabrics/atenas.jpg" },
  { name: "Milán",     style: "Mármol oscuro",          img: "/products/fabrics/milan.jpg" },
  { name: "París",     style: "Mármol gris claro",      img: "/products/fabrics/paris.jpg" },
  { name: "Cairo",     style: "Cemento beige cálido",   img: "/products/fabrics/cairo.jpg" },
  { name: "Londres",   style: "Cemento gris claro",     img: "/products/fabrics/londres.png" },
  { name: "Berlín",    style: "Cemento gris neutro",    img: "/products/fabrics/berlin.jpg" },
  { name: "Bali",      style: "Tropical exótico",       img: "/products/fabrics/bali.png" },
  { name: "Mallorca",  style: "Tropical monstera",      img: "/products/fabrics/mallorca.jpg" },
  { name: "San Paulo", style: "Tropical colorido",      img: "/products/fabrics/sanpaulo.png" },
];

const ACCESSORIES = [
  {
    name: "Marco Roble Fino",
    category: "Marcos",
    desc: "Madera de roble fino · cristal acrílico estándar. Upgrade disponible: vidrio museo antirreflectante UltraVue UV70 (cristal real, 99% AR, 70% UV).",
    sizes: ["15×15 cm", "20×20 cm"],
    price: "19.95 €",
    img: "/products/accessories/marco-roble.jpg",
  },
  {
    name: "Marco BGA Classic",
    category: "Marcos",
    desc: "Madera de roble Classic · cristal acrílico estándar. Upgrade disponible: vidrio museo antirreflectante UltraVue UV70.",
    sizes: ["20×20 cm"],
    price: "12.95 €",
    img: "/products/accessories/marco-bga.jpg",
  },
  {
    name: "Vidrio Museo UltraVue UV70",
    category: "Marcos",
    desc: "Cristal real antirreflectante 99% · protección UV 70%. Sustitución del acrílico estándar para instalaciones premium. Se monta en cualquier marco BGA.",
    sizes: ["20×20 cm"],
    price: "64.95 €",
    img: "/products/accessories/marco-bga.jpg",
  },
  {
    name: "The Craw",
    category: "Estanterías",
    desc: "Sostiene bloc A4 y elementos decorativos ligeros. Ideal para listas, calendarios o relojes. Cuerpo: cerámica (artesanal) o metal magnético (industrial). Trasera acrílica con 21 imanes D5×3mm en dos orientaciones: H horizontal, V vertical.",
    capacity: "hasta 0.6 kg",
    magnets: "21 imanes D5×3mm",
    variants: ["Artesanal · cerámica/PLA", "Industrial · metal"],
    img: "/products/accessories/the-pins-product.jpg",
  },
  {
    name: "The Wing",
    category: "Estanterías",
    desc: "Perfecto para libros, relojes y plantas. Diseño funcional y decorativo. Cuerpo: cerámica (artesanal) o metal magnético (industrial). 45 imanes D5×3mm a 3cm de separación en trasera acrílica.",
    capacity: "hasta 3 kg",
    magnets: "45 imanes D5×3mm",
    variants: ["Artesanal · cerámica/PLA", "Industrial · metal (MOQ 50)"],
    img: "/products/accessories/wings-detail.jpg",
  },
  {
    name: "The Nest",
    category: "Estanterías",
    desc: "Para objetos ligeros como lapiceros o suculentas. Cuerpo: cerámica (artesanal) o metal magnético (industrial). 21 imanes D5×3mm a 3cm de separación en trasera acrílica.",
    capacity: "hasta 1.4 kg",
    magnets: "21 imanes D5×3mm",
    variants: ["Artesanal · cerámica/PLA", "Industrial · metal (MOQ 50)"],
    img: "/products/accessories/the-pins.jpg",
  },
  {
    name: "The Pins",
    category: "Organización",
    desc: "Para guardar documentos y recuerdos. Un solo punto de sujeción magnética. Cuerpo: cerámica (artesanal) o metal magnético (industrial). 1 imán D5×3mm central.",
    magnets: "1 imán D5×3mm",
    variants: ["Artesanal · cerámica/PLA", "Industrial · metal (MOQ 50)"],
    img: "/products/accessories/the-craw.jpg",
  },
  {
    name: "Heartframe",
    category: "Marcos",
    desc: "Convierte cualquier marco estándar en un cuadro magnético inteligente para Phoenix Wall ALIGN. Soporte trasero impreso en PLA (Bambu) o vaciado en cerámica con 9 imanes D5×3mm. Incluye chip NFC IDN7645 embebido — acercar el móvil lanza la URL que tú programas (sin app). El cliente pega su foto o arte en cualquier marco, adhiere el Heartframe por detrás, y el cuadro se cuelga magnéticamente sobre la pared ALIGN.",
    magnets: "9 imanes D5×3mm + NFC incluido",
    variants: ["PLA · impresión 3D (Bambu)", "Cerámica · molde vaciado", "MDF · corte CNC"],
    badge: "Nuevo",
    img: "/products/accessories/marco-bga.jpg",
  },
  {
    name: "Kit ALIGN Upgrade",
    category: "Upgrade",
    desc: "Convierte cualquier tablero FREE en ALIGN. Estera de resina enrollable con 336 imanes N52 D5×2mm ya empotrados en cuadrícula precisa. Se encaja en el rebaje prefabricado del MDF — sin herramientas, 10-15 min/panel. Tableros FREE se fabrican ALIGN-Ready (rebaje de 3mm). Próximamente disponible.",
    sizes: ["432×822 mm/panel"],
    img: "/products/accessories/acc-detail.png",
    badge: "Próximamente",
  },
];

const TABS = ["Tamaños", "Telas y acabados", "Accesorios"];

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState(() => {
    const t = searchParams.get("tab");
    return t ? parseInt(t, 10) : 0;
  });

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t !== null) setTab(parseInt(t, 10));
  }, [searchParams]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Phoenix Wall</h1>
        <p className="text-sm text-slate-400 mt-1">Catálogo de productos · Diseño modular premium con NFC</p>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 bg-white rounded-2xl p-1.5 border border-slate-100 shadow-sm w-fit">
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
              tab === i
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab: Tamaños */}
      {tab === 0 && (
        <div className="grid grid-cols-3 gap-4">
          {SIZES.map((s) => (
            <div key={s.name} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-all duration-200 group">
              {/* Proportional panel grid */}
              <div className="mb-5 h-28 flex items-center justify-center">
                <PanelGrid wMM={s.wMM} hMM={s.hMM} cols={s.cols} rows={s.rows} />
              </div>

              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-lg font-black text-slate-900 uppercase">{s.name}</h3>
                <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full shrink-0">
                  {s.panels} panel{s.panels > 1 ? "es" : ""}
                </span>
              </div>
              <div className="text-xs font-bold text-slate-400 mb-3 font-mono">{s.dims}</div>
              <p className="text-sm text-slate-500 leading-relaxed mb-3">{s.desc}</p>
              <div className="text-[11px] text-slate-400 bg-slate-50 rounded-xl px-3 py-2">
                <span className="font-bold text-slate-600">Ideal: </span>{s.ideal}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Telas */}
      {tab === 1 && (
        <div>
          <p className="text-sm text-slate-500 mb-5">9 acabados inspirados en ciudades icónicas del mundo. Disponibles en todos los tamaños. Personalización 1:1 también disponible.</p>
          <div className="grid grid-cols-3 gap-4">
            {FABRICS.map((f) => (
              <div key={f.name} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 group">
                <div className="h-32 w-full overflow-hidden relative">
                  <Image
                    src={f.img}
                    alt={f.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-black text-slate-900 uppercase">{f.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{f.style}</p>
                </div>
              </div>
            ))}
            {/* Custom */}
            <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-6 flex flex-col items-center justify-center text-center hover:border-slate-400 transition-colors duration-200 cursor-pointer">
              <div className="text-3xl mb-2">✨</div>
              <h3 className="font-black text-slate-700 uppercase text-sm">Personalizada</h3>
              <p className="text-xs text-slate-400 mt-1">Logo, colores e imagen a medida. Sublimación digital.</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Accesorios */}
      {tab === 2 && (
        <div className="space-y-5">
          {["Marcos", "Estanterías", "Organización"].map((cat) => {
            const items = ACCESSORIES.filter((a) => a.category === cat);
            if (!items.length) return null;
            return (
              <div key={cat}>
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">{cat}</h2>
                <div className="grid grid-cols-3 gap-4">
                  {items.map((a) => (
                    <div key={a.name} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 group">
                      <div className="h-44 w-full overflow-hidden relative bg-slate-50">
                        <Image
                          src={a.img}
                          alt={a.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-black text-slate-900 uppercase">{a.name}</h3>
                          {"badge" in a && a.badge && (
                            <span className="text-[9px] font-black bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase tracking-wider">{a.badge}</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{a.desc}</p>
                        <div className="flex flex-wrap gap-1.5 mt-3 items-center">
                          {"sizes" in a && a.sizes && a.sizes.map((sz: string) => (
                            <span key={sz} className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{sz}</span>
                          ))}
                          {"capacity" in a && a.capacity && (
                            <span className="text-[10px] font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded-full">{a.capacity}</span>
                          )}
                          {"magnets" in a && a.magnets && (
                            <span className="text-[10px] font-bold bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full">🧲 {a.magnets}</span>
                          )}
                          {"price" in a && a.price && (
                            <span className="text-[10px] font-black bg-slate-900 text-white px-2 py-0.5 rounded-full ml-auto">{a.price}</span>
                          )}
                        </div>
                        {"variants" in a && a.variants && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {a.variants.map((v: string) => (
                              <span key={v} className="text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-100 px-1.5 py-0.5 rounded-md">{v}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
