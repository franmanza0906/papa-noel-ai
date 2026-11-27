"use client";

import { useState } from "react";

const OPCIONES = [
  { puntaje: 1, emoji: "😞", texto: "Mal" },
  { puntaje: 2, emoji: "😐", texto: "Más o menos" },
  { puntaje: 3, emoji: "🙂", texto: "Bien" },
  { puntaje: 4, emoji: "😄", texto: "Muy bien" },
  { puntaje: 5, emoji: "🤩", texto: "¡Mágico!" },
];

export default function EncuestaFeedback({ edad, acento, conCodigo }) {
  const [puntaje, setPuntaje] = useState(null);
  const [comentario, setComentario] = useState("");
  const [testimonio, setTestimonio] = useState(false);
  const [estado, setEstado] = useState("abierta"); // abierta | enviando | enviada

  const enviar = async (e) => {
    e.preventDefault();
    if (!puntaje) return;
    setEstado("enviando");
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          puntaje,
          comentario: comentario.trim().slice(0, 400),
          permiteTestimonio: testimonio,
          edad,
          acento,
          conCodigo,
        }),
      });
    } catch {
      // Si falla, no molestamos al usuario
    }
    setEstado("enviada");
  };

  if (estado === "enviada") {
    return (
      <p className="mt-5 rounded-2xl bg-[#F4F8F5] px-4 py-3 text-sm font-semibold text-[#163829]">
        ¡Gracias! Los duendes ya lo anotaron en el cuaderno. 🎄
      </p>
    );
  }

  return (
    <form
      onSubmit={enviar}
      className="mt-5 rounded-2xl border border-[#E5DBC9] bg-[#FAF6EF] px-4 py-4 text-left"
    >
      <p className="text-center text-sm font-bold text-[#1C1917]">
        ¿Cómo le fue a tu hijo con Papá Noel?
      </p>
      <div className="mt-3 flex justify-between gap-1">
        {OPCIONES.map((o) => (
          <button
            key={o.puntaje}
            type="button"
            aria-label={o.texto}
            aria-pressed={puntaje === o.puntaje}
            onClick={() => setPuntaje(o.puntaje)}
            className={`flex flex-1 cursor-pointer flex-col items-center rounded-xl py-2 text-2xl transition ${
              puntaje === o.puntaje
                ? "bg-[#163829]/10 ring-2 ring-[#163829]"
                : "hover:bg-[#F0E8DA]"
            }`}
          >
            {o.emoji}
            <span className="mt-0.5 text-[10px] font-semibold text-[#57534E]">
              {o.texto}
            </span>
          </button>
        ))}
      </div>

      {puntaje && (
        <>
          <label htmlFor="comentario" className="mt-4 block text-sm font-semibold text-[#1C1917]">
            {puntaje >= 4
              ? "¿Qué fue lo que más le gustó?"
              : "¿Qué podemos mejorar?"}{" "}
            <span className="font-normal text-[#57534E]">(opcional)</span>
          </label>
          <textarea
            id="comentario"
            rows={3}
            maxLength={400}
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder={
              puntaje >= 4
                ? "Ej: se quedó helado cuando le nombró al perro"
                : "Ej: se cortó, no le entendía, habló muy rápido..."
            }
            className="mt-1.5 w-full rounded-xl border border-[#D6CBB8] bg-white px-3 py-2 text-sm focus:border-[#163829] focus:outline-none"
          />
          {puntaje >= 4 && (
            <label className="mt-2 flex items-start gap-2 text-xs text-[#57534E]">
              <input
                type="checkbox"
                checked={testimonio}
                onChange={(e) => setTestimonio(e.target.checked)}
                className="mt-0.5"
              />
              Pueden mostrar mi comentario en la web, sin nombres.
            </label>
          )}
          <button
            type="submit"
            disabled={estado === "enviando"}
            className="mt-3 min-h-[44px] w-full cursor-pointer rounded-xl bg-[#163829] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
          >
            {estado === "enviando" ? "Enviando..." : "Enviar"}
          </button>
        </>
      )}
    </form>
  );
}
