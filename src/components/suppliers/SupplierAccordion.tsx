"use client";

import { useState } from "react";
import { ChevronDown, ExternalLink, Package, Star } from "lucide-react";

type Product = {
  id: string;
  name: string;
  basePrice: number | null;
  unit: string | null;
  description: string | null;
};

type Supplier = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  description: string | null;
  isVerified: boolean;
  claimedAt: Date | null;
  products: Product[];
  rfqResponses: { id: string }[];
};

type Category = {
  label: string;
  color: string;
  bg: string;
  dot: string;
  suppliers: Supplier[];
};

function categorize(suppliers: Supplier[]): Category[] {
  const categories: { label: string; color: string; bg: string; dot: string; keywords: string[] }[] = [
    { label: "Madera / Tableros",   color: "text-amber-700",  bg: "bg-amber-50",  dot: "bg-amber-400",  keywords: ["mdf", "madera", "tablero", "tosize", "menur", "tosi"] },
    { label: "Metal / Chapa",       color: "text-slate-700",  bg: "bg-slate-100", dot: "bg-slate-400",  keywords: ["acero", "chapa", "hierros", "metal", "inox", "manzano", "bricometal"] },
    { label: "Perfilería SEG",      color: "text-blue-700",   bg: "bg-blue-50",   dot: "bg-blue-400",   keywords: ["seg", "perfil", "silicona", "texfix", "texframe", "depapel", "impretienda", "ecotex"] },
    { label: "Textil / Impresión",  color: "text-purple-700", bg: "bg-purple-50", dot: "bg-purple-400", keywords: ["tela", "textil", "sublimación", "impresión", "imprenta"] },
    { label: "Imanes / Neodimio",   color: "text-cyan-700",   bg: "bg-cyan-50",   dot: "bg-cyan-400",   keywords: ["imán", "iman", "neodimio", "magnet", "zetar", "wendy"] },
    { label: "Electrónica / NFC",   color: "text-green-700",  bg: "bg-green-50",  dot: "bg-green-400",  keywords: ["nfc", "chip", "ntag", "shopnfc", "rfid", "idrfid"] },
    { label: "Adhesivos / Otros",   color: "text-rose-700",   bg: "bg-rose-50",   dot: "bg-rose-400",   keywords: ["epoxy", "epoxi", "adhesivo", "cristal", "vidrio", "marco", "enmarcado"] },
  ];

  const assigned = new Set<string>();
  const result: Category[] = [];

  for (const cat of categories) {
    const matched = suppliers.filter((s) => {
      if (assigned.has(s.id)) return false;
      const text = `${s.name} ${s.description ?? ""} ${s.products.map((p) => p.name).join(" ")}`.toLowerCase();
      return cat.keywords.some((kw) => text.includes(kw));
    });
    if (matched.length > 0) {
      matched.forEach((s) => assigned.add(s.id));
      result.push({ ...cat, suppliers: matched });
    }
  }

  // Uncategorized
  const rest = suppliers.filter((s) => !assigned.has(s.id));
  if (rest.length > 0) {
    result.push({ label: "Otros", color: "text-slate-600", bg: "bg-slate-50", dot: "bg-slate-300", suppliers: rest });
  }

  return result;
}

const NATIONAL_KEYWORDS = ["málaga", "malaga", "marbella", "españa", "spain", "es", "madrid", "barcelona", "valencia", "sevilla", ".es"];
const INTERNATIONAL_KEYWORDS = ["aliexpress", "china", "amazon", "bricometal", "tosize", "shopnfc", "online", ".com", ".nl", ".de"];

function isNational(s: Supplier) {
  const text = `${s.name} ${s.description ?? ""} ${s.website ?? ""} ${s.email ?? ""}`.toLowerCase();
  return NATIONAL_KEYWORDS.some((k) => text.includes(k));
}

export function SupplierAccordion({ suppliers }: { suppliers: Supplier[] }) {
  const [filter, setFilter] = useState<"all" | "nacional" | "internacional">("all");
  const filtered = suppliers.filter((s) => {
    if (filter === "nacional") return isNational(s);
    if (filter === "internacional") return !isNational(s);
    return true;
  });
  const categories = categorize(filtered);
  const [open, setOpen] = useState<Set<string>>(new Set(categories.map((c) => c.label)));

  if (suppliers.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
        <div className="text-4xl mb-3">🏭</div>
        <div className="font-bold text-slate-700 mb-1">Aún no hay proveedores</div>
        <p className="text-slate-400 text-sm">Los proveedores se añaden automáticamente cuando responden a un RFQ.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex items-center gap-2">
        {(["all", "nacional", "internacional"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 ${
              filter === f ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-500 hover:text-slate-800"
            }`}
          >
            {f === "all" ? `Todos (${suppliers.length})` : f === "nacional" ? `🇪🇸 Nacional` : `🌍 Internacional`}
          </button>
        ))}
      </div>
      <div className="space-y-2">
      {categories.map((cat) => {
        const isOpen = open.has(cat.label);
        const totalProducts = cat.suppliers.reduce((a, s) => a + s.products.length, 0);

        return (
          <div key={cat.label} className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all">
            {/* Category header */}
            <button
              onClick={() => {
                const next = new Set(open);
                if (next.has(cat.label)) next.delete(cat.label);
                else next.add(cat.label);
                setOpen(next);
              }}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className={`w-2.5 h-2.5 rounded-full ${cat.dot}`} />
                <span className="font-bold text-slate-800">{cat.label}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cat.bg} ${cat.color}`}>
                  {cat.suppliers.length} proveedor{cat.suppliers.length !== 1 ? "es" : ""}
                </span>
                {totalProducts > 0 && (
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    {totalProducts} producto{totalProducts !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Suppliers list */}
            {isOpen && (
              <div className="border-t border-slate-100 divide-y divide-slate-100">
                {cat.suppliers.map((s) => (
                  <div key={s.id} className="px-5 py-4 hover:bg-slate-50/60 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-slate-800">{s.name}</span>
                          {s.isVerified && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                          {s.claimedAt && (
                            <span className="text-xs bg-green-100 text-green-700 font-medium px-1.5 py-0.5 rounded-md">Activo</span>
                          )}
                          {isNational(s)
                            ? <span className="text-xs bg-blue-50 text-blue-600 font-medium px-1.5 py-0.5 rounded-md">🇪🇸 Recogida</span>
                            : <span className="text-xs bg-orange-50 text-orange-600 font-medium px-1.5 py-0.5 rounded-md">🚚 + Transporte</span>
                          }
                        </div>
                        {s.description && (
                          <p className="text-sm text-slate-500 line-clamp-2 mb-2">{s.description}</p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          {s.email && <span>{s.email}</span>}
                          {s.phone && <span>{s.phone}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {s.rfqResponses.length > 0 && (
                          <span className="text-xs bg-blue-50 text-blue-700 font-medium px-2 py-1 rounded-lg">
                            {s.rfqResponses.length} RFQ
                          </span>
                        )}
                        {s.website && (
                          <a
                            href={s.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-blue-600 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Products table */}
                    {s.products.length > 0 && (
                      <div className="mt-3 rounded-xl border border-slate-100 overflow-hidden">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                              <th className="text-left px-3 py-2 font-semibold text-slate-500">Producto</th>
                              <th className="text-right px-3 py-2 font-semibold text-slate-500">Precio</th>
                              <th className="text-left px-3 py-2 font-semibold text-slate-500">Unidad</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {s.products.map((p) => (
                              <tr key={p.id} className="hover:bg-slate-50">
                                <td className="px-3 py-2 text-slate-700 font-medium">{p.name}</td>
                                <td className="px-3 py-2 text-right tabular-nums font-bold text-slate-900">
                                  {p.basePrice != null ? `${p.basePrice.toFixed(2)} €` : <span className="text-amber-500 font-normal">Sin precio</span>}
                                </td>
                                <td className="px-3 py-2 text-slate-400">{p.unit ?? "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
    </div>
  );
}
