import { prisma } from "@/lib/prisma";
import { formatearFecha } from "@/lib/format";
import { UploadBalanceForm } from "@/components/balance/UploadBalanceForm";
import { BalanceTable } from "@/components/balance/BalanceTable";
import { DeleteBalanceButton } from "@/components/balance/DeleteBalanceButton";

export default async function BalancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: empresaId } = await params;

  const carga = await prisma.cargaBalance.findFirst({
    where: { empresaId },
    orderBy: { createdAt: "desc" },
    include: { cuentas: { orderBy: { codigo: "asc" } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-neutral-900">Balance General</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Balance General (8 Columnas) tal como lo exporta iContador, por cuenta.
        </p>
      </div>

      <UploadBalanceForm empresaId={empresaId} />

      {carga ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-neutral-500">
            <p>
              {carga.periodoDesde && carga.periodoHasta
                ? `Período ${formatearFecha(carga.periodoDesde)} a ${formatearFecha(carga.periodoHasta)} · `
                : ""}
              {carga.archivoOrigen ?? "archivo subido"} · {carga.cuentas.length} cuenta
              {carga.cuentas.length === 1 ? "" : "s"}
            </p>
            <div className="flex items-center gap-3">
              <a
                href={`/empresas/${empresaId}/balance/export/excel`}
                className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
              >
                Descargar Excel
              </a>
              <a
                href={`/empresas/${empresaId}/balance/export/pdf`}
                className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
              >
                Descargar PDF
              </a>
              <DeleteBalanceButton empresaId={empresaId} cargaId={carga.id} />
            </div>
          </div>
          <BalanceTable
            cuentas={carga.cuentas}
            totalDebitos={carga.totalDebitos}
            totalCreditos={carga.totalCreditos}
          />
        </div>
      ) : (
        <p className="text-sm text-neutral-500">Todavía no has subido el Balance General.</p>
      )}
    </div>
  );
}
