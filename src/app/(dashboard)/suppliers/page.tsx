export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { SupplierAccordion } from "@/components/suppliers/SupplierAccordion";

export default async function SuppliersPage() {
  const suppliers = await prisma.supplier.findMany({
    include: { products: true, rfqResponses: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Proveedores</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {suppliers.length} proveedores · organizados por categoría de producto
          </p>
        </div>
      </div>
      <SupplierAccordion suppliers={suppliers} />
    </div>
  );
}
