import { Resend } from "resend";

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Falta la variable de entorno RESEND_API_KEY");
  }
  return new Resend(apiKey);
}

export function obtenerUrlBase() {
  if (process.env.APP_URL) return process.env.APP_URL;
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
