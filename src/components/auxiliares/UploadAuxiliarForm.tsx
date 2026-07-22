"use client";

import { useActionState } from "react";
import { uploadAuxiliarAction, type AuxiliarState } from "@/app/actions/auxiliares";
import type { TipoAuxiliar } from "@/lib/format";

const initialState: AuxiliarState = {};

export function UploadAuxiliarForm({ empresaId, tipo, etiqueta }: { empresaId: string; tipo: TipoAuxiliar; etiqueta: string }) {
  const action = uploadAuxiliarAction.bind(null, empresaId, tipo);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-3 rounded-md border border-neutral-200 bg-white p-4">
      <div>
        <h3 className="text-sm font-semibold text-neutral-900">Auxiliar de {etiqueta} (iContador)</h3>
        <p className="mt-1 text-sm text-neutral-500">
          Sube el reporte de Facturas/Honorarios Pendientes de Pago que exporta iContador para esta cuenta. La
          app ordena los documentos pendientes al cierre del período, netos de notas de crédito y pagos
          aplicados. Subir un archivo nuevo reemplaza la carga anterior de esta sección.
        </p>
      </div>
      <input
        name="archivo"
        type="file"
        accept=".xlsx,.xlsm,.xls"
        required
        className="block w-full max-w-md text-sm text-neutral-600 file:mr-3 file:rounded-md file:border-0 file:bg-neutral-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-neutral-700"
      />
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.ok && <p className="text-sm text-green-700">✅ Archivo procesado.</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 disabled:opacity-50"
      >
        {pending ? "Procesando…" : "Subir auxiliar"}
      </button>
    </form>
  );
}
