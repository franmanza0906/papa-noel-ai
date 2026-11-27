export default function robots() {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/llamada", "/pago/"] },
    sitemap: "https://papa-noel-ai.vercel.app/sitemap.xml",
  };
}
