"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser, requireEmpresaAccess, requireEmpresaAdmin } from "@/lib/auth";
import { parsearBalance } from "@/lib/balance-parser";

export interface BalanceState {
  error?: string;
  ok?: boolean;
}

export async function uploadBalanceAction(
  empresaId: string,
  _prevState: BalanceState,
  formData: FormData
): Promise<BalanceState> {
  const user = await requireUser();
  await requireEmpresaAccess(user.id, empresaId);

  const archivo = formData.get("archivo");
  if (!(archivo instanceof File) || archivo.size === 0) {
    return { error: "Debes adjuntar el Balance General (8 Columnas) que exporta iContador" };
  }

  try {
    const buffer = Buffer.from(await archivo.arrayBuffer());
    const resultado = parsearBalance(buffer);

    await prisma.$transaction([
      prisma.cargaBalance.deleteMany({ where: { empresaId } }),
      prisma.cargaBalance.create({
        data: {
          empresaId,
          periodoDesde: resultado.periodoDesde,
          periodoHasta: resultado.periodoHasta,
          archivoOrigen: archivo.name,
          totalDebitos: resultado.totalDebitos,
          totalCreditos: resultado.totalCreditos,
          creadoPorId: user.id,
          cuentas: {
            create: resultado.cuentas.map((c) => ({
              codigo: c.codigo,
              nombre: c.nombre,
              debitos: c.debitos,
              creditos: c.creditos,
              deudor: c.deudor,
              acreedor: c.acreedor,
              activo: c.activo,
              pasivo: c.pasivo,
              perdidas: c.perdidas,
              ganancias: c.ganancias,
            })),
          },
        },
      }),
    ]);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo procesar el archivo" };
  }

  revalidatePath(`/empresas/${empresaId}/balance`);
  return { ok: true };
}

export async function deleteBalanceAction(formData: FormData) {
  const user = await requireUser();
  const empresaId = String(formData.get("empresaId"));
  const cargaId = String(formData.get("cargaId"));
  await requireEmpresaAdmin(user.id, empresaId);

  const carga = await prisma.cargaBalance.findUnique({ where: { id: cargaId } });
  if (!carga || carga.empresaId !== empresaId) {
    throw new Error("Carga no encontrada");
  }
  await prisma.cargaBalance.delete({ where: { id: cargaId } });
  revalidatePath(`/empresas/${empresaId}/balance`);
}
