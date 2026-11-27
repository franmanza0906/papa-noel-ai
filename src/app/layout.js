import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#163829",
};

export const metadata = {
  metadataBase: new URL("https://papa-noel-ai.vercel.app"),
  title: "Papá Noel en Vivo · Llamada mágica con IA",
  description:
    "Cargás sus secretos en segundos y Papá Noel llama en vivo a tus hijos con acento argentino. Gratis, sin cámara y sin descargar nada.",
  openGraph: {
    title: "Papá Noel en Vivo 🎅",
    description:
      "Llamada interactiva en tiempo real con un Papá Noel argentino que sabe los secretos de tus hijos. Gratis y directo desde el celu.",
    url: "https://papa-noel-ai.vercel.app",
    siteName: "Papá Noel en Vivo",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Papá Noel en Vivo desde el Polo Norte",
      },
    ],
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Papá Noel en Vivo 🎅",
    description:
      "Llamada interactiva en tiempo real con un Papá Noel argentino que sabe los secretos de tus hijos. Gratis y directo desde el celu.",
    images: ["/og.png"],
  },
};
export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${fraunces.variable} ${jakarta.variable}`}>
      <body className="min-h-[100dvh] bg-[#FAF6EF] font-sans text-[#1C1917] antialiased selection:bg-[#9E1B24] selection:text-white">
        {children}
        <Analytics />
      </body>
    </html>
  );
}