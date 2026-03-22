"use client";

import { useState } from "react";
import Image from "next/image";

const SIZES = [
  {
    name: "Brilliant",
    dims: "442 × 832 mm",
    panels: 1,
    desc: "El más pequeño de la colección. Ideal para espacios reducidos, rincones especiales o como primer paso.",
    ideal: "Recibidores, habitaciones, despachos",
  },
  {
    name: "Joy",
    dims: "832 × 832 mm",
    panels: 2,
    desc: "Compacto pero impactante. Convierte una esquina olvidada en un punto de expresión visual.",
    ideal: "Cafeterías, recibidores, zonas de paso",
  },
  {
    name: "Abundant",
    dims: "1222 × 832 mm",
    panels: 3,
    desc: "Equilibra funcionalidad y diseño visual. Proporción perfecta para storytelling sin dominar la pared.",
    ideal: "Salones, oficinas, escaparates",
  },
  {
    name: "Nova",
    dims: "1222 × 1612 mm",
    panels: 6,
    desc: "Versátil y envolvente. Formato vertical que se convierte en centro de atención en zonas amplias.",
    ideal: "Cafeterías, coworkings, galerías",
  },
  {
    name: "Luna",
    dims: "1612 × 2002 mm",
    panels: 8,
    desc: "Experiencia visual inmersiva. Composiciones emocionales, narrativas o producto en exposición.",
    ideal: "Hoteles boutique, showrooms, áreas VIP",
  },
  {
    name: "Gea",
    dims: "2002 × 2392 mm",
    panels: 12,
    desc: "Mural con alma. Instalación escenográfica donde cada cuadro es una historia conectada.",
    ideal: "Vestíbulos hotel, tiendas flagship, exposiciones",
  },
];

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
    desc: "Madera de roble fino con paspartú blanco",
    sizes: ["15×15 cm", "20×20 cm"],
    img: "/products/accessories/marco-roble.jpg",
  },
  {
    name: "Marco BGA Classic",
    category: "Marcos",
    desc: "Madera de roble Classic con paspartú blanco",
    sizes: ["20×20 cm"],
    img: "/products/accessories/marco-bga.jpg",
  },
  {
    name: "The Craw",
    category: "Estanterías",
    desc: "Sostiene bloc A4 y elementos decorativos ligeros. Ideal para listas, calendarios o relojes.",
    capacity: "hasta 0.6 kg",
    img: "/products/accessories/the-craw.jpg",
  },
  {
    name: "The Wing",
    category: "Estanterías",
    desc: "Perfecto para libros, relojes y plantas. Diseño funcional y decorativo.",
    capacity: "hasta 3 kg",
    img: "/products/accessories/the-wing.jpg",
  },
  {
    name: "The Nest",
    category: "Estanterías",
    desc: "Para objetos ligeros como lapiceros o suculentas.",
    capacity: "hasta 1.4 kg",
    img: "/products/accessories/the-nest-shelf.jpg",
  },
  {
    name: "The Pins",
    category: "Organización",
    desc: "Para guardar documentos y recuerdos. Combina organización y estilo.",
    img: "/products/accessories/the-pins.jpg",
  },
];

const TABS = ["Tamaños", "Telas y acabados", "Accesorios"];

export default function ProductsPage() {
  const [tab, setTab] = useState(0);

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
              {/* Panel visualizer */}
              <div className="flex gap-1 mb-5 h-16 items-end">
                {Array.from({ length: Math.min(s.panels, 4) }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-lg bg-slate-800 group-hover:bg-slate-700 transition-colors duration-200"
                    style={{ height: `${60 + (i % 2 === 0 ? 0 : -10)}%` }}
                  />
                ))}
                {s.panels > 4 && (
                  <div className="flex gap-1 flex-1">
                    {Array.from({ length: s.panels - 4 }).map((_, i) => (
                      <div key={i} className="flex-1 rounded-md bg-slate-600 h-8" />
                    ))}
                  </div>
                )}
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
                        <h3 className="font-black text-slate-900 uppercase">{a.name}</h3>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{a.desc}</p>
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {"sizes" in a && a.sizes && a.sizes.map((sz: string) => (
                            <span key={sz} className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{sz}</span>
                          ))}
                          {"capacity" in a && a.capacity && (
                            <span className="text-[10px] font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded-full">{a.capacity}</span>
                          )}
                        </div>
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
