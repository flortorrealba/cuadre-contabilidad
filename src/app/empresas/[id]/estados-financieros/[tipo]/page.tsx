import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { esAdminDeEmpresa } from "@/lib/auth";
import { formatearFecha, SLUG_A_TIPO, TIPOS_AUXILIAR } from "@/lib/format";
import { UploadAuxiliarForm } from "@/components/auxiliares/UploadAuxiliarForm";
import { FacturasPendientesTable } from "@/components/auxiliares/FacturasPendientesTable";
import { DeleteCargaButton } from "@/components/auxiliares/DeleteCargaButton";

export default async function EstadoFinancieroPage({
  params,
}: {
  params: Promise<{ id: string; tipo: string }>;
}) {
  const { id: empresaId, tipo: tipoSlug } = await params;
  const tipo = SLUG_A_TIPO[tipoSlug];
  if (!tipo) notFound();

  const [carga, esAdmin] = await Promise.all([
    prisma.cargaAuxiliar.findFirst({
      where: { empresaId, tipo },
      orderBy: { createdAt: "desc" },
      include: {
        facturas: { orderBy: [{ entidadNombre: "asc" }, { fecha: "asc" }] },
      },
    }),
    esAdminDeEmpresa(empresaId),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-neutral-900">{TIPOS_AUXILIAR[tipo]}</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Documentos pendientes de pago al cierre del período, netos de notas de crédito y pagos aplicados.
        </p>
      </div>

      <UploadAuxiliarForm empresaId={empresaId} tipo={tipo} etiqueta={TIPOS_AUXILIAR[tipo]} />

      {carga ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-neutral-500">
            <p>
              {carga.cuentaCodigo && carga.cuentaNombre ? `Cuenta ${carga.cuentaCodigo} · ${carga.cuentaNombre} · ` : ""}
              {carga.periodoDesde && carga.periodoHasta
                ? `período ${formatearFecha(carga.periodoDesde)} a ${formatearFecha(carga.periodoHasta)} · `
                : ""}
              {carga.archivoOrigen ?? "archivo subido"} · {carga.facturas.length} documento
              {carga.facturas.length === 1 ? "" : "s"} pendiente{carga.facturas.length === 1 ? "" : "s"}
            </p>
            <div className="flex items-center gap-3">
              <a
                href={`/empresas/${empresaId}/estados-financieros/${tipoSlug}/export/excel`}
                className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
              >
                Descargar Excel
              </a>
              <a
                href={`/empresas/${empresaId}/estados-financieros/${tipoSlug}/export/pdf`}
                className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
              >
                Descargar PDF
              </a>
              {esAdmin && <DeleteCargaButton empresaId={empresaId} cargaId={carga.id} />}
            </div>
          </div>
          <FacturasPendientesTable facturas={carga.facturas} total={carga.totalSaldo} />
        </div>
      ) : (
        <p className="text-sm text-neutral-500">Todavía no has subido el auxiliar de {TIPOS_AUXILIAR[tipo]}.</p>
      )}
    </div>
  );
}
