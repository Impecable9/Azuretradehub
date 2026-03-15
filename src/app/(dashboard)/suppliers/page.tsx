export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";

export default async function SuppliersPage() {
  const suppliers = await prisma.supplier.findMany({
    include: { products: true, rfqResponses: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Proveedores</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {suppliers.length} proveedores en la red
          </p>
        </div>
      </div>

      {suppliers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="text-4xl mb-3">🏭</div>
          <div className="font-bold text-slate-700 mb-1">Aún no hay proveedores</div>
          <p className="text-slate-400 text-sm">
            Los proveedores se añaden automáticamente cuando responden a un RFQ.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {suppliers.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-blue-200 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-slate-900">{s.name}</h3>
                    {s.isVerified && (
                      <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
                        Verificado
                      </span>
                    )}
                    {s.claimedAt && (
                      <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">
                        Perfil activo
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-slate-500">{s.email}</div>
                  {s.phone && <div className="text-sm text-slate-400">{s.phone}</div>}
                  {s.description && (
                    <div className="text-sm text-slate-500 mt-1 line-clamp-1">{s.description}</div>
                  )}
                </div>
                <div className="text-right shrink-0 text-sm text-slate-400 space-y-1">
                  <div>{s.products.length} productos</div>
                  <div>{s.rfqResponses.length} cotizaciones</div>
                  <div className="text-xs">
                    Desde {new Date(s.createdAt).toLocaleDateString("es-ES")}
                  </div>
                </div>
              </div>

              {s.products.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                  {s.products.slice(0, 5).map((p) => (
                    <span key={p.id} className="text-xs px-2 py-1 rounded-lg bg-slate-100 text-slate-600 font-medium">
                      {p.name}
                      {p.basePrice ? ` · ${p.basePrice}€/${p.unit}` : ""}
                    </span>
                  ))}
                  {s.products.length > 5 && (
                    <span className="text-xs px-2 py-1 rounded-lg bg-slate-100 text-slate-400">
                      +{s.products.length - 5} más
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
