import Link from "next/link";

export const metadata = {
  title: "Privacidad y seguridad · Papá Noel en Vivo",
  description:
    "Qué datos usa Papá Noel en Vivo, qué no guardamos y cómo cuidamos a los chicos durante la llamada.",
};

const SECCIONES = [
  {
    titulo: "Qué cargás y para qué se usa",
    texto:
      "El nombre, la edad, la forma de tratarlo, el acento y los secretos opcionales se usan solo para personalizar esa llamada. Se guardan en tu navegador mientras dura la llamada y se borran al terminar.",
  },
  {
    titulo: "La voz",
    texto:
      "La conversación se procesa en tiempo real con la tecnología de voz de ElevenLabs. Configuramos el servicio para que no guarde el audio de las llamadas ni conserve las conversaciones.",
  },
  {
    titulo: "Control del cupo gratis",
    texto:
      "Para que las llamadas gratis alcancen para todos, registramos un identificador anónimo del dispositivo, la dirección de red y la hora de cada llamada. No registramos nombres ni secretos.",
  },
  {
    titulo: "Pagos",
    texto:
      "Si comprás un pack, el pago lo procesa Mercado Pago: nosotros nunca vemos los datos de tu tarjeta. Solo guardamos el código del pack, cuántas llamadas le quedan, el número de operación y el monto.",
  },
  {
    titulo: "Opiniones",
    texto:
      "Al terminar la llamada podés dejarnos tu opinión. Guardamos la puntuación, el comentario, la edad cargada y el acento elegido, nunca el nombre. Solo mostramos un comentario en la web si marcaste que podemos hacerlo.",
  },
  {
    titulo: "Estadísticas",
    texto:
      "Usamos Vercel Analytics para saber cuántas personas visitan la página. No usa cookies ni identifica a nadie.",
  },
  {
    titulo: "Cómo cuidamos a los chicos",
    texto:
      "Papá Noel nunca pide datos personales como dirección, escuela, apellido o teléfono, no promete regalos y redirige con dulzura cualquier tema sensible. Igual, recomendamos que un adulto esté cerca durante la llamada.",
  },
  {
    titulo: "Es inteligencia artificial",
    texto:
      "La voz de Papá Noel es generada por inteligencia artificial. Pensamos esta experiencia para que los adultos la compartan con los chicos como un juego navideño.",
  },
];

export default function PrivacidadPage() {
  return (
    <main className="min-h-[100dvh] bg-[#FAF6EF] px-4 py-10 text-[#1C1917]">
      <div className="mx-auto max-w-md">
        <Link
          href="/"
          className="text-sm font-semibold text-[#163829] underline underline-offset-2"
        >
          ← Volver
        </Link>
        <h1 className="mt-4 font-serif text-3xl font-semibold text-[#163829]">
          Privacidad y seguridad
        </h1>
        <div className="mt-6 space-y-5">
          {SECCIONES.map((s) => (
            <section key={s.titulo}>
              <h2 className="text-base font-bold text-[#163829]">{s.titulo}</h2>
              <p className="mt-1 text-sm leading-relaxed text-[#44403C]">
                {s.texto}
              </p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
