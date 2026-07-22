import { NextResponse } from "next/server";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser, requireEmpresaAccess, AuthError } from "@/lib/auth";
import { formatearFecha, SLUG_A_TIPO, TIPOS_AUXILIAR } from "@/lib/format";
import { nombreArchivo } from "@/lib/export/excel";
import { generarPdfFacturasPendientes } from "@/lib/export/pdf";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string; tipo: string }> }) {
  const { id: empresaId, tipo: tipoSlug } = await params;
  const tipo = SLUG_A_TIPO[tipoSlug];
  if (!tipo) notFound();

  try {
    const user = await requireUser();
    await requireEmpresaAccess(user.id, empresaId);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    throw error;
  }

  const empresa = await prisma.empresa.findUnique({ where: { id: empresaId } });
  if (!empresa) notFound();

  const carga = await prisma.cargaAuxiliar.findFirst({
    where: { empresaId, tipo },
    orderBy: { createdAt: "desc" },
    include: { facturas: { orderBy: [{ entidadNombre: "asc" }, { fecha: "asc" }] } },
  });
  if (!carga) notFound();

  const titulo = `${empresa.nombre} — ${TIPOS_AUXILIAR[tipo]}`;
  const subtitulo = [
    carga.cuentaCodigo && carga.cuentaNombre ? `Cuenta ${carga.cuentaCodigo} · ${carga.cuentaNombre}` : null,
    carga.periodoDesde && carga.periodoHasta
      ? `Período ${formatearFecha(carga.periodoDesde)} a ${formatearFecha(carga.periodoHasta)}`
      : null,
    `Generado el ${formatearFecha(new Date())}`,
  ]
    .filter(Boolean)
    .join(" · ");

  const buffer = await generarPdfFacturasPendientes({
    titulo,
    subtitulo,
    facturas: carga.facturas,
    total: carga.totalSaldo,
  });

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${nombreArchivo(titulo, "pdf")}"`,
    },
  });
}
