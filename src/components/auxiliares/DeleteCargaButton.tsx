"use client";

import { deleteCargaAction } from "@/app/actions/auxiliares";

export function DeleteCargaButton({ empresaId, cargaId }: { empresaId: string; cargaId: string }) {
  return (
    <form
      action={deleteCargaAction}
      onSubmit={(e) => {
        if (!confirm("¿Eliminar esta carga y todos sus documentos pendientes? Esta acción no se puede deshacer.")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="empresaId" value={empresaId} />
      <input type="hidden" name="cargaId" value={cargaId} />
      <button type="submit" className="text-sm text-red-600 hover:underline">
        Eliminar carga
      </button>
    </form>
  );
}
