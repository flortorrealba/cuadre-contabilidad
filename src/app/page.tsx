import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) redirect("/empresas");

  return (
    <div className="mx-auto max-w-2xl text-center">
      <h1 className="text-3xl font-bold text-neutral-900">Cuadre de Auxiliares</h1>
      <p className="mt-4 text-neutral-600">
        Sube los auxiliares que exporta iContador para Cuentas por Pagar Proveedores, Honorarios y Clientes,
        por separado, para una o varias empresas. La app ordena las facturas y honorarios pendientes de pago
        al cierre del mes, netos de notas de crédito y pagos aplicados, con el total por cuenta.
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <Link href="/registro" className="rounded-md bg-neutral-900 px-5 py-2.5 text-white hover:bg-neutral-700">
          Crear cuenta
        </Link>
        <Link
          href="/login"
          className="rounded-md border border-neutral-300 px-5 py-2.5 text-neutral-900 hover:bg-neutral-100"
        >
          Ingresar
        </Link>
      </div>
    </div>
  );
}
