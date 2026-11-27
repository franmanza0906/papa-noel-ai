import { NextResponse } from "next/server";
import { WebhookSignatureValidator } from "mercadopago";
import { procesarPago } from "@/lib/pases";

export async function POST(request) {
  const url = new URL(request.url);
  let body = {};
  try {
    body = await request.json();
  } catch {
    // Algunas notificaciones llegan sin cuerpo; usamos la query
  }

  const tipo = body?.type || url.searchParams.get("type") || url.searchParams.get("topic");
  const dataId = body?.data?.id || url.searchParams.get("data.id") || url.searchParams.get("id");

  // Validamos la firma si está configurada la clave secreta del webhook
  const secreto = process.env.MP_WEBHOOK_SECRET;
  if (secreto) {
    try {
      WebhookSignatureValidator.validate({
        xSignature: request.headers.get("x-signature"),
        xRequestId: request.headers.get("x-request-id"),
        dataId: url.searchParams.get("data.id") ?? dataId,
        secret: secreto,
      });
    } catch (error) {
      console.warn("Webhook de Mercado Pago con firma inválida:", error?.reason);
      return NextResponse.json({ ok: false }, { status: 401 });
    }
  }

  if (tipo !== "payment" || !dataId) {
    return NextResponse.json({ ok: true, ignorado: true });
  }

  try {
    // Igual consultamos el pago a Mercado Pago: la notificación solo trae el id
    const resultado = await procesarPago(dataId);
    return NextResponse.json({ ok: true, estado: resultado.estado });
  } catch (error) {
    console.error("Error procesando webhook de Mercado Pago:", error);
    // 500 para que Mercado Pago reintente más tarde
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
