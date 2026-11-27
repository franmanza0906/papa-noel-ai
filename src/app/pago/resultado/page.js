"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function Resultado() {
  const params = useSearchParams();
  const referencia = params.get("ref");
  const paymentId = params.get("payment_id");
  const estadoMP = params.get("status") || params.get("collection_status");

  const [estado, setEstado] = useState(
    estadoMP === "rejected" || estadoMP === "null" ? "rejected" : "buscando"
  );
  const [pase, setPase] = useState(null);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    if (!referencia || estado !== "buscando") return;
    let intentos = 0;
    let timer;
    let cancelado = false;

    const consultar = async () => {
      intentos++;
      try {
        const qs = new URLSearchParams({ ref: referencia });
        if (paymentId && paymentId !== "null") qs.set("payment_id", paymentId);
        const res = await fetch(`/api/pago-estado?${qs}`);
        const data = await res.json();
        if (cancelado) return;
        if (data.estado === "approved" && data.codigo) {
          setPase(data);
          setEstado("approved");
          try {
            localStorage.setItem("papaNoelCodigo", data.codigo);
          } catch {
            // Sin almacenamiento local
          }
          return;
        }
        if (data.estado === "rejected" || data.estado === "cancelled") {
          setEstado("rejected");
          return;
        }
      } catch {
        // Reintentamos
      }
      if (intentos < 20) {
        timer = setTimeout(consultar, 3000);
      } else if (!cancelado) {
        setEstado("pendiente");
      }
    };

    consultar();
    return () => {
      cancelado = true;
      clearTimeout(timer);
    };
  }, [referencia, paymentId, estado]);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(pase.codigo);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      // Sin portapapeles
    }
  };

  return (
    <div className="w-full max-w-md rounded-[28px] border border-[#E5DBC9] bg-white p-7 text-center">
      {estado === "buscando" && (
        <>
          <h1 className="font-serif text-2xl font-semibold text-[#163829]">
            Confirmando tu pago...
          </h1>
          <p className="mt-2 text-sm text-[#57534E]">
            Los duendes están revisando el cuaderno. Esto tarda unos segundos.
          </p>
        </>
      )}

      {estado === "approved" && pase && (
        <>
          <h1 className="font-serif text-2xl font-semibold text-[#163829]">
            ¡Listo! Este es tu código
          </h1>
          <p className="mt-4 select-all rounded-2xl border-2 border-dashed border-[#163829] bg-[#F4F8F5] px-4 py-4 font-mono text-2xl font-bold tracking-wider text-[#163829]">
            {pase.codigo}
          </p>
          <p className="mt-3 text-sm text-[#57534E]">
            Tiene {pase.llamadas_restantes} llamadas. Guardalo: lo podés usar
            desde cualquier celular. En este navegador ya queda cargado.
          </p>
          <div className="mt-6 space-y-3">
            <Link
              href="/"
              className="block min-h-[50px] w-full rounded-2xl bg-[#9E1B24] px-5 py-3.5 text-sm font-bold text-white"
            >
              Preparar una llamada
            </Link>
            <button
              type="button"
              onClick={copiar}
              className="min-h-[48px] w-full cursor-pointer rounded-2xl border border-[#DCD3C4] bg-[#FAF6EF] px-5 py-3 text-sm font-semibold text-[#44403C]"
            >
              {copiado ? "¡Copiado!" : "Copiar código"}
            </button>
          </div>
        </>
      )}

      {estado === "pendiente" && (
        <>
          <h1 className="font-serif text-2xl font-semibold text-[#163829]">
            Tu pago está en proceso
          </h1>
          <p className="mt-2 text-sm text-[#57534E]">
            Si pagaste en efectivo o el pago está en revisión, puede tardar un
            rato. Guardá esta página y volvé a abrirla más tarde: el código va a
            aparecer acá.
          </p>
        </>
      )}

      {estado === "rejected" && (
        <>
          <h1 className="font-serif text-2xl font-semibold text-[#163829]">
            El pago no se completó
          </h1>
          <p className="mt-2 text-sm text-[#57534E]">
            No se te cobró nada. Podés intentarlo de nuevo con otro medio de
            pago.
          </p>
          <Link
            href="/packs"
            className="mt-6 block min-h-[50px] w-full rounded-2xl bg-[#163829] px-5 py-3.5 text-sm font-bold text-white"
          >
            Volver a los packs
          </Link>
        </>
      )}
    </div>
  );
}

export default function PagoResultadoPage() {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[#FAF6EF] px-4 py-10 text-[#1C1917]">
      <Suspense fallback={null}>
        <Resultado />
      </Suspense>
    </main>
  );
}
