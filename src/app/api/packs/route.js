import { connection, NextResponse } from "next/server";
import { PACKS, pagosActivos } from "@/lib/packs";

export async function GET() {
  await connection(); // se evalúa en cada pedido (lee variables de entorno)
  return NextResponse.json({
    activos: pagosActivos(),
    packs: PACKS.map(({ id, nombre, llamadas, precioARS, detalle, destacado }) => ({
      id,
      nombre,
      llamadas,
      precioARS,
      detalle,
      destacado: Boolean(destacado),
    })),
  });
}
