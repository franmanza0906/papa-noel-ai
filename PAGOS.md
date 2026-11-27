# Activar los pagos con Mercado Pago

Los packs están programados pero **apagados**. Mientras `PAGOS_ACTIVOS` no sea `true`, la web sigue 100 % gratis y `/packs` muestra "muy pronto".

## Cómo funciona
1. El papá elige un pack en `/packs` y paga en Mercado Pago (Checkout Pro: tarjeta, dinero en cuenta o efectivo).
2. Mercado Pago avisa a `/api/webhook-mercadopago`. El servidor consulta el pago y, si está aprobado, crea un código `NOEL-XXXX-XXXX` en la tabla `pases`.
3. Mercado Pago lo devuelve a `/pago/resultado`, donde ve su código. El código queda guardado en ese navegador.
4. En el formulario toca "Tengo un código de pack". Cada llamada descuenta una del código y no usa el cupo gratis.

Precios y packs: `src/lib/packs.js`.

## Pasos para activarlo
1. **Supabase:** abrí SQL Editor, pegá `supabase/pagos.sql` y ejecutalo una vez.
2. **Mercado Pago:** entrá a https://www.mercadopago.com.ar/developers/panel/app, creá una aplicación de tipo "Pagos online / Checkout Pro" y copiá el **Access Token de producción**.
3. **Webhook:** en esa aplicación, andá a Webhooks > Configurar notificaciones > Modo productivo. Usá la URL `https://papa-noel-ai.vercel.app/api/webhook-mercadopago`, marcá el evento **Pagos** y copiá la **clave secreta**.
4. **Vercel:** en Settings > Environment Variables (Production), agregá:
   - `MP_ACCESS_TOKEN`: el access token
   - `MP_WEBHOOK_SECRET`: la clave secreta del webhook
   - `SITE_URL`: `https://papa-noel-ai.vercel.app`
   - `PAGOS_ACTIVOS`: `true`
5. Publicá de nuevo (`npx vercel --prod`).
6. **ElevenLabs:** subí el "Límite diario de llamadas" del agente (hoy está en 30), porque también frena las llamadas pagas.

## Probar antes de cobrar de verdad
Con credenciales de prueba de Mercado Pago y usuarios de prueba podés hacer una compra completa sin dinero real. Los pagos de prueba no mandan webhook, pero `/pago/resultado` igual consulta el pago y genera el código.

## Antes de cobrar
- Para facturar en Argentina vas a necesitar estar inscripto (por ejemplo, en el monotributo).
- Mercado Pago cobra una comisión por cada venta, que depende de en cuántos días querés recibir la plata. Revisá en tu cuenta cuánto es.
