import { prisma } from "@/lib/prisma";
import { formatearFecha, TIPOS_AUXILIAR, type TipoAuxiliar } from "@/lib/format";
import type { SeccionCompleta } from "./excel";

// Junta el Balance y los tres auxiliares (Proveedores, Honorarios, Clientes) de una empresa
// en el mismo formato que usan los exportadores de Excel/PDF, para armar el archivo
// combinado ("Descargar todo"). Solo incluye las secciones que ya tienen una carga subida.
export async function obtenerSeccionesCompletas(empresaId: string, empresaNombre: string): Promise<SeccionCompleta[]> {
  const generado = `Generado el ${formatearFecha(new Date())}`;
  const secciones: SeccionCompleta[] = [];

  const cargaBalance = await prisma.cargaBalance.findFirst({
    where: { empresaId },
    orderBy: { createdAt: "desc" },
    include: { cuentas: { orderBy: { codigo: "asc" } } },
  });
  if (cargaBalance) {
    const subtitulo = [
      cargaBalance.periodoDesde && cargaBalance.periodoHasta
        ? `Período ${formatearFecha(cargaBalance.periodoDesde)} a ${formatearFecha(cargaBalance.periodoHasta)}`
        : null,
      generado,
    ]
      .filter(Boolean)
      .join(" · ");
    secciones.push({
      nombreHoja: "Balance",
      balance: {
        titulo: `${empresaNombre} — Balance General`,
        subtitulo,
        cuentas: cargaBalance.cuentas,
        totalDebitos: cargaBalance.totalDebitos,
        totalCreditos: cargaBalance.totalCreditos,
      },
    });
  }

  const tipos: TipoAuxiliar[] = ["PROVEEDORES", "HONORARIOS", "CLIENTES"];
  for (const tipo of tipos) {
    const carga = await prisma.cargaAuxiliar.findFirst({
      where: { empresaId, tipo },
      orderBy: { createdAt: "desc" },
      include: { facturas: { orderBy: [{ entidadNombre: "asc" }, { fecha: "asc" }] } },
    });
    if (!carga) continue;

    const subtitulo = [
      carga.cuentaCodigo && carga.cuentaNombre ? `Cuenta ${carga.cuentaCodigo} · ${carga.cuentaNombre}` : null,
      carga.periodoDesde && carga.periodoHasta
        ? `Período ${formatearFecha(carga.periodoDesde)} a ${formatearFecha(carga.periodoHasta)}`
        : null,
      generado,
    ]
      .filter(Boolean)
      .join(" · ");

    secciones.push({
      nombreHoja: TIPOS_AUXILIAR[tipo],
      facturas: {
        titulo: `${empresaNombre} — ${TIPOS_AUXILIAR[tipo]}`,
        subtitulo,
        facturas: carga.facturas,
        total: carga.totalSaldo,
      },
    });
  }

  return secciones;
}
