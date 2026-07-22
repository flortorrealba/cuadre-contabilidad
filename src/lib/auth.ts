import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const SESSION_COOKIE = "cuadre_contabilidad_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 30; // 30 dias

function getSecretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("Falta la variable de entorno AUTH_SECRET");
  }
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    const userId = payload.userId as string;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    return user;
  } catch {
    return null;
  }
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new AuthError("No autenticado");
  }
  return user;
}

export class AuthError extends Error {}

export async function requireEmpresaAccess(userId: string, empresaId: string) {
  const membership = await prisma.empresaMember.findUnique({
    where: { userId_empresaId: { userId, empresaId } },
  });
  if (!membership) {
    throw new AuthError("No tienes acceso a esta empresa");
  }
  return membership;
}

// Los "MIEMBRO" pueden entrar a la empresa y subir auxiliares/balance, pero no pueden
// eliminar cargas, editar los datos de la empresa ni administrar otros miembros — eso
// requiere rol "ADMIN".
export async function requireEmpresaAdmin(userId: string, empresaId: string) {
  const membership = await requireEmpresaAccess(userId, empresaId);
  if (membership.rol !== "ADMIN") {
    throw new AuthError("Solo un administrador de la empresa puede hacer esto");
  }
  return membership;
}

// Para que las páginas puedan decidir qué mostrar (botones de eliminar, formularios de
// administración) según el rol del usuario actual en esta empresa.
export async function esAdminDeEmpresa(empresaId: string) {
  const user = await getCurrentUser();
  if (!user) return false;
  const membership = await prisma.empresaMember.findUnique({
    where: { userId_empresaId: { userId: user.id, empresaId } },
  });
  return membership?.rol === "ADMIN";
}
