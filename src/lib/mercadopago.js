import { MercadoPagoConfig, Payment, Preference } from "mercadopago";

function cliente() {
  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error("Falta configurar MP_ACCESS_TOKEN.");
  }
  return new MercadoPagoConfig({ accessToken, options: { timeout: 8000 } });
}

export function mpPreference() {
  return new Preference(cliente());
}

export function mpPayment() {
  return new Payment(cliente());
}
