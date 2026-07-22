import { NextResponse } from "next/server";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser, requireEmpresaAccess, AuthError } from "@/lib/auth";
import { formatearFecha } from "@/lib/format";
import { generarExcelBalance, nombreArchivo } from "@/lib/export/excel";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: empresaId } = await params;

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

  const carga = await prisma.cargaBalance.findFirst({
    where: { empresaId },
    orderBy: { createdAt: "desc" },
    include: { cuentas: { orderBy: { codigo: "asc" } } },
  });
  if (!carga) notFound();

  const titulo = `${empresa.nombre} — Balance General`;
  const subtitulo = [
    carga.periodoDesde && carga.periodoHasta
      ? `Período ${formatearFecha(carga.periodoDesde)} a ${formatearFecha(carga.periodoHasta)}`
      : null,
    `Generado el ${formatearFecha(new Date())}`,
  ]
    .filter(Boolean)
    .join(" · ");

  const buffer = await generarExcelBalance({
    titulo,
    subtitulo,
    cuentas: carga.cuentas,
    totalDebitos: carga.totalDebitos,
    totalCreditos: carga.totalCreditos,
  });

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${nombreArchivo(titulo, "xlsx")}"`,
    },
  });
}
