"use client";

import { deleteBalanceAction } from "@/app/actions/balance";

export function DeleteBalanceButton({ empresaId, cargaId }: { empresaId: string; cargaId: string }) {
  return (
    <form
      action={deleteBalanceAction}
      onSubmit={(e) => {
        if (!confirm("¿Eliminar este balance? Esta acción no se puede deshacer.")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="empresaId" value={empresaId} />
      <input type="hidden" name="cargaId" value={cargaId} />
      <button type="submit" className="text-sm text-red-600 hover:underline">
        Eliminar balance
      </button>
    </form>
  );
}
