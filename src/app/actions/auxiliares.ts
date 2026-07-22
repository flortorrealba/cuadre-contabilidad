"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser, requireEmpresaAccess } from "@/lib/auth";
import { parsearAuxiliar } from "@/lib/auxiliar-parser";
import type { TipoAuxiliar } from "@/lib/format";

export interface AuxiliarState {
  error?: string;
  ok?: boolean;
}

export async function uploadAuxiliarAction(
  empresaId: string,
  tipo: TipoAuxiliar,
  _prevState: AuxiliarState,
  formData: FormData
): Promise<AuxiliarState> {
  const user = await requireUser();
  await requireEmpresaAccess(user.id, empresaId);

  const archivo = formData.get("archivo");
  if (!(archivo instanceof File) || archivo.size === 0) {
    return { error: "Debes adjuntar el reporte de Facturas/Honorarios Pendientes de Pago que exporta iContador" };
  }

  try {
    const buffer = Buffer.from(await archivo.arrayBuffer());
    const resultado = parsearAuxiliar(buffer);

    if (resultado.facturas.length === 0) {
      return { error: "No se encontraron documentos pendientes en el archivo" };
    }

    await prisma.$transaction([
      prisma.cargaAuxiliar.deleteMany({ where: { empresaId, tipo } }),
      prisma.cargaAuxiliar.create({
        data: {
          empresaId,
          tipo,
          cuentaCodigo: resultado.cuentaCodigo,
          cuentaNombre: resultado.cuentaNombre,
          periodoDesde: resultado.periodoDesde,
          periodoHasta: resultado.periodoHasta,
          archivoOrigen: archivo.name,
          totalSaldo: resultado.totalSaldo,
          creadoPorId: user.id,
          facturas: {
            create: resultado.facturas.map((f) => ({
              entidadRut: f.entidadRut,
              entidadNombre: f.entidadNombre,
              numero: f.numero,
              fecha: f.fecha,
              tipoDocumento: f.tipoDocumento,
              glosa: f.glosa,
              saldo: f.saldo,
            })),
          },
        },
      }),
    ]);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo procesar el archivo" };
  }

  revalidatePath(`/empresas/${empresaId}/estados-financieros/${tipo.toLowerCase()}`);
  return { ok: true };
}

export async function deleteCargaAction(formData: FormData) {
  const user = await requireUser();
  const empresaId = String(formData.get("empresaId"));
  const cargaId = String(formData.get("cargaId"));
  await requireEmpresaAccess(user.id, empresaId);

  const carga = await prisma.cargaAuxiliar.findUnique({ where: { id: cargaId } });
  if (!carga || carga.empresaId !== empresaId) {
    throw new Error("Carga no encontrada");
  }
  await prisma.cargaAuxiliar.delete({ where: { id: cargaId } });
  revalidatePath(`/empresas/${empresaId}/estados-financieros/${carga.tipo.toLowerCase()}`);
}
