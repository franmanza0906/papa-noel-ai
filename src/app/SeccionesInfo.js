const SEGURIDAD = [
  {
    titulo: "No promete regalos",
    texto:
      "Si le piden algo, Papá Noel lo anota en su cuaderno mágico sin comprometerse. Nada de promesas que después no se puedan cumplir.",
  },
  {
    titulo: "No pide datos personales",
    texto:
      "Nunca pregunta dirección, escuela, apellido ni teléfono. Si la charla se va de tema, la vuelve a llevar al Polo Norte.",
  },
  {
    titulo: "No se guarda el audio",
    texto:
      "La voz se procesa en tiempo real y no se graba. Sin cámara, sin registro y sin descargar nada.",
  },
  {
    titulo: "Dura 90 segundos",
    texto:
      "Cuando se acaba el tiempo, Papá Noel se despide con cariño porque los duendes lo llaman para preparar el trineo.",
  },
];

const EJEMPLO = [
  { quien: "noel", texto: "¡Jo, jo, jo! ¡Hola Mateo! Qué alegría enorme escucharte desde el Polo Norte. ¿Cómo estás?" },
  { quien: "chico", texto: "¡Bien! ¿Sos el de verdad?" },
  { quien: "noel", texto: "¡Claro que sí! Estoy acá calentito al lado de la chimenea. Che, me contaron los duendes que este año aprendiste a andar en bici sin rueditas. ¿Es cierto?" },
  { quien: "chico", texto: "¡Sí! ¿Cómo sabés?" },
  { quien: "noel", texto: "Lo vi en mi libro mágico. ¿Y cómo anda Rocky? ¿Sigue persiguiendo la pelota?" },
];

const PREGUNTAS = [
  {
    p: "¿Es gratis?",
    r: "Sí. Cada celular tiene 2 llamadas gratis. Como la voz con IA tiene un costo, hay un cupo diario: si se agota, probá de nuevo al día siguiente.",
  },
  {
    p: "¿Funciona en iPhone y Android?",
    r: "Sí, desde Safari o Chrome. Si abriste el link desde Instagram, X o TikTok, copialo y abrilo en el navegador del celu, porque esas apps suelen bloquear el micrófono.",
  },
  {
    p: "¿Y si mi hijo se queda callado?",
    r: "Es lo más normal del mundo. Papá Noel rompe el hielo contando algo gracioso de los renos o los duendes, y le hace preguntas cortitas.",
  },
  {
    p: "¿Para qué edades sirve?",
    r: "Funciona mejor entre 3 y 10 años. Papá Noel adapta cómo habla según la edad que cargues: más simple y dulce para los chiquitos, más compinche para los grandes.",
  },
  {
    p: "¿Qué pasa con los datos que cargo?",
    r: "Se usan solo para personalizar esa llamada. No grabamos el audio y lo que cargás se usa solo durante la llamada. Para controlar el cupo gratis registramos solo un identificador del dispositivo y la red.",
  },
  {
    p: "¿Por qué no hay video?",
    r: "Porque es una llamada, como las de antes: el chico escucha la voz de Papá Noel y le contesta. Así no hace falta cámara y funciona con cualquier conexión.",
  },
];

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: PREGUNTAS.map(({ p, r }) => ({
    "@type": "Question",
    name: p,
    acceptedAnswer: { "@type": "Answer", text: r },
  })),
};

export default function SeccionesInfo() {
  return (
    <div className="mx-auto max-w-md space-y-12 px-4 pb-14">
      {/* Ejemplo de charla */}
      <section>
        <h2 className="text-center font-serif text-2xl font-semibold text-[#163829]">
          Así suena una llamada
        </h2>
        <p className="mt-2 text-center text-sm text-[#57534E]">
          Papá Noel usa los secretos que cargaste como si los supiera de
          siempre.
        </p>
        <div className="mt-5 space-y-2.5 rounded-[28px] border border-[#E5DBC9] bg-white p-5">
          {EJEMPLO.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.quien === "noel" ? "justify-start" : "justify-end"}`}
            >
              <p
                className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                  m.quien === "noel"
                    ? "rounded-bl-md bg-[#163829] text-white"
                    : "rounded-br-md bg-[#F0E8DA] text-[#1C1917]"
                }`}
              >
                {m.texto}
              </p>
            </div>
          ))}
          <p className="pt-1 text-center text-xs text-[#6B655E]">
            Ejemplo con los secretos «aprendió a andar en bici» y «tiene un perro
            llamado Rocky».
          </p>
        </div>
      </section>

      {/* Seguridad */}
      <section>
        <h2 className="text-center font-serif text-2xl font-semibold text-[#163829]">
          Pensado para chicos
        </h2>
        <div className="mt-5 grid gap-3">
          {SEGURIDAD.map((s) => (
            <div
              key={s.titulo}
              className="rounded-2xl border border-[#DCE8E0] bg-[#F4F8F5] px-4 py-3.5"
            >
              <h3 className="text-sm font-bold text-[#163829]">{s.titulo}</h3>
              <p className="mt-1 text-sm leading-relaxed text-[#44403C]">
                {s.texto}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Preguntas frecuentes */}
      <section>
        <h2 className="text-center font-serif text-2xl font-semibold text-[#163829]">
          Preguntas frecuentes
        </h2>
        <div className="mt-5 divide-y divide-[#ECE4D5] rounded-[28px] border border-[#E5DBC9] bg-white px-5">
          {PREGUNTAS.map(({ p, r }) => (
            <details key={p} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-[#1C1917]">
                {p}
                <span className="text-lg leading-none text-[#163829] transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-[#57534E]">{r}</p>
            </details>
          ))}
        </div>
      </section>

      <div className="text-center">
        <a
          href="#formulario"
          className="inline-block rounded-2xl bg-[#9E1B24] px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-[#9E1B24]/25 transition hover:bg-[#82151D]"
        >
          Preparar la llamada
        </a>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
    </div>
  );
}
