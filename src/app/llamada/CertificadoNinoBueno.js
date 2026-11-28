"use client";

import { useState } from "react";

const ANCHO = 1080;
const ALTO = 1350; // 4:5, el formato que mejor se ve en Instagram y WhatsApp

function fuente(variable, respaldo) {
  if (typeof document === "undefined") return respaldo;
  const valor = getComputedStyle(document.body).getPropertyValue(variable).trim();
  return valor ? `${valor}, ${respaldo}` : respaldo;
}

function fechaDeHoy() {
  return new Date().toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function estrella(ctx, x, y, r, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const radio = i % 2 === 0 ? r : r * 0.45;
    const ang = (Math.PI / 5) * i - Math.PI / 2;
    ctx.lineTo(x + radio * Math.cos(ang), y + radio * Math.sin(ang));
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// Corta el texto en líneas que entren en el ancho dado.
function partirEnLineas(ctx, texto, anchoMax) {
  const palabras = texto.split(" ");
  const lineas = [];
  let actual = "";
  for (const p of palabras) {
    const prueba = actual ? `${actual} ${p}` : p;
    if (ctx.measureText(prueba).width > anchoMax && actual) {
      lineas.push(actual);
      actual = p;
    } else {
      actual = prueba;
    }
  }
  if (actual) lineas.push(actual);
  return lineas;
}

async function dibujarCertificado(nombre, genero) {
  const serif = fuente("--font-serif", "Georgia, serif");
  const sans = fuente("--font-sans", "system-ui, sans-serif");
  try {
    await Promise.all([
      document.fonts.load(`600 80px ${serif}`),
      document.fonts.load(`italic 400 40px ${serif}`),
      document.fonts.load(`500 32px ${sans}`),
    ]);
  } catch {
    // Si no cargan las fuentes, se usa la de respaldo
  }

  const canvas = document.createElement("canvas");
  canvas.width = ANCHO;
  canvas.height = ALTO;
  const ctx = canvas.getContext("2d");

  // Fondo pergamino
  const fondo = ctx.createRadialGradient(ANCHO / 2, ALTO / 2, 200, ANCHO / 2, ALTO / 2, 900);
  fondo.addColorStop(0, "#FFFBF3");
  fondo.addColorStop(1, "#F1E6D2");
  ctx.fillStyle = fondo;
  ctx.fillRect(0, 0, ANCHO, ALTO);

  // Doble marco rojo y verde
  ctx.strokeStyle = "#9E1B24";
  ctx.lineWidth = 14;
  ctx.strokeRect(40, 40, ANCHO - 80, ALTO - 80);
  ctx.strokeStyle = "#163829";
  ctx.lineWidth = 4;
  ctx.strokeRect(72, 72, ANCHO - 144, ALTO - 144);

  // Estrellas en las esquinas
  for (const [x, y] of [
    [110, 110],
    [ANCHO - 110, 110],
    [110, ALTO - 110],
    [ANCHO - 110, ALTO - 110],
  ]) {
    estrella(ctx, x, y, 22, "#C9A227");
  }

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  ctx.fillStyle = "#9E1B24";
  ctx.font = `600 34px ${sans}`;
  ctx.fillText("POLO NORTE · TALLER DE PAPÁ NOEL", ANCHO / 2, 210);

  ctx.fillStyle = "#163829";
  ctx.font = `600 84px ${serif}`;
  ctx.fillText("Certificado oficial", ANCHO / 2, 330);
  ctx.font = `italic 400 58px ${serif}`;
  ctx.fillText(
    genero === "nina" ? "de la Lista de Niñas Buenas" : "de la Lista de Niños Buenos",
    ANCHO / 2,
    410
  );

  // Separador
  ctx.strokeStyle = "#C9A227";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(300, 470);
  ctx.lineTo(ANCHO - 300, 470);
  ctx.stroke();
  estrella(ctx, ANCHO / 2, 470, 16, "#C9A227");

  ctx.fillStyle = "#44403C";
  ctx.font = `500 36px ${sans}`;
  ctx.fillText("Papá Noel certifica que", ANCHO / 2, 570);

  // Nombre, achicando la letra si es largo
  let tam = 120;
  ctx.font = `600 ${tam}px ${serif}`;
  while (ctx.measureText(nombre).width > ANCHO - 260 && tam > 60) {
    tam -= 6;
    ctx.font = `600 ${tam}px ${serif}`;
  }
  ctx.fillStyle = "#9E1B24";
  ctx.fillText(nombre, ANCHO / 2, 720);

  ctx.fillStyle = "#44403C";
  ctx.font = `500 36px ${sans}`;
  const anotade = genero === "nina" ? "anotada" : "anotado";
  const cuerpo =
    genero === "nina" || genero === "nino"
      ? `habló hoy con Papá Noel en persona y quedó ${anotade} en su cuaderno mágico. Los duendes ya están al tanto.`
      : "habló hoy con Papá Noel en persona y su nombre ya está en el cuaderno mágico. Los duendes ya están al tanto.";
  partirEnLineas(ctx, cuerpo, ANCHO - 300).forEach((linea, i) => {
    ctx.fillText(linea, ANCHO / 2, 820 + i * 54);
  });

  // Sello
  ctx.save();
  ctx.translate(ANCHO / 2, 1080);
  ctx.fillStyle = "#9E1B24";
  ctx.beginPath();
  ctx.arc(0, 0, 78, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#F1E6D2";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, 64, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#FFFBF3";
  ctx.font = `600 56px ${serif}`;
  ctx.textBaseline = "middle";
  ctx.fillText("PN", 0, 4);
  ctx.restore();

  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#57534E";
  ctx.font = `500 30px ${sans}`;
  ctx.fillText(fechaDeHoy(), ANCHO / 2, 1200);

  ctx.fillStyle = "#163829";
  ctx.font = `600 28px ${sans}`;
  ctx.fillText("papa-noel-ai.vercel.app", ANCHO / 2, 1252);

  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}

export default function CertificadoNinoBueno({ nombre, genero }) {
  const [estado, setEstado] = useState("listo"); // listo | armando | hecho
  const nombreLimpio = (nombre || "").trim().slice(0, 30);

  if (!nombreLimpio) return null;

  const generar = async () => {
    setEstado("armando");
    try {
      const blob = await dibujarCertificado(nombreLimpio, genero);
      if (!blob) throw new Error("sin imagen");
      const archivo = new File([blob], `certificado-${nombreLimpio.toLowerCase().replace(/[^a-z0-9áéíóúñ]+/gi, "-")}.png`, {
        type: "image/png",
      });

      if (navigator.canShare?.({ files: [archivo] })) {
        try {
          await navigator.share({ files: [archivo], title: "Certificado de niño bueno" });
          setEstado("hecho");
          return;
        } catch (e) {
          if (e?.name === "AbortError") {
            setEstado("listo");
            return;
          }
          // Si falla el compartir, se descarga
        }
      }

      const url = URL.createObjectURL(archivo);
      const a = document.createElement("a");
      a.href = url;
      a.download = archivo.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      setEstado("hecho");
    } catch {
      setEstado("listo");
    }
  };

  return (
    <div className="mt-6 rounded-2xl border border-[#E8D9A8] bg-[#FFF9EA] px-4 py-4">
      <p className="text-sm font-bold text-[#163829]">
        🎖️ {nombreLimpio} ya está en la Lista de {genero === "nina" ? "Niñas Buenas" : "Niños Buenos"}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-[#57534E]">
        Guardá su certificado firmado por Papá Noel para imprimirlo o mandarlo a la familia.
      </p>
      <button
        onClick={generar}
        disabled={estado === "armando"}
        className="mt-3 min-h-[48px] w-full cursor-pointer touch-manipulation rounded-2xl bg-[#9E1B24] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#82151D] disabled:opacity-60"
      >
        {estado === "armando"
          ? "Preparando el certificado..."
          : estado === "hecho"
            ? "¡Listo! Bajarlo de nuevo"
            : "Descargar certificado de niño bueno"}
      </button>
    </div>
  );
}
