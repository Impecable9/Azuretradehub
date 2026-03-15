import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { SupplierRFQForm } from "@/components/rfq/SupplierRFQForm";
import type { RFQItem } from "@/types";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function RFQPage({ params }: Props) {
  const { token } = await params;

  const rfq = await prisma.rFQ.findUnique({
    where: { token },
    include: {
      quote: {
        include: { organization: true },
      },
      responses: true,
    },
  });

  if (!rfq) notFound();

  const isExpired = rfq.expiresAt < new Date();
  const hasResponded = rfq.responses.length > 0;
  const items: RFQItem[] = JSON.parse(rfq.items);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 to-blue-900 text-white px-6 py-4 flex items-center justify-between">
        <div>
          <span className="text-xl font-black tracking-tight">
            Azure<span className="text-sky-400">trade</span>hub
          </span>
          <span className="ml-3 text-xs text-slate-400 uppercase tracking-widest">
            Red B2B
          </span>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-400">Solicitud de cotización</div>
          <div className="text-xs font-mono text-slate-300">#{token.slice(0, 8).toUpperCase()}</div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">

        {isExpired && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-center">
            <div className="text-2xl mb-2">⏰</div>
            <div className="font-bold text-red-800">Esta solicitud ha vencido</div>
            <div className="text-sm text-red-600 mt-1">
              El plazo de cotización ya cerró. Si quieres colaborar con nosotros, escríbenos.
            </div>
          </div>
        )}

        {!isExpired && hasResponded && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6 text-center">
            <div className="text-4xl mb-3">✅</div>
            <div className="font-bold text-green-800 text-xl">¡Cotización recibida!</div>
            <div className="text-sm text-green-600 mt-2">
              Ya hemos recibido tu respuesta. Te contactaremos si tu oferta es seleccionada.
            </div>
            <div className="mt-4 p-3 bg-green-100 rounded-lg">
              <div className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">
                🎁 Tu perfil ya está activo
              </div>
              <div className="text-sm text-green-700">
                Tu empresa aparece en el catálogo de Azuretradehub. Más compradores podrán encontrarte.
              </div>
            </div>
          </div>
        )}

        {!isExpired && !hasResponded && (
          <SupplierRFQForm
            rfqToken={token}
            buyerCompany={rfq.quote.organization.name}
            supplierName={rfq.supplierName ?? ""}
            supplierEmail={rfq.supplierEmail}
            items={items}
            expiresAt={rfq.expiresAt}
          />
        )}
      </div>
    </div>
  );
}
