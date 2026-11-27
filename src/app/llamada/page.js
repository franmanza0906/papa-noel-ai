"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useConversation, ConversationProvider } from "@elevenlabs/react";

const COPOS = [
  { left: "8%", size: 4, dur: "11s", delay: "0s" },
  { left: "22%", size: 6, dur: "14s", delay: "2s" },
  { left: "37%", size: 3, dur: "9s", delay: "4s" },
  { left: "51%", size: 5, dur: "13s", delay: "1s" },
  { left: "66%", size: 4, dur: "10s", delay: "3s" },
  { left: "79%", size: 6, dur: "15s", delay: "0.5s" },
  { left: "91%", size: 3, dur: "12s", delay: "2.5s" },
];

function traducirError(error) {
  const nombre = error?.name || "";
  const msg = (error?.message || "").toLowerCase();

  if (nombre === "NotAllowedError" || msg.includes("permission")) {
    return "Necesitamos permiso del micrófono para que Papá Noel pueda escucharte. Si abriste el link desde X o Instagram, copialo y abrilo en Chrome o Safari.";
  }
  if (
    nombre === "NotFoundError" ||
    msg.includes("requested device not found") ||
    msg.includes("no audio")
  ) {
    return "No encontramos un micrófono conectado en este dispositivo.";
  }
  if (nombre === "NotReadableError" || msg.includes("could not start")) {
    return "Otra app está usando tu micrófono ahora mismo. Cerrala y volvé a intentar.";
  }
  return error?.message || "No se pudo conectar la llamada. Intentá de nuevo.";
}

function AvatarLlamada({ hablando, chico = false }) {
  const [sinFoto, setSinFoto] = useState(false);

  return (
    <div className="relative flex items-center justify-center">
      {!chico && (
        <div
          className={`absolute rounded-full bg-[#E5A952]/30 blur-2xl transition-all duration-500 ${
            hablando
              ? "h-64 w-64 scale-110 opacity-100"
              : "h-48 w-48 scale-95 opacity-30"
          }`}
        />
      )}

      <div
        className={`relative overflow-hidden rounded-full border-[4px] shadow-[0_20px_50px_rgba(0,0,0,0.45)] transition-all duration-300 ${
          chico ? "h-24 w-24 border-[#E5DBC9]" : "h-44 w-44 sm:h-48 sm:w-48"
        } ${
          !chico && hablando
            ? "scale-105 border-[#F3CA7A] ring-8 ring-[#F3CA7A]/20"
            : !chico
            ? "scale-100 border-[#FAF6EF]/20"
            : ""
        }`}
      >
        {!sinFoto ? (
          <img
            src="/papa-noel.webp"
            alt="Papá Noel"
            onError={() => setSinFoto(true)}
            className="h-full w-full object-cover object-top"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-b from-[#7E161D] to-[#4A0D12] p-4 text-center">
            <span className="font-serif text-4xl font-bold text-[#F6E6C9]">
              PN
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function ContenidoLlamada() {
  const router = useRouter();

  const [datos, setDatos] = useState(null);
  const [estado, setEstado] = useState("cargando");
  const [mensajeError, setMensajeError] = useState("");
  const [segundosTranscurridos, setSegundosTranscurridos] = useState(0);
  const [duracionMaxima, setDuracionMaxima] = useState(90);
  const [silenciado, setSilenciado] = useState(false);
  const [horaActual, setHoraActual] = useState("");
  const [esNavegadorInterno, setEsNavegadorInterno] = useState(false);
  const [linkCopiado, setLinkCopiado] = useState(false);
  const [ofrecerPacks, setOfrecerPacks] = useState(false);
  const [llamadasRestantes, setLlamadasRestantes] = useState(null);

  const inicioLlamadaRef = useRef(null);
  const avisoDespedidaEnviadoRef = useRef(false);
  const llamadaActivaRef = useRef(false);

  useEffect(() => {
    const ua = navigator.userAgent || "";
    if (/Twitter|X-Client|Instagram|FBAN|FBAV|TikTok|Line|Snapchat/i.test(ua)) {
      setEsNavegadorInterno(true);
    }

    const actualizarHora = () => {
      const ahora = new Date();
      setHoraActual(
        `${ahora.getHours()}:${String(ahora.getMinutes()).padStart(2, "0")}`
      );
    };
    actualizarHora();
    const int = setInterval(actualizarHora, 60000);
    return () => clearInterval(int);
  }, []);

  const conversation = useConversation({
    micMuted: silenciado,
    onConnect: () => {
      llamadaActivaRef.current = true;
      inicioLlamadaRef.current = Date.now();
      setSegundosTranscurridos(0);
      setEstado("en_llamada");
    },
    onDisconnect: () => {
      if (llamadaActivaRef.current) {
        llamadaActivaRef.current = false;
        sessionStorage.removeItem("datosPapaNoel");
        setEstado("finalizada");
      }
    },
    onError: (err) => {
      console.error("Error de ElevenLabs:", err);
      llamadaActivaRef.current = false;
      setMensajeError(
        "Se cortó la señal con el Polo Norte. Revisá tu conexión y volvé a intentar."
      );
      setEstado("error");
    },
  });

  useEffect(() => {
    try {
      const guardado = sessionStorage.getItem("datosPapaNoel");
      if (!guardado) {
        router.replace("/");
        return;
      }
      setDatos(JSON.parse(guardado));
      setEstado("entrante");
    } catch {
      router.replace("/");
    }
  }, [router]);

  useEffect(() => {
    if (estado !== "entrante") return;

    let audioCtx = null;
    const tocarCampanita = () => {
      try {
        const AudioContextClass =
          window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        if (!audioCtx) audioCtx = new AudioContextClass();

        const notas = [523.25, 659.25, 783.99];
        notas.forEach((freq, i) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, audioCtx.currentTime + i * 0.14);
          gain.gain.setValueAtTime(0.05, audioCtx.currentTime + i * 0.14);
          gain.gain.exponentialRampToValueAtTime(
            0.001,
            audioCtx.currentTime + i * 0.14 + 0.35
          );
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(audioCtx.currentTime + i * 0.14);
          osc.stop(audioCtx.currentTime + i * 0.14 + 0.36);
        });
      } catch {
        // Ignorar si el navegador bloquea autoplay
      }
    };

    tocarCampanita();
    const intervalo = setInterval(tocarCampanita, 2600);

    return () => {
      clearInterval(intervalo);
      if (audioCtx && audioCtx.state !== "closed") {
        audioCtx.close().catch(() => {});
      }
    };
  }, [estado]);

  const cortarLlamada = async () => {
    llamadaActivaRef.current = false;
    try {
      await conversation.endSession();
    } catch {
      // Ignorar
    }
    sessionStorage.removeItem("datosPapaNoel");
    setEstado("finalizada");
  };

  // Cuenta regresiva basada en hora real (resiste bloqueo de pantalla y StrictMode)
  useEffect(() => {
    if (estado !== "en_llamada") return;

    const intervalo = setInterval(() => {
      if (!inicioLlamadaRef.current) return;
      const transcurridos = Math.floor(
        (Date.now() - inicioLlamadaRef.current) / 1000
      );
      setSegundosTranscurridos(transcurridos);

      if (
        transcurridos >= duracionMaxima - 15 &&
        !avisoDespedidaEnviadoRef.current
      ) {
        avisoDespedidaEnviadoRef.current = true;
        if (typeof conversation.sendContextualUpdate === "function") {
          conversation.sendContextualUpdate(
            "AVISO DEL SISTEMA: Quedan solo 15 segundos de llamada. Empezá a despedirte con mucho cariño ahora mismo diciendo que los duendes te llaman urgente para preparar el trineo, mandale un abrazo enorme y cerrá la conversación."
          );
        }
      }

      if (transcurridos >= duracionMaxima) {
        clearInterval(intervalo);
        cortarLlamada();
      }
    }, 500);

    return () => clearInterval(intervalo);
  }, [estado, duracionMaxima]);

  useEffect(() => {
    return () => {
      if (llamadaActivaRef.current) {
        conversation.endSession().catch(() => {});
      }
    };
  }, []);

  const atenderLlamada = async () => {
    if (!datos) return;
    setEstado("conectando");
    setMensajeError("");
    avisoDespedidaEnviadoRef.current = false;

    try {
      // Pedimos permiso y liberamos el stream al instante (ElevenLabs abre el suyo)
      const streamPrueba = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      streamPrueba.getTracks().forEach((track) => track.stop());

      let deviceId = localStorage.getItem("papaNoelDeviceId");
      if (!deviceId) {
        deviceId =
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `dev_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
        localStorage.setItem("papaNoelDeviceId", deviceId);
      }

      const res = await fetch("/api/iniciar-sesion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: datos.nombre,
          edad: datos.edad,
          deviceId,
          codigo: datos.codigo || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.signedUrl) {
        setOfrecerPacks(
          ["LIMITE_GRATIS", "SIN_CUPO", "PASE_INVALIDO"].includes(data.codigo)
        );
        throw new Error(
          data.error || "No se pudo establecer conexión con el Polo Norte."
        );
      }

      setDuracionMaxima(data.duracionMaximaSegundos || 90);
      if (typeof data.llamadasRestantes === "number") {
        setLlamadasRestantes(data.llamadasRestantes);
      }

      const mapaTrato = {
        nino: "Nene / Campeón (trato masculino)",
        nina: "Nena / Campeona (trato femenino)",
        neutro: "Llamarlo solo por su nombre, sin apodos de género",
      };

      const mapaAcento = {
        argentino:
          "Español rioplatense de Argentina (usá voseo suave: vos, tenés, contame; llamate siempre Papá Noel)",
        neutro:
          "Español neutro latinoamericano (usá tú, tienes, cuéntame; podés decirte Santa o Papá Noel)",
      };

      await conversation.startSession({
        signedUrl: data.signedUrl,
        dynamicVariables: {
          nombre: datos.nombre.trim().slice(0, 30),
          edad: String(datos.edad).slice(0, 2),
          trato: mapaTrato[datos.genero] || mapaTrato.neutro,
          acento: mapaAcento[datos.estilo] || mapaAcento.argentino,
          logro: datos.logro?.trim().slice(0, 140) || "Ninguno",
          detalle_extra: datos.detalleExtra?.trim().slice(0, 140) || "Ninguno",
          nota_padres: datos.notaPadres?.trim().slice(0, 140) || "Ninguno",
        },
      });
    } catch (error) {
      console.error("Error al iniciar llamada:", error);
      setMensajeError(traducirError(error));
      setEstado("error");
    }
  };

  const copiarLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin);
      setLinkCopiado(true);
      setTimeout(() => setLinkCopiado(false), 2500);
    } catch {
      // Fallback silencioso
    }
  };

  const formatearTiempo = (totalSegundos) => {
    const min = Math.floor(totalSegundos / 60);
    const seg = totalSegundos % 60;
    return `${String(min).padStart(2, "0")}:${String(seg).padStart(2, "0")}`;
  };

  const compartirWhatsApp = () => {
    const texto = encodeURIComponent(
      "¡Acabamos de hacer una llamada en vivo con Papá Noel y es increíble! Probala gratis con los chicos acá: " +
        window.location.origin
    );
    window.open(`https://wa.me/?text=${texto}`, "_blank");
  };

  const segundosRestantes = Math.max(0, duracionMaxima - segundosTranscurridos);

  // POST-LLAMADA CÁLIDA
  if (estado === "finalizada") {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-[#FAF6EF] px-4 py-10 text-[#1C1917]">
        <div className="w-full max-w-md rounded-[28px] border border-[#E5DBC9] bg-white p-7 text-center shadow-[0_20px_50px_-24px_rgba(22,56,41,0.18)] sm:p-8">
          <div className="flex justify-center">
            <AvatarLlamada hablando={false} chico={true} />
          </div>

          <h2 className="mt-5 font-serif text-3xl font-semibold text-[#163829]">
            ¡Feliz Navidad{datos?.nombre ? `, ${datos.nombre}` : ""}!
          </h2>
          <p className="mt-2.5 text-sm leading-relaxed text-[#57534E]">
            Papá Noel volvió al taller con los duendes. Los datos del formulario
            ya se limpiaron de tu navegador.
          </p>
          {llamadasRestantes !== null && (
            <p className="mt-3 rounded-xl bg-[#F4F8F5] px-3.5 py-2.5 text-sm font-semibold text-[#163829]">
              {llamadasRestantes > 0
                ? `Te ${llamadasRestantes === 1 ? "queda 1 llamada" : `quedan ${llamadasRestantes} llamadas`} con tu código ${datos?.codigo}.`
                : "Usaste todas las llamadas de tu código."}
            </p>
          )}

          <div className="mt-7 space-y-3">
            <button
              onClick={compartirWhatsApp}
              className="min-h-[52px] w-full cursor-pointer touch-manipulation rounded-2xl bg-[#163829] px-5 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#102B1F]"
            >
              Compartir con otra familia por WhatsApp
            </button>

            <button
              onClick={() => router.push("/")}
              className="min-h-[48px] w-full cursor-pointer touch-manipulation rounded-2xl border border-[#DCD3C4] bg-[#FAF6EF] px-5 py-3.5 text-sm font-semibold text-[#44403C] transition hover:bg-[#F3ECE0]"
            >
              Preparar otra llamada
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (estado === "cargando") {
    return (
      <main className="flex h-[100dvh] items-center justify-center bg-[#12261E] text-sm text-[#E8DFC8]">
        Conectando con el Polo Norte...
      </main>
    );
  }

  // LLAMADA EN VIVO
  return (
    <main className="relative flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-[#0F0E0E] text-white select-none">
      <div className="relative flex h-full w-full flex-col justify-between overflow-hidden sm:h-[92dvh] sm:max-w-[430px] sm:rounded-[40px] sm:border sm:border-white/10 sm:shadow-2xl">
        {/* Nieve cayendo suave de fondo */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden bg-[#0A0909]">
          <div className="absolute inset-0 bg-gradient-to-b from-red-950/15 via-[#0A0909] to-[#0D0A09]" />
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

        {/* 1. BARRA DE ESTADO (Solo en PC para no duplicar la del celular) */}
        <div className="relative z-20 hidden items-center justify-between px-6 pt-3 text-xs font-semibold opacity-75 sm:flex">
          <span>{horaActual}</span>
          <div className="flex items-center gap-1.5">
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2 22h20V2z" opacity=".3" />
              <path d="M2 22h14V8z" />
            </svg>
            <svg className="h-3 w-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M12 21l-12-12c4.14-4.14 10.86-4.14 15 0l-3 3c-2.48-2.48-6.52-2.48-9 0l9 9z"
                opacity=".3"
              />
              <path d="M12 21l-6-6c2.07-2.07 5.43-2.07 7.5 0z" />
            </svg>
            <div className="flex h-2.5 w-5 items-center rounded-sm border border-current p-0.5">
              <div className="h-full w-4/5 rounded-2xs bg-current" />
            </div>
          </div>
        </div>

        {/* Aviso si abrió desde X / Instagram */}
        {esNavegadorInterno && estado === "entrante" && (
          <div className="relative z-30 mx-4 mt-4 rounded-2xl border border-[#F3CA7A]/40 bg-[#2B1F0E]/95 p-3.5 text-center text-xs text-[#F6E6C9]">
            <p className="font-semibold">
              El navegador de X/Instagram suele bloquear el micrófono.
            </p>
            <p className="mt-1 opacity-85">
              Para que funcione perfecto, abrí este link en Chrome o Safari.
            </p>
            <button
              onClick={copiarLink}
              className="mt-2.5 rounded-xl bg-[#F3CA7A] px-3.5 py-1.5 text-xs font-bold text-[#1C1917]"
            >
              {linkCopiado ? "¡Link copiado!" : "Copiar link"}
            </button>
          </div>
        )}

        {/* 2. AREA CENTRAL DE LLAMADA */}
        {estado === "entrante" && (
          <div className="relative z-10 flex flex-1 flex-col items-center justify-between py-12 text-center">
            <div className="space-y-2">
              <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-[#E5C287]">
                Llamada mágica entrante
              </p>
              <h1 className="font-serif text-4xl font-semibold tracking-wide text-white">
                Papá Noel
              </h1>
              <p className="text-sm text-white/75">
                Llamando desde el Polo Norte para{" "}
                <span className="font-semibold text-[#F3CA7A]">
                  {datos?.nombre}
                </span>
              </p>
            </div>

            <AvatarLlamada hablando={true} />

            <div className="w-full space-y-7">
              <p className="text-xs text-white/60">
                Pasale el teléfono a {datos?.nombre}
              </p>

              <div className="flex items-center justify-center gap-16">
                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={() => router.push("/")}
                    className="flex h-16 w-16 cursor-pointer touch-manipulation items-center justify-center rounded-full bg-[#C92A2A] text-white shadow-lg shadow-black/40 transition active:scale-90"
                    aria-label="Rechazar"
                  >
                    <svg
                      className="h-7 w-7"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                  <span className="text-xs font-medium text-white/70">
                    Rechazar
                  </span>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={atenderLlamada}
                    className="flex h-20 w-20 cursor-pointer touch-manipulation items-center justify-center rounded-full bg-[#22A055] text-white shadow-[0_0_35px_rgba(34,160,85,0.45)] transition active:scale-90"
                    aria-label="Atender"
                  >
                    <svg
                      className="h-9 w-9 animate-pulse"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" />
                    </svg>
                  </button>
                  <span className="text-xs font-semibold text-[#6EE7A0]">
                    Atender
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {estado === "conectando" && (
          <div className="relative z-10 flex flex-1 flex-col items-center justify-center space-y-6 text-center">
            <AvatarLlamada hablando={false} />
            <div className="space-y-1">
              <h2 className="font-serif text-2xl font-semibold text-white">
                Enlazando...
              </h2>
              <p className="text-xs font-medium tracking-wide text-[#E5C287]">
                Polo Norte
              </p>
            </div>
          </div>
        )}

        {estado === "en_llamada" && (
          <div className="relative z-10 flex w-full flex-1 flex-col items-center justify-between px-5 pt-8">
            <div className="space-y-1 text-center">
              <h1 className="font-serif text-3xl font-semibold tracking-wide text-white">
                Papá Noel
              </h1>
              <div className="flex items-center justify-center gap-2 text-xs font-medium opacity-80">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#E03131]" />
                <span className="font-mono">
                  {formatearTiempo(segundosTranscurridos)}
                </span>
              </div>
              {segundosRestantes <= 20 && (
                <p className="pt-1 text-[11px] font-medium text-[#F3CA7A]">
                  Los renos ya están listos ({segundosRestantes}s)
                </p>
              )}
            </div>

            <div className="relative my-8 flex flex-1 flex-col items-center justify-center">
              <AvatarLlamada hablando={conversation.isSpeaking} />

              <div className="mt-6 flex h-6 items-center justify-center gap-1.5 opacity-80">
                {[1, 2, 3, 4, 5].map((barra) => (
                  <span
                    key={barra}
                    className={`w-1 rounded-full bg-[#F3CA7A] transition-all duration-150 ${
                      conversation.isSpeaking
                        ? barra % 2 === 0
                          ? "h-5 animate-pulse"
                          : "h-3.5 animate-bounce"
                        : "h-1 opacity-25"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Barra de control flotante abajo */}
            <div className="mb-[max(1.5rem,env(safe-area-inset-bottom))] flex items-center justify-center gap-7 rounded-full border border-white/10 bg-white/5 px-8 py-3.5 backdrop-blur-xl">
              {/* Botón silenciar micrófono */}
              <button
                onClick={() => setSilenciado((prev) => !prev)}
                className={`flex h-12 w-12 cursor-pointer touch-manipulation items-center justify-center rounded-full transition ${
                  silenciado
                    ? "bg-white text-[#0F0E0E]"
                    : "bg-white/10 text-white hover:bg-white/20 active:scale-95"
                }`}
                aria-label={
                  silenciado ? "Activar micrófono" : "Silenciar micrófono"
                }
              >
                {silenciado ? (
                  <svg
                    className="h-5.5 w-5.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 3l18 18"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5.5 w-5.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                )}
              </button>

              {/* Botón Cortar */}
              <button
                onClick={cortarLlamada}
                className="flex h-14 w-14 cursor-pointer touch-manipulation items-center justify-center rounded-full bg-[#C92A2A] text-white shadow-md shadow-black/30 transition active:scale-95"
                aria-label="Finalizar llamada"
              >
                <svg
                  className="h-6.5 w-6.5 rotate-[135deg]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {estado === "error" && (
          <div className="relative z-10 flex w-full max-w-md flex-1 flex-col items-center justify-center p-5">
            <div className="w-full space-y-5 rounded-[28px] border border-white/10 bg-[#161212]/95 p-7 text-center shadow-2xl">
              <h2 className="font-serif text-2xl font-semibold text-white">
                Mala señal en el Polo Norte
              </h2>
              <p className="text-sm leading-relaxed text-[#E5C287]">
                {mensajeError}
              </p>
              <div className="space-y-3 pt-2">
                {esNavegadorInterno && (
                  <button
                    onClick={copiarLink}
                    className="min-h-[48px] w-full cursor-pointer touch-manipulation rounded-2xl bg-[#F3CA7A] px-5 py-3 text-sm font-bold text-[#1C1917] transition"
                  >
                    {linkCopiado
                      ? "¡Link copiado! Pegalo en Chrome o Safari"
                      : "Copiar link para abrir en Chrome / Safari"}
                  </button>
                )}
                {ofrecerPacks && (
                  <button
                    onClick={() => router.push("/packs")}
                    className="min-h-[50px] w-full cursor-pointer touch-manipulation rounded-2xl bg-[#163829] px-5 py-3.5 text-sm font-bold text-white transition"
                  >
                    Ver packs de llamadas
                  </button>
                )}
                <button
                  onClick={() => setEstado("entrante")}
                  className="min-h-[50px] w-full cursor-pointer touch-manipulation rounded-2xl bg-[#9E1B24] px-5 py-3.5 text-sm font-bold text-white transition"
                >
                  Reintentar
                </button>
                <button
                  onClick={() => router.push("/")}
                  className="min-h-[46px] w-full cursor-pointer touch-manipulation rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-xs font-medium text-white/80 transition"
                >
                  Volver al inicio
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="relative z-20 h-2 w-full bg-transparent" />
      </div>
    </main>
  );
}

export default function LlamadaPage() {
  return (
    <ConversationProvider>
      <ContenidoLlamada />
    </ConversationProvider>
  );
}
