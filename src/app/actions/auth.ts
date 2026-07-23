"use server";

import { redirect } from "next/navigation";
import { randomBytes, createHash } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession, hashPassword, verifyPassword, requireUser } from "@/lib/auth";
import { enviarCorreoRecuperacion, obtenerUrlBase } from "@/lib/email";

export interface ActionState {
  error?: string;
}

const registroSchema = z.object({
  nombre: z.string().trim().min(2, "El nombre es muy corto"),
  email: z.email("Correo inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export async function registerAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = registroSchema.safeParse({
    nombre: formData.get("nombre"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const { nombre, email, password } = parsed.data;

  const existente = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existente) {
    return { error: "Ya existe una cuenta con ese correo" };
  }

  const user = await prisma.user.create({
    data: { nombre, email: email.toLowerCase(), passwordHash: await hashPassword(password) },
  });
  await createSession(user.id);
  redirect("/empresas");
}

const loginSchema = z.object({
  email: z.email("Correo inválido"),
  password: z.string().min(1, "Ingresa tu contraseña"),
});

export async function loginAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Correo o contraseña incorrectos" };
  }
  await createSession(user.id);
  redirect("/empresas");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}

const cambiarPasswordSchema = z
  .object({
    passwordActual: z.string().min(1, "Ingresa tu contraseña actual"),
    passwordNueva: z.string().min(8, "La nueva contraseña debe tener al menos 8 caracteres"),
    passwordConfirmacion: z.string().min(1, "Confirma tu nueva contraseña"),
  })
  .refine((data) => data.passwordNueva === data.passwordConfirmacion, {
    message: "Las contraseñas nuevas no coinciden",
    path: ["passwordConfirmacion"],
  });

export interface CambiarPasswordState {
  error?: string;
  ok?: boolean;
}

export async function cambiarPasswordAction(
  _prevState: CambiarPasswordState,
  formData: FormData
): Promise<CambiarPasswordState> {
  const user = await requireUser();

  const parsed = cambiarPasswordSchema.safeParse({
    passwordActual: formData.get("passwordActual"),
    passwordNueva: formData.get("passwordNueva"),
    passwordConfirmacion: formData.get("passwordConfirmacion"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const valida = await verifyPassword(parsed.data.passwordActual, user.passwordHash);
  if (!valida) {
    return { error: "Tu contraseña actual no es correcta" };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(parsed.data.passwordNueva) },
  });

  return { ok: true };
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

const RESET_TOKEN_DURATION_MS = 60 * 60 * 1000; // 1 hora

const olvidePasswordSchema = z.object({
  email: z.email("Correo inválido"),
});

export interface OlvidePasswordState {
  error?: string;
  ok?: boolean;
}

export async function requestPasswordResetAction(
  _prevState: OlvidePasswordState,
  formData: FormData
): Promise<OlvidePasswordState> {
  const parsed = olvidePasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });

  // No revelamos si el correo existe o no, para no filtrar qué correos están registrados.
  if (user) {
    try {
      const token = randomBytes(32).toString("hex");
      await prisma.$transaction([
        prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } }),
        prisma.passwordResetToken.create({
          data: {
            userId: user.id,
            tokenHash: hashToken(token),
            expiresAt: new Date(Date.now() + RESET_TOKEN_DURATION_MS),
          },
        }),
      ]);

      const resetUrl = `${obtenerUrlBase()}/restablecer-contrasena?token=${token}`;
      await enviarCorreoRecuperacion(user.email, user.nombre, resetUrl);
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? `No se pudo enviar el correo: ${error.message}`
            : "No se pudo enviar el correo de recuperación",
      };
    }
  }

  return { ok: true };
}

const restablecerPasswordSchema = z
  .object({
    token: z.string().min(1),
    passwordNueva: z.string().min(8, "La nueva contraseña debe tener al menos 8 caracteres"),
    passwordConfirmacion: z.string().min(1, "Confirma tu nueva contraseña"),
  })
  .refine((data) => data.passwordNueva === data.passwordConfirmacion, {
    message: "Las contraseñas no coinciden",
    path: ["passwordConfirmacion"],
  });

export interface RestablecerPasswordState {
  error?: string;
}

export async function resetPasswordAction(
  _prevState: RestablecerPasswordState,
  formData: FormData
): Promise<RestablecerPasswordState> {
  const parsed = restablecerPasswordSchema.safeParse({
    token: formData.get("token"),
    passwordNueva: formData.get("passwordNueva"),
    passwordConfirmacion: formData.get("passwordConfirmacion"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const registro = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(parsed.data.token) },
  });

  if (!registro || registro.usedAt || registro.expiresAt < new Date()) {
    return { error: "Este link de recuperación no es válido o ya venció. Solicita uno nuevo." };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: registro.userId },
      data: { passwordHash: await hashPassword(parsed.data.passwordNueva) },
    }),
    prisma.passwordResetToken.update({
      where: { id: registro.id },
      data: { usedAt: new Date() },
    }),
  ]);

  await createSession(registro.userId);
  redirect("/empresas");
}
