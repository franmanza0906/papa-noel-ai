import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { procesarPago } from "@/lib/pases";

// La página de resultado llama acá con la referencia secreta del pago.
// Si Mercado Pago también mandó payment_id, lo procesamos por si el webhook
// todavía no llegó.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const referencia = searchParams.get("ref")?.trim();
  const paymentId = searchParams.get("payment_id")?.trim();

  if (!referencia || !/^[0-9a-f-]{36}$/i.test(referencia)) {
    return NextResponse.json({ estado: "invalido" }, { status: 400 });
  }

  try {
    if (paymentId && /^\d+$/.test(paymentId)) {
      const resultado = await procesarPago(paymentId);
      if (resultado.referencia && resultado.referencia !== referencia) {
        return NextResponse.json({ estado: "invalido" }, { status: 400 });
      }
      if (resultado.pase) {
        return NextResponse.json({ estado: "approved", ...resultado.pase });
      }
      if (resultado.estado !== "approved") {
        return NextResponse.json({ estado: resultado.estado });
      }
    }

    const { data: pase } = await getSupabaseAdmin()
      .from("pases")
      .select("codigo, llamadas_restantes")
      .eq("external_reference", referencia)
      .maybeSingle();

    if (pase) {
      return NextResponse.json({ estado: "approved", ...pase });
    }
    return NextResponse.json({ estado: "pending" });
  } catch (error) {
    console.error("Error consultando estado del pago:", error);
    return NextResponse.json({ estado: "error" }, { status: 500 });
  }
}
