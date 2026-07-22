import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { esAdminDeEmpresa } from "@/lib/auth";
import { EditEmpresaForm } from "@/components/empresas/EditEmpresaForm";

export default async function ConfiguracionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: empresaId } = await params;

  const [empresa, esAdmin] = await Promise.all([
    prisma.empresa.findUnique({ where: { id: empresaId } }),
    esAdminDeEmpresa(empresaId),
  ]);
  if (!empresa) notFound();

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-neutral-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-neutral-900">Datos de la empresa</h2>
        <div className="mt-3">
          {esAdmin ? (
            <EditEmpresaForm empresaId={empresaId} nombre={empresa.nombre} rut={empresa.rut} />
          ) : (
            <div className="text-sm text-neutral-600">
              <p>{empresa.nombre}</p>
              {empresa.rut && <p className="text-neutral-500">{empresa.rut}</p>}
              <p className="mt-3 text-xs text-neutral-500">
                Solo un administrador de la empresa puede editar estos datos.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
