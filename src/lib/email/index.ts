import { Resend } from "resend";
import { getRFQEmailHTML } from "./templates/rfq-invitation";
import { prisma } from "@/lib/db";
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

  let resendId: string | undefined;
  let status: "ok" | "failed" = "ok";

  try {
    const { data, error } = await resend.emails.send({
      from: "Azuretradehub <ops@azuretradehub.com>",
      to,
      subject,
      html,
    });

    if (error) {
      status = "failed";
      throw new Error(`Email send failed: ${error.message}`);
    }

    resendId = data?.id;
  } catch (err) {
    status = "failed";
    throw err;
  } finally {
    await prisma.emailLog.create({
      data: {
        direction: "sent",
        from: "ops@azuretradehub.com",
        to,
        subject,
        bodyHtml: html,
        status,
        resendId: resendId ?? null,
      },
    }).catch(() => {}); // no bloquear si el log falla
  }
}
