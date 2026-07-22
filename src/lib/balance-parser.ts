import * as XLSX from "xlsx";

// Parsea el Balance General (8 Columnas) que exporta iContador: una fila por cuenta con sus
// Débitos/Créditos del período, Saldos Deudor/Acreedor, e Inventario (Activo/Pasivo,
// Pérdidas/Ganancias). Las columnas se detectan por su nombre en la fila de encabezado (no
// por posición fija), porque iContador exporta este reporte con encabezados algo distintos
// según la variante ("Cod. Cuenta"/"Nom. Cuenta" en unas, "Cuenta"/"Nombre" en otras).

function limpiarNumero(valor: unknown): number {
  const texto = String(valor ?? "").trim();
  if (!texto || texto === "-") return 0;
  const numero = Number(texto.replace(/,/g, ""));
  return Number.isNaN(numero) ? 0 : numero;
}

function normalizarEncabezado(valor: unknown): string {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[°º.]/g, "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ");
}

function parseFechaDDMMYYYY(valor: string): Date | null {
  const m = valor.match(/^(\d{1,2})-(\d{2})-(\d{4})$/);
  if (!m) return null;
  const [, d, mo, y] = m;
  const fecha = new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d)));
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

interface ColumnasBalance {
  codigo: number;
  nombre: number;
  debitos: number;
  creditos: number;
  deudor: number;
  acreedor: number;
  activo: number;
  pasivo: number;
  perdidas: number;
  ganancias: number;
}

const ALIAS_COLUMNAS: Record<string, keyof ColumnasBalance> = {
  CUENTA: "codigo",
  "COD CUENTA": "codigo",
  "CODIGO CUENTA": "codigo",
  NOMBRE: "nombre",
  "NOM CUENTA": "nombre",
  "NOMBRE CUENTA": "nombre",
  DEBITOS: "debitos",
  CREDITOS: "creditos",
  DEUDOR: "deudor",
  ACREEDOR: "acreedor",
  ACTIVO: "activo",
  PASIVO: "pasivo",
  PERDIDA: "perdidas",
  PERDIDAS: "perdidas",
  GANANCIA: "ganancias",
  GANANCIAS: "ganancias",
};

function detectarColumnas(fila: unknown[]): Partial<ColumnasBalance> | null {
  const columnas: Partial<ColumnasBalance> = {};
  fila.forEach((celda, idx) => {
    const clave = ALIAS_COLUMNAS[normalizarEncabezado(celda)];
    if (clave && columnas[clave] === undefined) {
      columnas[clave] = idx;
    }
  });
  if (columnas.codigo === undefined || columnas.nombre === undefined) return null;
  if (columnas.debitos === undefined && columnas.creditos === undefined) return null;
  return columnas;
}

function celda(fila: unknown[], indice: number | undefined): unknown {
  if (indice === undefined) return null;
  return fila[indice] ?? null;
}

export interface CuentaBalanceExterna {
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

export interface BalanceParseado {
  periodoDesde: Date | null;
  periodoHasta: Date | null;
  cuentas: CuentaBalanceExterna[];
  totalDebitos: number;
  totalCreditos: number;
}

export function parsearBalance(buffer: Buffer): BalanceParseado {
  const workbook = XLSX.read(buffer, { type: "buffer" });

  for (const nombreHoja of workbook.SheetNames) {
    const filas = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[nombreHoja], {
      header: 1,
      raw: false,
      defval: "",
    });

    let periodoDesde: Date | null = null;
    let periodoHasta: Date | null = null;
    let filaEncabezado = -1;
    let columnas: Partial<ColumnasBalance> | null = null;

    for (let i = 0; i < filas.length; i++) {
      const fila = filas[i];
      for (const c of fila) {
        const m = String(c ?? "").match(/entre el\s+(\d{1,2}-\d{2}-\d{4})\s+y\s+(\d{1,2}-\d{2}-\d{4})/i);
        if (m) {
          periodoDesde = parseFechaDDMMYYYY(m[1]);
          periodoHasta = parseFechaDDMMYYYY(m[2]);
        }
      }
      const posiblesColumnas = detectarColumnas(fila);
      if (posiblesColumnas) {
        filaEncabezado = i;
        columnas = posiblesColumnas;
        break;
      }
    }
    if (filaEncabezado === -1 || !columnas) continue;

    const cuentas: CuentaBalanceExterna[] = [];
    for (let i = filaEncabezado + 1; i < filas.length; i++) {
      const fila = filas[i];
      const codigo = String(celda(fila, columnas.codigo) ?? "").trim();
      const nombre = String(celda(fila, columnas.nombre) ?? "").trim();
      if (!codigo || !nombre) continue;

      cuentas.push({
        codigo,
        nombre,
        debitos: limpiarNumero(celda(fila, columnas.debitos)),
        creditos: limpiarNumero(celda(fila, columnas.creditos)),
        deudor: limpiarNumero(celda(fila, columnas.deudor)),
        acreedor: limpiarNumero(celda(fila, columnas.acreedor)),
        activo: limpiarNumero(celda(fila, columnas.activo)),
        pasivo: limpiarNumero(celda(fila, columnas.pasivo)),
        perdidas: limpiarNumero(celda(fila, columnas.perdidas)),
        ganancias: limpiarNumero(celda(fila, columnas.ganancias)),
      });
    }
    if (cuentas.length === 0) continue;

    const totalDebitos = cuentas.reduce((s, c) => s + c.debitos, 0);
    const totalCreditos = cuentas.reduce((s, c) => s + c.creditos, 0);

    return { periodoDesde, periodoHasta, cuentas, totalDebitos, totalCreditos };
  }

  throw new Error(
    'No se encontró la tabla de cuentas en el archivo (se esperaban encabezados "Cuenta"/"Nombre" o "Cod. Cuenta"/"Nom. Cuenta" con Débitos/Créditos). ¿Es el Balance General que exporta iContador?'
  );
}
