import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export default async function RestablecerContrasenaPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/empresas");

  const { token } = await searchParams;

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-xl font-semibold text-neutral-900">Crear contraseña nueva</h1>
      {token ? (
        <div className="mt-6">
          <ResetPasswordForm token={token} />
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          <p className="text-sm text-red-600">Este link no es válido. Falta el código de recuperación.</p>
          <p className="text-sm text-neutral-600">
            <Link href="/olvide-contrasena" className="text-neutral-900 underline">
              Solicita un link nuevo
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
