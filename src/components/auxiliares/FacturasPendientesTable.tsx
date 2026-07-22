import { formatearFecha, formatearMonto } from "@/lib/format";

interface FacturaFila {
  id: string;
  entidadRut: string;
  entidadNombre: string;
  numero: string;
  fecha: Date | null;
  tipoDocumento: string | null;
  saldo: number;
}

export function FacturasPendientesTable({ facturas, total }: { facturas: FacturaFila[]; total: number }) {
  return (
    <div className="overflow-x-auto rounded-md border border-neutral-200 bg-white">
      <table className="w-full min-w-[720px] text-sm">
        <thead className="bg-neutral-50 text-left text-xs uppercase text-neutral-500">
          <tr>
            <th className="px-3 py-2">RUT</th>
            <th className="px-3 py-2">Cliente / Proveedor / Persona</th>
            <th className="px-3 py-2">Fecha</th>
            <th className="px-3 py-2">Tipo</th>
            <th className="px-3 py-2">Número</th>
            <th className="px-3 py-2 text-right">Saldo pendiente</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {facturas.map((f) => (
            <tr key={f.id}>
              <td className="px-3 py-1.5 text-neutral-500">{f.entidadRut}</td>
              <td className="px-3 py-1.5 font-medium text-neutral-900">{f.entidadNombre}</td>
              <td className="px-3 py-1.5 text-neutral-600">{f.fecha ? formatearFecha(f.fecha) : "—"}</td>
              <td className="px-3 py-1.5 text-neutral-600">{f.tipoDocumento ?? "—"}</td>
              <td className="px-3 py-1.5 text-neutral-600">{f.numero}</td>
              <td className="px-3 py-1.5 text-right tabular-nums text-neutral-900">{formatearMonto(f.saldo)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-neutral-300 bg-neutral-50 font-semibold text-neutral-900">
            <td className="px-3 py-2" colSpan={5}>
              Total pendiente
            </td>
            <td className="px-3 py-2 text-right tabular-nums">{formatearMonto(total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
