"use client";

import { useState } from "react";
import type { RFQItem, RFQResponseItem } from "@/types";

interface Props {
  rfqToken: string;
  buyerCompany: string;
  supplierName: string;
  supplierEmail: string;
  items: RFQItem[];
  expiresAt: Date;
}

export function SupplierRFQForm({
  rfqToken,
  buyerCompany,
  supplierName,
  supplierEmail,
  items,
  expiresAt,
}: Props) {
  const [responseItems, setResponseItems] = useState<RFQResponseItem[]>(
    items.map((item) => ({ ...item, unitPrice: 0, leadTimeDays: 1 }))
  );
  const [supplierData, setSupplierData] = useState({
    name: supplierName,
    email: supplierEmail,
    phone: "",
    notes: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const expiryStr = new Date(expiresAt).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const daysLeft = Math.ceil(
    (new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const total = responseItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  function updateItem(index: number, field: keyof RFQResponseItem, value: number | string) {
    setResponseItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/rfq/${rfqToken}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: responseItems,
          totalPrice: total,
          supplierName: supplierData.name,
          supplierEmail: supplierData.email,
          supplierPhone: supplierData.phone,
          notes: supplierData.notes,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Error al enviar");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">
          ¡Cotización enviada!
        </h2>
        <p className="text-slate-500 mb-6">
          {buyerCompany} recibirá tu oferta ahora mismo.
        </p>
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-left max-w-md mx-auto">
          <div className="font-bold text-green-800 mb-2 flex items-center gap-2">
            <span>🎁</span> Tu perfil ya está activo en Azuretradehub
          </div>
          <p className="text-sm text-green-700 leading-relaxed">
            Compradores de toda la red pueden encontrarte ahora mismo.{" "}
            <strong>Sin coste, sin trámites.</strong> Si quieres añadir tu catálogo
            completo y recibir más pedidos, te enviamos el acceso.
          </p>
          <div className="mt-3 p-3 bg-white rounded-lg border border-green-200">
            <div className="text-xs text-green-600 font-semibold uppercase tracking-wide">
              Tu resumen de oferta
            </div>
            {responseItems.map((item, i) => (
              <div key={i} className="flex justify-between text-sm py-1 border-b border-green-100 last:border-0">
                <span className="text-slate-700">{item.description} × {item.quantity} {item.unit}</span>
                <span className="font-semibold text-slate-900">
                  {(item.unitPrice * item.quantity).toFixed(2)} €
                </span>
              </div>
            ))}
            <div className="flex justify-between font-bold text-base pt-2">
              <span>Total</span>
              <span className="text-green-700">{total.toFixed(2)} €</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Hero */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 text-white">
          <div className="text-sm font-semibold uppercase tracking-widest text-blue-200 mb-1">
            Solicitud de cotización
          </div>
          <h1 className="text-2xl font-black leading-tight">
            {buyerCompany} necesita<br />tu precio
          </h1>
          <p className="text-blue-100 text-sm mt-2">
            Eres uno de <strong>3 proveedores</strong> contactados. El más rápido tiene ventaja.
          </p>
        </div>

        {/* Urgency bar */}
        <div className={`px-6 py-3 flex items-center gap-3 ${daysLeft <= 1 ? "bg-red-50 border-b border-red-100" : "bg-amber-50 border-b border-amber-100"}`}>
          <span className="text-lg">{daysLeft <= 1 ? "🔴" : "⏱️"}</span>
          <div>
            <span className="font-bold text-slate-800 text-sm">
              {daysLeft <= 1 ? "¡Vence hoy!" : `${daysLeft} días para responder`}
            </span>
            <span className="text-slate-500 text-xs ml-2">Cierra el {expiryStr}</span>
          </div>
        </div>

        {/* Items table */}
        <div className="px-6 py-5">
          <div className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-4">
            Lo que necesitan
          </div>
          <div className="space-y-3">
            {responseItems.map((item, i) => (
              <div
                key={i}
                className="border border-slate-200 rounded-xl p-4 bg-slate-50"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full mr-2 ${
                      item.type === "BOM"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-purple-100 text-purple-700"
                    }`}>
                      {item.type}
                    </span>
                    <span className="font-semibold text-slate-800">{item.description}</span>
                  </div>
                  <span className="text-sm text-slate-500 whitespace-nowrap">
                    {item.quantity} {item.unit}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-500 font-medium block mb-1">
                      Precio por {item.unit} (€)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={item.unitPrice || ""}
                      onChange={(e) => updateItem(i, "unitPrice", parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 font-medium block mb-1">
                      Plazo de entrega (días)
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={item.leadTimeDays || ""}
                      onChange={(e) => updateItem(i, "leadTimeDays", parseInt(e.target.value) || 1)}
                      placeholder="7"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                </div>
                {item.unitPrice > 0 && (
                  <div className="mt-2 text-right text-sm">
                    <span className="text-slate-500">Subtotal: </span>
                    <span className="font-bold text-slate-800">
                      {(item.unitPrice * item.quantity).toFixed(2)} €
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Total */}
          {total > 0 && (
            <div className="mt-4 bg-blue-50 rounded-xl px-4 py-3 flex justify-between items-center">
              <span className="font-semibold text-blue-900">Total de tu oferta</span>
              <span className="text-2xl font-black text-blue-700">{total.toFixed(2)} €</span>
            </div>
          )}
        </div>
      </div>

      {/* Supplier data */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-6 py-5">
        <div className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-4">
          Tus datos de contacto
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Empresa o nombre</label>
            <input
              type="text"
              required
              value={supplierData.name}
              onChange={(e) => setSupplierData((s) => ({ ...s, name: e.target.value }))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tu empresa S.L."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Email</label>
              <input
                type="email"
                required
                value={supplierData.email}
                onChange={(e) => setSupplierData((s) => ({ ...s, email: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Teléfono (opcional)</label>
              <input
                type="tel"
                value={supplierData.phone}
                onChange={(e) => setSupplierData((s) => ({ ...s, phone: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+34 600 000 000"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">
              Notas adicionales <span className="text-slate-400 font-normal">(opcional)</span>
            </label>
            <textarea
              value={supplierData.notes}
              onChange={(e) => setSupplierData((s) => ({ ...s, notes: e.target.value }))}
              rows={2}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Condiciones, mínimos de pedido, descuentos por volumen..."
            />
          </div>
        </div>
      </div>

      {/* Profile teaser */}
      <div className="bg-green-50 border border-green-200 rounded-2xl px-6 py-4 flex gap-3">
        <span className="text-2xl">🎁</span>
        <div>
          <div className="font-bold text-green-800 text-sm">Perfil gratuito incluido</div>
          <div className="text-xs text-green-700 mt-0.5 leading-relaxed">
            Al cotizar, tu empresa aparece automáticamente en el catálogo de Azuretradehub.
            Sin registro. Sin coste. Más compradores te encontrarán.
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || total === 0}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl text-lg transition-all shadow-lg shadow-blue-200"
      >
        {loading ? "Enviando..." : "Enviar cotización →"}
      </button>

      <p className="text-center text-xs text-slate-400">
        Tu oferta llega directamente al equipo de compras de {buyerCompany}
      </p>
    </form>
  );
}
