import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { buscarPack, pagosActivos } from "@/lib/packs";
import { mpPreference } from "@/lib/mercadopago";

function urlBase(request) {
  return (process.env.SITE_URL || new URL(request.url).origin).replace(/\/$/, "");
}

export async function POST(request) {
  if (!pagosActivos()) {
    return NextResponse.json(
      { error: "Los packs todavía no están disponibles." },
      { status: 403 }
    );
  }

  try {
    const { packId } = (await request.json()) || {};
    const pack = buscarPack(packId);
    if (!pack) {
      return NextResponse.json({ error: "Pack inválido." }, { status: 400 });
    }

    const base = urlBase(request);
    // Referencia secreta: con ella la página de resultado recupera el código
    const referencia = randomUUID();
    const resultado = `${base}/pago/resultado?ref=${referencia}`;

    const preferencia = await mpPreference().create({
      body: {
        items: [
          {
            id: pack.id,
            title: `Papá Noel en Vivo · ${pack.nombre} (${pack.llamadas} llamadas)`,
            quantity: 1,
            unit_price: pack.precioARS,
            currency_id: "ARS",
          },
        ],
        external_reference: referencia,
        metadata: { pack_id: pack.id },
        back_urls: { success: resultado, pending: resultado, failure: resultado },
        auto_return: "approved",
        // Mercado Pago solo acepta HTTPS (no localhost)
        ...(base.startsWith("https://")
          ? { notification_url: `${base}/api/webhook-mercadopago` }
          : {}),
        statement_descriptor: "PAPA NOEL VIVO",
      },
    });

    return NextResponse.json({ url: preferencia.init_point });
  } catch (error) {
    console.error("Error creando preferencia de Mercado Pago:", error);
    return NextResponse.json(
      { error: "No pudimos iniciar el pago. Intentá de nuevo." },
      { status: 500 }
    );
  }
}
