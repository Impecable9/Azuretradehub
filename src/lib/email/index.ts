import { Resend } from "resend";
import { getRFQEmailHTML } from "./templates/rfq-invitation";
import type { RFQItem } from "@/types";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendRFQInvitation({
  to,
  rfqToken,
  buyerCompany,
  supplierName,
  items,
  expiresAt,
}: {
  to: string;
  rfqToken: string;
  buyerCompany: string;
  supplierName: string;
  items: RFQItem[];
  expiresAt: Date;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const { subject, html } = getRFQEmailHTML({
    rfqToken,
    buyerCompany,
    supplierName,
    items,
    expiresAt,
    appUrl,
  });

  const { data, error } = await resend.emails.send({
    from: "Azuretradehub <pedidos@azuretradehub.com>",
    to,
    subject,
    html,
  });

  if (error) throw new Error(`Email send failed: ${error.message}`);
  return data;
}
