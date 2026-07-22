import * as XLSX from "xlsx";

// Parsea el reporte "Facturas/Honorarios Pendientes de Pago" que exporta iContador (hoja
// "ORIGEN") para una cuenta de clientes, proveedores u honorarios, y calcula el saldo
// pendiente real de cada documento al cierre del período, neto de notas de crédito y pagos
// aplicados.
//
// Importante: la columna "Saldo :" que trae el reporte es un saldo CORRIDO por entidad (se
// va acumulando línea a línea a medida que aparecen más documentos de la misma persona), no
// el saldo propio de cada documento. Por eso no se usa esa columna — en vez de eso, se suma
// Débito/Crédito por documento (agrupando las notas de crédito o pagos que lo referencian a
// través de la columna "Voucher") y el saldo de cada documento queda como Crédito - Débito.
// Esto se validó contra el resultado que arma la macro de Excel de la empresa para las
// cuentas de Proveedores y Honorarios, y coincide documento por documento.

function limpiarNumero(valor: unknown): number {
  const texto = String(valor ?? "").trim();
  if (!texto || texto === "-") return 0;
  const numero = Number(texto.replace(/,/g, ""));
  return Number.isNaN(numero) ? 0 : numero;
}

function esFilaFecha(valor: unknown): boolean {
  return /^\d{1,2}-\d{2}-\d{4}$/.test(String(valor ?? "").trim());
}

function parseFechaDDMMYYYY(valor: unknown): Date | null {
  const m = String(valor ?? "").trim().match(/^(\d{1,2})-(\d{2})-(\d{4})$/);
  if (!m) return null;
  const [, d, mo, y] = m;
  const fecha = new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d)));
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

// RUT chileno con puntos de miles y dígito verificador (ej: "76.529.443-6"). Sirve para
// distinguir a las entidades reales de la sección inicial del reporte ("1-9 GENÉRICO"), que
// agrupa saldos de apertura y pagos sin documento asociado y no corresponde a ningún
// cliente/proveedor — por eso se excluye del resultado, igual que hace la macro.
const RUT_VALIDO = /^\d{1,3}(\.\d{3}){1,2}-[\dkK]$/;

function leerFilas(buffer: Buffer): string[][] {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const nombreHoja = workbook.SheetNames.includes("ORIGEN") ? "ORIGEN" : workbook.SheetNames[0];
  const hoja = workbook.Sheets[nombreHoja];
  return XLSX.utils.sheet_to_json<string[]>(hoja, { header: 1, raw: false, defval: "" });
}

export interface FacturaPendienteExterna {
  entidadRut: string;
  entidadNombre: string;
  numero: string;
  fecha: Date | null;
  tipoDocumento: string | null;
  glosa: string | null;
  saldo: number;
}

export interface AuxiliarParseado {
  cuentaCodigo: string | null;
  cuentaNombre: string | null;
  periodoDesde: Date | null;
  periodoHasta: Date | null;
  facturas: FacturaPendienteExterna[];
  totalSaldo: number;
}

interface FacturaAcumulada {
  entidadRut: string;
  entidadNombre: string;
  numero: string;
  fecha: Date | null;
  tipoDocumento: string | null;
  glosa: string | null;
  debe: number;
  haber: number;
}

export function parsearAuxiliar(buffer: Buffer): AuxiliarParseado {
  const filas = leerFilas(buffer);

  let cuentaCodigo: string | null = null;
  let cuentaNombre: string | null = null;
  let periodoDesde: Date | null = null;
  let periodoHasta: Date | null = null;
  let filaEncabezado = -1;

  for (let i = 0; i < filas.length; i++) {
    const fila = filas[i];
    if (String(fila[3] ?? "").trim().toUpperCase() === "CUENTA") {
      const match = String(fila[4] ?? "").match(/\(([^)]+)\)\s*(.*)/);
      if (match) {
        cuentaCodigo = match[1].trim();
        cuentaNombre = match[2].trim();
      }
    }
    if (String(fila[3] ?? "").trim().toUpperCase() === "DESDE") {
      periodoDesde = parseFechaDDMMYYYY(fila[4]);
    }
    if (String(fila[3] ?? "").trim().toUpperCase() === "HASTA") {
      periodoHasta = parseFechaDDMMYYYY(fila[4]);
    }
    if (String(fila[0] ?? "").trim() === "Fecha" && String(fila[1] ?? "").trim().startsWith("Fecha")) {
      filaEncabezado = i;
      break;
    }
  }
  if (filaEncabezado === -1) {
    throw new Error(
      'No se encontró la tabla de documentos (fila con encabezados "Fecha", "Fecha Doc", ...). ¿Es un reporte de Facturas/Honorarios Pendientes de Pago de iContador?'
    );
  }

  const facturas: FacturaPendienteExterna[] = [];
  let entidadRut = "";
  let entidadNombre = "";
  let porNumero = new Map<string, FacturaAcumulada>();

  const cerrarEntidad = () => {
    if (RUT_VALIDO.test(entidadRut.trim())) {
      for (const factura of porNumero.values()) {
        const saldo = factura.haber - factura.debe;
        if (Math.abs(saldo) > 1) {
          facturas.push({
            entidadRut: factura.entidadRut,
            entidadNombre: factura.entidadNombre,
            numero: factura.numero,
            fecha: factura.fecha,
            tipoDocumento: factura.tipoDocumento,
            glosa: factura.glosa,
            saldo,
          });
        }
      }
    }
    porNumero = new Map();
  };

  for (let i = filaEncabezado + 1; i < filas.length; i++) {
    const fila = filas[i];
    const c0 = String(fila[0] ?? "").trim();
    const c1 = String(fila[1] ?? "").trim();
    const c6 = String(fila[6] ?? "").trim();
    const c7 = String(fila[7] ?? "").trim();

    if (!c0 && !c1 && !c6 && !c7) continue;

    if (c0 === "TOTAL") {
      cerrarEntidad();
      break;
    }

    if (esFilaFecha(c0)) {
      const debe = limpiarNumero(fila[6]);
      const haber = limpiarNumero(fila[7]);

      // Las notas de crédito o pagos traen su propio número en la columna "Número", pero la
      // columna "Voucher" referencia el documento que están liquidando con un patrón como
      // "NCE - 10130487" o "FAE - 4102". Cuando esa referencia apunta a un documento ya
      // abierto en este bloque, se acumula ahí en vez de crear uno nuevo.
      const numeroPropio = String(fila[3] ?? "").trim();
      const voucher = String(fila[4] ?? "").trim();
      const referencia = voucher.match(/^\S+\s*-\s*(\S+)$/)?.[1];
      const numero = referencia && porNumero.has(referencia) ? referencia : numeroPropio;

      let factura = porNumero.get(numero);
      if (!factura) {
        factura = {
          entidadRut,
          entidadNombre,
          numero,
          fecha: parseFechaDDMMYYYY(c0),
          tipoDocumento: String(fila[2] ?? "").trim() || null,
          glosa: String(fila[5] ?? "").trim() || null,
          debe: 0,
          haber: 0,
        };
        porNumero.set(numero, factura);
      }
      factura.debe += debe;
      factura.haber += haber;
      continue;
    }

    if (c7 === "Saldo :") continue;

    // Fila de subtotal por entidad: sin fecha/nombre pero con débito o crédito acumulado.
    if (!c0 && !c1 && (c6 || c7)) {
      cerrarEntidad();
      continue;
    }

    // Fila de encabezado de entidad: RUT + Nombre.
    if (c0 && c1) {
      cerrarEntidad();
      entidadRut = c0;
      entidadNombre = c1;
      continue;
    }
  }

  const totalSaldo = facturas.reduce((suma, f) => suma + f.saldo, 0);

  return { cuentaCodigo, cuentaNombre, periodoDesde, periodoHasta, facturas, totalSaldo };
}
