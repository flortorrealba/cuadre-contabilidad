import { NextResponse } from "next/server";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser, requireEmpresaAccess, AuthError } from "@/lib/auth";
import { generarExcelCompleto, nombreArchivo } from "@/lib/export/excel";
import { obtenerSeccionesCompletas } from "@/lib/export/datos-empresa";

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

  const secciones = await obtenerSeccionesCompletas(empresaId, empresa.nombre);
  if (secciones.length === 0) {
    return NextResponse.json(
      { error: "Todavía no has subido el Balance ni ningún auxiliar para esta empresa" },
      { status: 400 }
    );
  }

  const buffer = await generarExcelCompleto(secciones);
  const titulo = `${empresa.nombre} — Balance y Auxiliares`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${nombreArchivo(titulo, "xlsx")}"`,
    },
  });
}
