"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SeccionesInfo from "./SeccionesInfo";
import { PACKS, formatearPrecio } from "@/lib/packs";

// Precio de referencia del cartel: lo que sale cada llamada en el pack más chico
const PACK_REFERENCIA = PACKS[0];
const PRECIO_POR_LLAMADA = Math.round(
  PACK_REFERENCIA.precioARS / PACK_REFERENCIA.llamadas
);

const COPOS = [
  { left: "6%", size: 4, dur: "12s", delay: "0s" },
  { left: "19%", size: 5, dur: "15s", delay: "2s" },
  { left: "34%", size: 3, dur: "10s", delay: "4s" },
  { left: "52%", size: 5, dur: "14s", delay: "1s" },
  { left: "68%", size: 4, dur: "11s", delay: "3s" },
  { left: "83%", size: 5, dur: "16s", delay: "0.5s" },
  { left: "94%", size: 3, dur: "13s", delay: "2.5s" },
];

// Cuenta regresiva a Navidad: se calcula solo en el navegador (en el servidor devuelve null)
const suscribirNada = () => () => {};
function calcularDiasNavidad() {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  let navidad = new Date(hoy.getFullYear(), 11, 25);
  if (hoy > navidad) navidad = new Date(hoy.getFullYear() + 1, 11, 25);
  return Math.round((navidad - hoy) / 86400000);
}

const CLASE_INPUT =
  "w-full rounded-2xl border border-[#D6CBB8] bg-[#FAF6EF]/60 px-4 py-3 text-base text-[#1C1917] placeholder:text-[#6B655E] focus:border-[#163829] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#163829]/15 transition";

export default function HomePage() {
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [edad, setEdad] = useState("");
  const [genero, setGenero] = useState("nino");
  const [estilo, setEstilo] = useState("argentino");
  const [logro, setLogro] = useState("");
  const [detalleExtra, setDetalleExtra] = useState("");
  const [notaPadres, setNotaPadres] = useState("");
  const [mostrarSecretos, setMostrarSecretos] = useState(true);
  const diasNavidad = useSyncExternalStore(
    suscribirNada,
    calcularDiasNavidad,
    () => null
  );

  const [codigo, setCodigo] = useState("");
  const [mostrarCodigo, setMostrarCodigo] = useState(false);
  const [pagosActivos, setPagosActivos] = useState(false);

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    router.prefetch("/llamada");
  }, [router]);

  // Código guardado de una compra anterior + si los packs están a la venta
  useEffect(() => {
    let cancelado = false;
    try {
      const guardado = localStorage.getItem("papaNoelCodigo");
      if (guardado) {
        Promise.resolve().then(() => {
          if (cancelado) return;
          setCodigo(guardado);
          setMostrarCodigo(true);
        });
      }
    } catch {
      // Sin almacenamiento local
    }
    fetch("/api/packs")
      .then((r) => r.json())
      .then((d) => !cancelado && setPagosActivos(Boolean(d.activos)))
      .catch(() => {});
    return () => {
      cancelado = true;
    };
  }, []);

  const manejarInicio = async (e) => {
    e.preventDefault();
    setError("");

    const nombreLimpio = nombre.trim();
    const edadNum = parseInt(edad, 10);

    if (!nombreLimpio) {
      setError("Escribí el nombre del chico o chica.");
      return;
    }
    if (isNaN(edadNum) || edadNum < 1 || edadNum > 99) {
      setError("Ingresá una edad válida.");
      return;
    }

    setCargando(true);

    const codigoLimpio = codigo.trim().toUpperCase();
    if (codigoLimpio) {
      try {
        const res = await fetch(
          `/api/verificar-pase?codigo=${encodeURIComponent(codigoLimpio)}`
        );
        const pase = await res.json();
        if (!pase.valido) {
          setError(pase.error || "Ese código no es válido.");
          setCargando(false);
          return;
        }
        try {
          localStorage.setItem("papaNoelCodigo", codigoLimpio);
        } catch {
          // Sin almacenamiento local
        }
      } catch {
        setError("No pudimos verificar el código. Intentá de nuevo.");
        setCargando(false);
        return;
      }
    }

    // Pedimos permiso de micrófono ahora (el adulto) y liberamos el stream al instante
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        stream.getTracks().forEach((t) => t.stop());
      }
    } catch {
      // Si lo bloquea acá, la pantalla de llamada muestra la guía para habilitarlo
    }

    const datos = {
      nombre: nombreLimpio.slice(0, 30),
      edad: edadNum,
      genero,
      estilo,
      logro: logro.trim().slice(0, 140),
      detalleExtra: detalleExtra.trim().slice(0, 140),
      notaPadres: notaPadres.trim().slice(0, 140),
      codigo: codigoLimpio || undefined,
    };

    try {
      sessionStorage.setItem("datosPapaNoel", JSON.stringify(datos));
      router.push("/llamada");
    } catch {
      setError("No pudimos guardar los datos en tu navegador. Intentá de nuevo.");
      setCargando(false);
    }
  };

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden bg-[#FAF6EF] text-[#1C1917]">
      {/* Hero navideño superior */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#122D21] via-[#163829] to-[#1D4634] px-4 pb-16 pt-10 text-white">
        <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-50">
          {COPOS.map((c, idx) => (
            <span
              key={idx}
              className="copo-nieve"
              style={{
                left: c.left,
                width: `${c.size}px`,
                height: `${c.size}px`,
                animationDuration: c.dur,
                animationDelay: c.delay,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 mx-auto flex max-w-md flex-col items-center text-center">
          <div className="relative mb-4 h-28 w-28 overflow-hidden rounded-full border-[3px] border-[#F3CA7A] shadow-[0_12px_35px_rgba(0,0,0,0.4)]">
            <img
              src="/papa-noel.webp"
              alt="Papá Noel"
              className="h-full w-full object-cover object-top"
            />
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F3CA7A]">
            Papá Noel en Vivo
          </p>
          <div className="mt-3 flex flex-col items-center">
            <p className="flex items-center gap-2 rounded-full bg-[#9E1B24] px-3.5 py-1 text-xs font-bold uppercase tracking-wide text-white shadow">
              <span className="font-semibold normal-case text-white/70 line-through decoration-2">
                {formatearPrecio(PRECIO_POR_LLAMADA)}
              </span>
              Gratis por tiempo limitado
            </p>
            <p className="mt-1 text-[11px] text-white/60">
              Precio por llamada en el {PACK_REFERENCIA.nombre} ({PACK_REFERENCIA.llamadas} por{" "}
              {formatearPrecio(PACK_REFERENCIA.precioARS)})
            </p>
          </div>
          {diasNavidad !== null && (
            <p className="mt-2 rounded-full border border-[#F3CA7A]/40 bg-[#F3CA7A]/10 px-3 py-1 text-xs font-semibold text-[#F3CA7A]">
              {diasNavidad === 0
                ? "¡Hoy es Navidad!"
                : diasNavidad === 1
                ? "¡Mañana es Navidad!"
                : `Faltan ${diasNavidad} días para Navidad`}
            </p>
          )}
          <h1 className="mt-2 font-serif text-3xl font-semibold leading-tight sm:text-4xl">
            Hacé que Papá Noel llame a tus hijos en vivo
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#E8E2D5]">
            No es un video pregrabado: charlan en tiempo real con una voz de IA
            que sabe su nombre y sus secretos. Gratis y sin descargar nada.
          </p>

          {/* 3 pasos */}
          <div className="mt-6 grid w-full grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-2xl border border-white/15 bg-white/10 px-2 py-2.5 backdrop-blur-sm">
              <span className="block font-bold text-[#F3CA7A]">1. Cargás</span>
              <span className="mt-0.5 block text-white/90">Nombre y edad</span>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 px-2 py-2.5 backdrop-blur-sm">
              <span className="block font-bold text-[#F3CA7A]">2. Pasás</span>
              <span className="mt-0.5 block text-white/90">El celu al nene</span>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 px-2 py-2.5 backdrop-blur-sm">
              <span className="block font-bold text-[#F3CA7A]">3. Hablan</span>
              <span className="mt-0.5 block text-white/90">En vivo 90 seg</span>
            </div>
          </div>
        </div>
      </section>

      {/* Formulario principal */}
      <section id="formulario" className="relative z-20 mx-auto -mt-10 max-w-md scroll-mt-4 px-4 pb-12">
        <form
          onSubmit={manejarInicio}
          className="rounded-[28px] border border-[#E5DBC9] bg-white p-6 shadow-[0_20px_50px_-24px_rgba(22,56,41,0.22)] sm:p-7"
        >
          <div className="mb-5 rounded-2xl border border-[#DCE8E0] bg-[#F4F8F5] px-4 py-3 text-xs leading-relaxed text-[#163829]">
            <strong className="font-semibold">Zona secreta para adultos:</strong>{" "}
            completá esto sin que mire. Los datos se usan solo para personalizar
            esta charla; nosotros no almacenamos grabaciones y el audio se
            procesa en tiempo real con IA (ElevenLabs).
          </div>

          <div className="space-y-4">
            {/* Nombre y Edad */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label
                  htmlFor="nombre"
                  className="mb-1.5 block text-sm font-semibold text-[#1C1917]"
                >
                  Nombre
                </label>
                <input
                  id="nombre"
                  type="text"
                  required
                  maxLength={30}
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Mateo"
                  className={CLASE_INPUT}
                />
              </div>

              <div>
                <label
                  htmlFor="edad"
                  className="mb-1.5 block text-sm font-semibold text-[#1C1917]"
                >
                  Edad
                </label>
                <input
                  id="edad"
                  type="number"
                  required
                  min={1}
                  max={99}
                  value={edad}
                  onChange={(e) => setEdad(e.target.value)}
                  placeholder="6"
                  className={CLASE_INPUT}
                />
              </div>
            </div>

            {/* Chips de Trato */}
            <div>
              <span className="mb-1.5 block text-sm font-semibold text-[#1C1917]">
                Cómo tratarlo/a
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "nino", label: "Nene" },
                  { id: "nina", label: "Nena" },
                  { id: "neutro", label: "Solo nombre" },
                ].map((op) => (
                  <button
                    key={op.id}
                    type="button"
                    onClick={() => setGenero(op.id)}
                    className={`cursor-pointer rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                      genero === op.id
                        ? "border-[#163829] bg-[#163829] text-white"
                        : "border-[#D6CBB8] bg-[#FAF6EF] text-[#44403C] hover:bg-[#F0E8DA]"
                    }`}
                  >
                    {op.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Chips de Acento */}
            <div>
              <span className="mb-1.5 block text-sm font-semibold text-[#1C1917]">
                Acento de Papá Noel
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "argentino", label: "Argentino (vos)" },
                  { id: "neutro", label: "Latino neutro (tú)" },
                ].map((op) => (
                  <button
                    key={op.id}
                    type="button"
                    onClick={() => setEstilo(op.id)}
                    className={`cursor-pointer rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                      estilo === op.id
                        ? "border-[#163829] bg-[#163829] text-white"
                        : "border-[#D6CBB8] bg-[#FAF6EF] text-[#44403C] hover:bg-[#F0E8DA]"
                    }`}
                  >
                    {op.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggle para secretos opcionales */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setMostrarSecretos((prev) => !prev)}
                className="flex w-full cursor-pointer items-center justify-between rounded-2xl border border-dashed border-[#C7BAA3] bg-[#FAF6EF]/70 px-4 py-3 text-left text-sm font-semibold text-[#163829] transition hover:bg-[#F3ECE0]"
              >
                <span>
                  {mostrarSecretos
                    ? "Ocultar secretos"
                    : "+ Secretos para sorprenderlo (opcional)"}
                </span>
                <span className="text-lg leading-none">
                  {mostrarSecretos ? "−" : "+"}
                </span>
              </button>

              {mostrarSecretos && (
                <div className="mt-4 space-y-4 border-t border-[#ECE4D5] pt-4">
                  <p className="text-xs leading-relaxed text-[#57534E]">
                    Esto es lo que hace la magia: Papá Noel lo menciona como si
                    lo hubiera leído en su cuaderno. Con uno solo ya alcanza.
                  </p>
                  <div>
                    <label
                      htmlFor="logro"
                      className="mb-1.5 block text-sm font-semibold text-[#1C1917]"
                    >
                      Logro de este año{" "}
                      <span className="font-normal text-[#57534E]">
                        (opcional)
                      </span>
                    </label>
                    <input
                      id="logro"
                      type="text"
                      maxLength={140}
                      value={logro}
                      onChange={(e) => setLogro(e.target.value)}
                      placeholder="Ej: aprendió a andar en bici sin rueditas"
                      className={CLASE_INPUT}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="detalleExtra"
                      className="mb-1.5 block text-sm font-semibold text-[#1C1917]"
                    >
                      Dato sorpresa{" "}
                      <span className="font-normal text-[#57534E]">
                        (mascota, hermano o gusto)
                      </span>
                    </label>
                    <input
                      id="detalleExtra"
                      type="text"
                      maxLength={140}
                      value={detalleExtra}
                      onChange={(e) => setDetalleExtra(e.target.value)}
                      placeholder="Ej: tiene un perro llamado Rocky y ama el fútbol"
                      className={CLASE_INPUT}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="notaPadres"
                      className="mb-1.5 block text-sm font-semibold text-[#1C1917]"
                    >
                      Consejo cariñoso{" "}
                      <span className="font-normal text-[#57534E]">
                        (opcional)
                      </span>
                    </label>
                    <input
                      id="notaPadres"
                      type="text"
                      maxLength={140}
                      value={notaPadres}
                      onChange={(e) => setNotaPadres(e.target.value)}
                      placeholder="Ej: que ordene los juguetes antes de dormir"
                      className={CLASE_INPUT}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Código de pack pago */}
          <div className="mt-4">
            {!mostrarCodigo ? (
              <button
                type="button"
                onClick={() => setMostrarCodigo(true)}
                className="cursor-pointer text-sm font-semibold text-[#163829] underline underline-offset-2"
              >
                Tengo un código de pack
              </button>
            ) : (
              <div>
                <label
                  htmlFor="codigo"
                  className="mb-1.5 block text-sm font-semibold text-[#1C1917]"
                >
                  Código de pack{" "}
                  <span className="font-normal text-[#57534E]">(opcional)</span>
                </label>
                <input
                  id="codigo"
                  type="text"
                  autoCapitalize="characters"
                  autoComplete="off"
                  maxLength={20}
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                  placeholder="NOEL-XXXX-XXXX"
                  className={CLASE_INPUT}
                />
              </div>
            )}
          </div>

          {error && (
            <p className="mt-4 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-[#9E1B24]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="mt-6 min-h-[54px] w-full cursor-pointer touch-manipulation rounded-2xl bg-[#9E1B24] px-5 py-3.5 text-base font-bold text-white shadow-lg shadow-[#9E1B24]/25 transition hover:bg-[#82151D] active:scale-[0.99] disabled:opacity-60"
          >
            {cargando ? "Preparando llamada..." : "Iniciar llamada mágica"}
          </button>

          <p className="mt-4 text-center text-xs text-[#57534E]">
            Experiencia interactiva con voz de inteligencia artificial. Sin
            cámara y sin registro. Tip: subí el volumen y buscá un lugar
            tranquilo.
          </p>
          {pagosActivos && (
            <p className="mt-2 text-center text-xs text-[#57534E]">
              ¿Querés más llamadas?{" "}
              <Link href="/packs" className="font-semibold text-[#163829] underline underline-offset-2">
                Mirá los packs
              </Link>
            </p>
          )}
        </form>
      </section>

      <SeccionesInfo />

      <footer className="border-t border-[#E5DBC9] px-4 py-8 text-center text-xs text-[#57534E]">
        <p>Papá Noel en Vivo · Hecho con cariño en Argentina</p>
        <p className="mt-2 space-x-3">
          {pagosActivos && (
            <Link href="/packs" className="underline underline-offset-2 hover:text-[#163829]">
              Packs de llamadas
            </Link>
          )}
          <Link href="/privacidad" className="underline underline-offset-2 hover:text-[#163829]">
            Privacidad y seguridad
          </Link>
        </p>
      </footer>
    </main>
  );
}