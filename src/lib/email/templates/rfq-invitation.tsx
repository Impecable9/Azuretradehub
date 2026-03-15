import type { RFQItem } from "@/types";

interface RFQEmailProps {
  rfqToken: string;
  buyerCompany: string;
  supplierName: string;
  items: RFQItem[];
  expiresAt: Date;
  appUrl: string;
}

export function getRFQEmailHTML({
  rfqToken,
  buyerCompany,
  supplierName,
  items,
  expiresAt,
  appUrl,
}: RFQEmailProps): { subject: string; html: string } {
  const rfqUrl = `${appUrl}/rfq/${rfqToken}`;
  const expiryStr = expiresAt.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const itemsList = items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;">
            <span style="font-size:12px;font-weight:600;color:${item.type === "BOM" ? "#2563eb" : "#7c3aed"};background:${item.type === "BOM" ? "#eff6ff" : "#f5f3ff"};padding:2px 6px;border-radius:4px;">${item.type}</span>
          </td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;font-weight:500;">${item.description}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;color:#6b7280;">${item.quantity} ${item.unit}</td>
        </tr>`
    )
    .join("");

  const subject = `Pedido de ${buyerCompany} esperando tu precio — vence el ${expiryStr}`;

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%);padding:32px 24px;text-align:center;">
    <div style="font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.5px;">
      Azure<span style="color:#38bdf8;">trade</span>hub
    </div>
    <div style="font-size:12px;color:#94a3b8;margin-top:4px;letter-spacing:1px;text-transform:uppercase;">
      Red de compras B2B
    </div>
  </div>

  <!-- Hero -->
  <div style="background:#fff;border-bottom:3px solid #0ea5e9;padding:32px 24px;text-align:center;">
    <div style="font-size:13px;font-weight:600;color:#0ea5e9;letter-spacing:1px;text-transform:uppercase;margin-bottom:12px;">
      Solicitud de cotización
    </div>
    <h1 style="margin:0 0 12px;font-size:26px;font-weight:800;color:#0f172a;line-height:1.2;">
      <strong>${buyerCompany}</strong> necesita<br>tu precio ahora
    </h1>
    <p style="margin:0;font-size:16px;color:#64748b;">
      Hola ${supplierName} — eres uno de los <strong>3 proveedores</strong> que hemos contactado.<br>
      El que responda primero tiene ventaja.
    </p>
  </div>

  <!-- Content -->
  <div style="max-width:560px;margin:24px auto;padding:0 16px;">

    <!-- What they need -->
    <div style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);margin-bottom:16px;">
      <div style="padding:16px 20px;background:#f8fafc;border-bottom:1px solid #e2e8f0;">
        <span style="font-size:13px;font-weight:700;color:#0f172a;text-transform:uppercase;letter-spacing:0.5px;">
          📦 Lo que necesitan
        </span>
      </div>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:#f8fafc;">
            <th style="padding:8px 12px;text-align:left;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;">Tipo</th>
            <th style="padding:8px 12px;text-align:left;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;">Descripción</th>
            <th style="padding:8px 12px;text-align:left;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;">Cantidad</th>
          </tr>
        </thead>
        <tbody>
          ${itemsList}
        </tbody>
      </table>
    </div>

    <!-- Urgency -->
    <div style="background:linear-gradient(135deg,#fef3c7,#fde68a);border-radius:12px;padding:16px 20px;margin-bottom:16px;display:flex;align-items:center;">
      <span style="font-size:24px;margin-right:12px;">⏱️</span>
      <div>
        <div style="font-size:13px;font-weight:700;color:#92400e;">Plazo de respuesta</div>
        <div style="font-size:15px;font-weight:800;color:#78350f;">Vence el ${expiryStr}</div>
      </div>
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin:28px 0;">
      <a href="${rfqUrl}" style="display:inline-block;background:linear-gradient(135deg,#0ea5e9,#2563eb);color:#fff;text-decoration:none;font-size:17px;font-weight:700;padding:16px 40px;border-radius:10px;letter-spacing:-0.3px;">
        Ver pedido y cotizar →
      </a>
      <div style="margin-top:10px;font-size:12px;color:#94a3b8;">
        Sin registro · Sin contraseña · Solo precio y disponibilidad
      </div>
    </div>

    <!-- Profile teaser -->
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
      <div style="font-size:13px;font-weight:700;color:#166534;margin-bottom:4px;">
        🎁 Tu perfil queda activo gratis
      </div>
      <div style="font-size:13px;color:#15803d;line-height:1.5;">
        Al cotizar, tu empresa aparece automáticamente en el catálogo de Azuretradehub. Más de <strong>50 compradores</strong> buscan proveedores como tú cada semana — sin que tengas que hacer nada más.
      </div>
    </div>

    <!-- Social proof -->
    <div style="text-align:center;padding:16px;border-top:1px solid #e2e8f0;">
      <div style="font-size:12px;color:#94a3b8;">
        Tu competencia ya está en la red. <a href="${appUrl}" style="color:#0ea5e9;text-decoration:none;font-weight:600;">Ver plataforma →</a>
      </div>
    </div>

  </div>

  <!-- Footer -->
  <div style="text-align:center;padding:20px;font-size:11px;color:#cbd5e1;">
    Azuretradehub · Red B2B de materiales y servicios<br>
    Recibes este email porque un comprador ha solicitado tu cotización.<br>
    <a href="${rfqUrl}?unsubscribe=1" style="color:#94a3b8;">No quiero recibir más solicitudes</a>
  </div>

</body>
</html>`;

  return { subject, html };
}
