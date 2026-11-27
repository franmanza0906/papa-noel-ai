import { randomInt } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase";
import { mpPayment } from "@/lib/mercadopago";
import { buscarPack, DURACION_LLAMADA_PAGA_SEGUNDOS } from "@/lib/packs";

// Sin letras que se confunden (0/O, 1/I/L)
const ALFABETO = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function generarCodigo() {
  const bloque = () =>
    Array.from({ length: 4 }, () => ALFABETO[randomInt(ALFABETO.length)]).join("");
  return `NOEL-${bloque()}-${bloque()}`;
}

/**
 * Consulta el pago en Mercado Pago (nunca confiamos en lo que llega por la URL o
 * el webhook) y, si está aprobado, crea el pase. Es idempotente: si ese pago ya
 * generó un pase, devuelve el mismo.
 */
export async function procesarPago(paymentId) {
  const pago = await mpPayment().get({ id: String(paymentId) });

  if (pago.status !== "approved") {
    return { estado: pago.status || "desconocido", referencia: pago.external_reference };
  }

  const pack = buscarPack(pago.metadata?.pack_id);
  if (!pack) {
    console.error("Pago aprobado con pack desconocido:", pago.id, pago.metadata);
    return { estado: "pack_invalido", referencia: pago.external_reference };
  }

  const supabase = getSupabaseAdmin();

  const { data: existente } = await supabase
    .from("pases")
    .select("codigo, llamadas_restantes")
    .eq("payment_id", String(pago.id))
    .maybeSingle();

  if (existente) {
    return { estado: "approved", referencia: pago.external_reference, pase: existente };
  }

  // Reintenta si por casualidad el código ya existe
  for (let intento = 0; intento < 3; intento++) {
    const nuevo = {
      codigo: generarCodigo(),
      pack: pack.id,
      llamadas_restantes: pack.llamadas,
      duracion_segundos: DURACION_LLAMADA_PAGA_SEGUNDOS,
      payment_id: String(pago.id),
      external_reference: pago.external_reference || null,
      monto: pago.transaction_amount ?? null,
    };
    const { data, error } = await supabase
      .from("pases")
      .insert(nuevo)
      .select("codigo, llamadas_restantes")
      .single();

    if (!error) {
      return { estado: "approved", referencia: pago.external_reference, pase: data };
    }

    // 23505 = clave duplicada. Si chocó payment_id, otro proceso lo creó primero.
    if (error.code === "23505") {
      const { data: otro } = await supabase
        .from("pases")
        .select("codigo, llamadas_restantes")
        .eq("payment_id", String(pago.id))
        .maybeSingle();
      if (otro) {
        return { estado: "approved", referencia: pago.external_reference, pase: otro };
      }
      continue; // chocó el código: probamos otro
    }

    throw error;
  }

  throw new Error("No se pudo generar un código único.");
}
