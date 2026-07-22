const formatoMoneda = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

export function formatearMonto(valor: number) {
  return formatoMoneda.format(Math.round(valor));
}

const formatoFecha = new Intl.DateTimeFormat("es-CL", { dateStyle: "medium", timeZone: "UTC" });

export function formatearFecha(fecha: Date) {
  return formatoFecha.format(fecha);
}

export const TIPOS_AUXILIAR = {
  PROVEEDORES: "Cuentas por Pagar Proveedores",
  HONORARIOS: "Honorarios",
  CLIENTES: "Clientes",
} as const;

export type TipoAuxiliar = keyof typeof TIPOS_AUXILIAR;

export const SLUG_A_TIPO: Record<string, TipoAuxiliar> = {
  proveedores: "PROVEEDORES",
  honorarios: "HONORARIOS",
  clientes: "CLIENTES",
};
