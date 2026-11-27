import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

// ⚙️ AJUSTÁ TUS LÍMITES ACÁ CUANDO QUIERAS:
const MAX_LLAMADAS_POR_DISPOSITIVO = 2; // Llamadas gratis por celular/navegador
const MAX_LLAMADAS_POR_IP_DIARIO = 6; // Freno anti-incógnito (permite 4G compartido)
const DURACION_MAXIMA_SEGUNDOS = 90; // 90 seg = 1 min 30 seg por llamada
const TOPE_DIARIO_LLAMADAS = 15; // Ajustado para que el plan Starter rinda varios días

function obtenerInicioHoyArgentinaISO() {
  const ahora = new Date();
  const ahoraArg = new Date(ahora.getTime() - 3 * 60 * 60 * 1000);
  ahoraArg.setUTCHours(0, 0, 0, 0);
  return new Date(ahoraArg.getTime() + 3 * 60 * 60 * 1000).toISOString();
}

async function pedirUrlFirmada(apiKey, agentId) {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${agentId}`,
    {
      method: "GET",
      headers: { "xi-api-key": apiKey },
      cache: "no-store",
    }
  );
  if (!response.ok) {
    console.error("Error ElevenLabs:", await response.text());
    return null;
  }
  const data = await response.json();
  return data.signed_url || null;
}

// Llamada con un código de pase pago: descuenta una llamada del pase
async function iniciarConPase(supabase, codigo, apiKey, agentId) {
  const { data, error } = await supabase.rpc("usar_pase", { p_codigo: codigo });
  const pase = Array.isArray(data) ? data[0] : data;

  if (error) {
    console.error("Error usando pase:", error);
    return NextResponse.json(
      { error: "No pudimos validar tu código. Intentá de nuevo." },
      { status: 500 }
    );
  }
  if (!pase) {
    return NextResponse.json(
      {
        error: "Ese código no existe o ya usó todas sus llamadas.",
        codigo: "PASE_INVALIDO",
      },
      { status: 403 }
    );
  }

  const signedUrl = await pedirUrlFirmada(apiKey, agentId);
  if (!signedUrl) {
    // Devolvemos la llamada al pase
    await supabase.rpc("devolver_pase", { p_codigo: codigo });
    return NextResponse.json(
      { error: "No se pudo conectar con el Polo Norte en este momento." },
      { status: 502 }
    );
  }

  return NextResponse.json({
    signedUrl,
    duracionMaximaSegundos: Math.min(pase.duracion_segundos || 90, 95),
    llamadasRestantes: pase.llamadas_restantes,
  });
}

export async function POST(request) {
  let reservaId = null;
  const supabase = getSupabaseAdmin();

  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const agentId = process.env.ELEVENLABS_AGENT_ID;

    if (!apiKey || !agentId) {
      return NextResponse.json(
        { error: "Error de configuración del servidor." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { nombre, edad, deviceId, codigo } = body || {};

    if (!nombre || !edad) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios del chico." },
        { status: 400 }
      );
    }

    if (typeof codigo === "string" && codigo.trim()) {
      return await iniciarConPase(
        supabase,
        codigo.trim().toUpperCase().slice(0, 20),
        apiKey,
        agentId
      );
    }

    const ipCliente =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    const idDispositivo =
      typeof deviceId === "string" && deviceId.trim().length > 0
        ? deviceId.trim().slice(0, 64)
        : `sin-id-${ipCliente}`;

    const inicioHoyISO = obtenerInicioHoyArgentinaISO();

    // 1. Reserva atómica en Supabase (si falla, se bloquea la llamada)
    const { data: reserva, error: errReserva } = await supabase.rpc(
      "reservar_llamada_gratis",
      {
        p_ip: ipCliente,
        p_device_id: idDispositivo,
        p_inicio_hoy: inicioHoyISO,
        p_tope_diario: TOPE_DIARIO_LLAMADAS,
        p_max_dispositivo: MAX_LLAMADAS_POR_DISPOSITIVO,
        p_max_ip_diario: MAX_LLAMADAS_POR_IP_DIARIO,
      }
    );

    if (errReserva || !reserva) {
      console.error("Error en reserva atómica:", errReserva);
      return NextResponse.json(
        { error: "No pudimos conectar con el Polo Norte. Intentá de nuevo." },
        { status: 500 }
      );
    }

    if (reserva.status === "TOPE_DIARIO") {
      return NextResponse.json(
        {
          error:
            "¡Papá Noel está muy ocupado envolviendo regalos ahora mismo! Se agotaron los cupos gratuitos de hoy.",
          codigo: "SIN_CUPO",
        },
        { status: 429 }
      );
    }

    if (reserva.status === "MAX_DISPOSITIVO") {
      return NextResponse.json(
        {
          error: `Ya usaste tus ${MAX_LLAMADAS_POR_DISPOSITIVO} llamadas gratuitas con Papá Noel. ¡Gracias por probar la magia del Polo Norte!`,
          codigo: "LIMITE_GRATIS",
        },
        { status: 403 }
      );
    }

    if (reserva.status === "MAX_IP") {
      return NextResponse.json(
        {
          error:
            "Se alcanzó el límite de llamadas desde esta red por hoy. Probá mañana nuevamente.",
          codigo: "SIN_CUPO",
        },
        { status: 429 }
      );
    }

    reservaId = reserva.id;

    // 2. Pedir URL firmada a ElevenLabs
    const signedUrl = await pedirUrlFirmada(apiKey, agentId);

    if (!signedUrl) {
      // Si ElevenLabs falló, devolvemos el cupo reservado
      await supabase.from("llamadas_gratis").delete().eq("id", reservaId);
      return NextResponse.json(
        { error: "No se pudo conectar con el Polo Norte en este momento." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      signedUrl,
      duracionMaximaSegundos: DURACION_MAXIMA_SEGUNDOS,
    });
  } catch (error) {
    console.error("Error interno en iniciar-sesion:", error);
    if (reservaId) {
      await supabase.from("llamadas_gratis").delete().eq("id", reservaId);
    }
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}