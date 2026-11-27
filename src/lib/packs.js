// ⚙️ PACKS PAGOS: ajustá precios y cantidades acá.
// Todas las llamadas duran lo mismo que las gratis (90 s), porque el agente de
// ElevenLabs corta a los 100 s. Si querés llamadas más largas, hay que subir
// primero la "Duración máxima de la conversación" en ElevenLabs.
export const DURACION_LLAMADA_PAGA_SEGUNDOS = 90;

export const PACKS = [
  {
    id: "pack-3",
    nombre: "Pack Familia",
    llamadas: 3,
    precioARS: 2990,
    detalle: "Ideal para hermanos o para repetir en Nochebuena.",
  },
  {
    id: "pack-10",
    nombre: "Pack Navidad Completa",
    llamadas: 10,
    precioARS: 6990,
    detalle: "Para primos, amigos y todas las veces que quieran.",
    destacado: true,
  },
];

export function buscarPack(id) {
  return PACKS.find((p) => p.id === id) || null;
}

// Los pagos se muestran solo si está configurado el token y PAGOS_ACTIVOS=true
export function pagosActivos() {
  return (
    process.env.PAGOS_ACTIVOS === "true" && Boolean(process.env.MP_ACCESS_TOKEN)
  );
}

export function formatearPrecio(ars) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(ars);
}
