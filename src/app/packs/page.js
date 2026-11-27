"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

function formatearPrecio(ars) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(ars);
}

export default function PacksPage() {
  const [info, setInfo] = useState(null);
  const [comprando, setComprando] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/packs")
      .then((r) => r.json())
      .then(setInfo)
      .catch(() => setInfo({ activos: false, packs: [] }));
  }, []);

  const comprar = async (packId) => {
    setError("");
    setComprando(packId);
    try {
      const res = await fetch("/api/crear-pago", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error);
      window.location.assign(data.url);
    } catch (e) {
      setError(e.message || "No pudimos iniciar el pago. Intentá de nuevo.");
      setComprando(null);
    }
  };

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
          Más llamadas con Papá Noel
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[#57534E]">
          Pagás una sola vez con Mercado Pago y recibís un código para usar
          cuando quieras, desde cualquier celular. Cada llamada dura 90
          segundos, igual que las gratis.
        </p>

        {!info && <p className="mt-8 text-sm text-[#57534E]">Cargando...</p>}

        {info && !info.activos && (
          <div className="mt-8 rounded-2xl border border-[#DCE8E0] bg-[#F4F8F5] px-4 py-4 text-sm text-[#163829]">
            <strong>¡Por ahora es gratis!</strong> Los packs de llamadas van a
            estar disponibles muy pronto. Mientras tanto, cada celular tiene
            sus llamadas gratis.
          </div>
        )}

        {info?.activos && (
          <div className="mt-6 space-y-3">
            {info.packs.map((p) => (
              <div
                key={p.id}
                className={`rounded-[24px] border bg-white p-5 ${
                  p.destacado ? "border-[#163829] ring-2 ring-[#163829]/15" : "border-[#E5DBC9]"
                }`}
              >
                {p.destacado && (
                  <span className="mb-2 inline-block rounded-full bg-[#163829] px-2.5 py-0.5 text-xs font-bold text-white">
                    El más elegido
                  </span>
                )}
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="text-lg font-bold text-[#163829]">{p.nombre}</h2>
                  <span className="text-xl font-bold">{formatearPrecio(p.precioARS)}</span>
                </div>
                <p className="mt-1 text-sm text-[#44403C]">
                  {p.llamadas} llamadas · {formatearPrecio(Math.round(p.precioARS / p.llamadas))} cada una
                </p>
                {p.detalle && <p className="mt-1 text-sm text-[#57534E]">{p.detalle}</p>}
                <button
                  type="button"
                  disabled={comprando !== null}
                  onClick={() => comprar(p.id)}
                  className="mt-4 min-h-[50px] w-full cursor-pointer rounded-2xl bg-[#009EE3] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0086C3] disabled:opacity-60"
                >
                  {comprando === p.id ? "Abriendo Mercado Pago..." : "Pagar con Mercado Pago"}
                </button>
              </div>
            ))}
            {error && (
              <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-[#9E1B24]">
                {error}
              </p>
            )}
            <p className="pt-2 text-center text-xs text-[#6B655E]">
              Podés pagar con tarjeta, dinero en cuenta o efectivo. El código
              aparece apenas se acredita el pago.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
