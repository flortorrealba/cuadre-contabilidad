import { Resend } from "resend";

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Falta la variable de entorno RESEND_API_KEY");
  }
  return new Resend(apiKey);
}

// Importante: NUNCA se debe usar VERCEL_URL como base para links que se envían por correo —
// esa variable apunta al deployment específico que está corriendo (una URL de preview con un
// hash aleatorio), que Vercel protege con su propio SSO. Al pasar por esa protección, la
// cadena de redirecciones de Vercel pierde el query string y el link llega sin el token.
// VERCEL_PROJECT_PRODUCTION_URL, en cambio, es el dominio de producción estable del proyecto
// (público, sin esa protección), sin importar desde qué deployment se esté ejecutando el
// código — por eso se prefiere. APP_URL permite fijarlo a mano si se necesita.
export function obtenerUrlBase() {
  if (process.env.APP_URL) return process.env.APP_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export async function enviarCorreoRecuperacion(email: string, nombre: string, resetUrl: string) {
  const resend = getResend();
  const remitente = process.env.RESEND_FROM_EMAIL || "Cuadre de Auxiliares <onboarding@resend.dev>";

  await resend.emails.send({
    from: remitente,
    to: email,
    subject: "Recupera tu contraseña — Cuadre de Auxiliares",
    html: `
      <p>Hola ${nombre},</p>
      <p>Recibimos una solicitud para restablecer tu contraseña en Cuadre de Auxiliares.</p>
      <p><a href="${resetUrl}">Click aquí para crear una contraseña nueva</a></p>
      <p>Este link es válido por 1 hora. Si tú no pediste esto, puedes ignorar este correo.</p>
    `,
  });
}
