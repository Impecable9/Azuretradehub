export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { QuotesList } from "@/components/quotes/QuotesList";

const ORG_ID = process.env.OWNER_ORG_ID ?? "seed-org-id";

export default async function QuotesPage() {
  const quotes = await prisma.quote.findMany({
    where: { organizationId: ORG_ID },
    include: { lines: { select: { unitCost: true } }, rfqs: { select: { status: true } } },
    orderBy: { createdAt: "desc" },
  });

  return <QuotesList quotes={quotes} />;
}
