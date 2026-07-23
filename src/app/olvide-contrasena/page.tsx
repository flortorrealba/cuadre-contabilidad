import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { OlvidePasswordForm } from "@/components/auth/OlvidePasswordForm";

export default async function OlvideContrasenaPage() {
  const user = await getCurrentUser();
  if (user) redirect("/empresas");

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-xl font-semibold text-neutral-900">Recuperar contraseña</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Ingresa el correo con el que te registraste y te enviamos un link para crear una contraseña nueva.
      </p>
      <div className="mt-6">
        <OlvidePasswordForm />
      </div>
      <p className="mt-6 text-sm text-neutral-600">
        <Link href="/login" className="text-neutral-900 underline">
          Volver a ingresar
        </Link>
      </p>
    </div>
  );
}
