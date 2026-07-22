import { formatearMonto } from "@/lib/format";

interface CuentaFila {
  id: string;
  codigo: string | null;
  nombre: string;
  debitos: number;
  creditos: number;
  deudor: number;
  acreedor: number;
  activo: number;
  pasivo: number;
  perdidas: number;
  ganancias: number;
}

export function BalanceTable({
  cuentas,
  totalDebitos,
  totalCreditos,
}: {
  cuentas: CuentaFila[];
  totalDebitos: number;
  totalCreditos: number;
}) {
  const totalDeudor = cuentas.reduce((s, c) => s + c.deudor, 0);
  const totalAcreedor = cuentas.reduce((s, c) => s + c.acreedor, 0);
  const totalActivo = cuentas.reduce((s, c) => s + c.activo, 0);
  const totalPasivo = cuentas.reduce((s, c) => s + c.pasivo, 0);
  const totalPerdidas = cuentas.reduce((s, c) => s + c.perdidas, 0);
  const totalGanancias = cuentas.reduce((s, c) => s + c.ganancias, 0);

  return (
    <div className="overflow-x-auto rounded-md border border-neutral-200 bg-white">
      <table className="w-full min-w-[980px] text-sm">
        <thead className="bg-neutral-50 text-left text-xs font-bold uppercase text-neutral-700">
          <tr>
            <th className="px-3 py-2">Código</th>
            <th className="px-3 py-2">Cuenta</th>
            <th className="px-3 py-2 text-right">Débitos</th>
            <th className="px-3 py-2 text-right">Créditos</th>
            <th className="px-3 py-2 text-right">Deudor</th>
            <th className="px-3 py-2 text-right">Acreedor</th>
            <th className="px-3 py-2 text-right">Activo</th>
            <th className="px-3 py-2 text-right">Pasivo</th>
            <th className="px-3 py-2 text-right">Pérdidas</th>
            <th className="px-3 py-2 text-right">Ganancias</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {cuentas.map((c) => (
            <tr key={c.id}>
              <td className="px-3 py-1.5 text-neutral-500">{c.codigo ?? "—"}</td>
              <td className="px-3 py-1.5 font-medium text-neutral-900">{c.nombre}</td>
              <td className="px-3 py-1.5 text-right tabular-nums text-neutral-700">{formatearMonto(c.debitos)}</td>
              <td className="px-3 py-1.5 text-right tabular-nums text-neutral-700">{formatearMonto(c.creditos)}</td>
              <td className="px-3 py-1.5 text-right tabular-nums text-neutral-700">
                {c.deudor ? formatearMonto(c.deudor) : "—"}
              </td>
              <td className="px-3 py-1.5 text-right tabular-nums text-neutral-700">
                {c.acreedor ? formatearMonto(c.acreedor) : "—"}
              </td>
              <td className="px-3 py-1.5 text-right tabular-nums text-neutral-700">
                {c.activo ? formatearMonto(c.activo) : "—"}
              </td>
              <td className="px-3 py-1.5 text-right tabular-nums text-neutral-700">
                {c.pasivo ? formatearMonto(c.pasivo) : "—"}
              </td>
              <td className="px-3 py-1.5 text-right tabular-nums text-neutral-700">
                {c.perdidas ? formatearMonto(c.perdidas) : "—"}
              </td>
              <td className="px-3 py-1.5 text-right tabular-nums text-neutral-700">
                {c.ganancias ? formatearMonto(c.ganancias) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-neutral-300 bg-neutral-50 font-semibold text-neutral-900">
            <td className="px-3 py-2" colSpan={2}>
              Totales
            </td>
            <td className="px-3 py-2 text-right tabular-nums">{formatearMonto(totalDebitos)}</td>
            <td className="px-3 py-2 text-right tabular-nums">{formatearMonto(totalCreditos)}</td>
            <td className="px-3 py-2 text-right tabular-nums">{formatearMonto(totalDeudor)}</td>
            <td className="px-3 py-2 text-right tabular-nums">{formatearMonto(totalAcreedor)}</td>
            <td className="px-3 py-2 text-right tabular-nums">{formatearMonto(totalActivo)}</td>
            <td className="px-3 py-2 text-right tabular-nums">{formatearMonto(totalPasivo)}</td>
            <td className="px-3 py-2 text-right tabular-nums">{formatearMonto(totalPerdidas)}</td>
            <td className="px-3 py-2 text-right tabular-nums">{formatearMonto(totalGanancias)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
