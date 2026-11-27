import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const codigo = searchParams.get("codigo")?.trim().toUpperCase();

    if (!codigo) {
      return NextResponse.json(
        { valido: false, error: "Ingresá un código para validar." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const { data: pase, error } = await supabase
      .from("pases")
      .select("codigo, pack, llamadas_restantes, duracion_segundos")
      .eq("codigo", codigo)
      .maybeSingle();

    if (error) {
      console.error("Error consultando Supabase:", error);
      return NextResponse.json(
        { valido: false, error: "No se pudo verificar el código." },
        { status: 500 }
      );
    }

    if (!pase) {
      return NextResponse.json(
        { valido: false, error: "Ese código no existe. Revisá que esté bien escrito." },
        { status: 404 }
      );
    }

    if (pase.llamadas_restantes <= 0) {
      return NextResponse.json(
        {
          valido: false,
          error: "Este código ya usó todas sus llamadas disponibles.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      valido: true,
      codigo: pase.codigo,
      pack: pase.pack,
      llamadasRestantes: pase.llamadas_restantes,
      duracionMinutos: Math.round(pase.duracion_segundos / 60),
    });
  } catch (err) {
    console.error("Error en verificar-pase:", err);
    return NextResponse.json(
      { valido: false, error: err.message || "Error interno." },
      { status: 500 }
    );
  }
}