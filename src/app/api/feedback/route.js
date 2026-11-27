import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(request) {
  try {
    const body = (await request.json()) || {};
    const puntaje = Number(body.puntaje);
    if (!Number.isInteger(puntaje) || puntaje < 1 || puntaje > 5) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const edad = Number(body.edad);
    const fila = {
      puntaje,
      comentario:
        typeof body.comentario === "string" && body.comentario.trim()
          ? body.comentario.trim().slice(0, 400)
          : null,
      permite_testimonio: body.permiteTestimonio === true,
      edad: Number.isInteger(edad) && edad > 0 && edad < 100 ? edad : null,
      acento: ["argentino", "neutro"].includes(body.acento) ? body.acento : null,
      con_codigo: body.conCodigo === true,
    };

    const { error } = await getSupabaseAdmin().from("feedback").insert(fila);
    if (error) {
      console.error("Error guardando feedback:", error);
      return NextResponse.json({ ok: false }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error en feedback:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
