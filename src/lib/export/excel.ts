import ExcelJS from "exceljs";
import { formatearFecha } from "@/lib/format";

export interface FilaExportar {
  entidadRut: string;
  entidadNombre: string;
  fecha: Date | null;
  tipoDocumento: string | null;
  numero: string;
  saldo: number;
}

export interface DatosExportar {
  titulo: string;
  subtitulo: string;
  facturas: FilaExportar[];
  total: number;
}

export interface CuentaBalanceExportar {
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

export interface DatosExportarBalance {
  titulo: string;
  subtitulo: string;
  cuentas: CuentaBalanceExportar[];
  totalDebitos: number;
  totalCreditos: number;
}

function agregarHojaFacturas(workbook: ExcelJS.Workbook, nombreHoja: string, datos: DatosExportar) {
  const sheet = workbook.addWorksheet(nombreHoja);

  sheet.columns = [{ width: 16 }, { width: 42 }, { width: 14 }, { width: 10 }, { width: 16 }, { width: 18 }];

  sheet.mergeCells("A1:F1");
  sheet.getCell("A1").value = datos.titulo;
  sheet.getCell("A1").font = { bold: true, size: 14 };

  sheet.mergeCells("A2:F2");
  sheet.getCell("A2").value = datos.subtitulo;
  sheet.getCell("A2").font = { italic: true, size: 10, color: { argb: "FF555555" } };

  sheet.addRow([]);

  const headerRow = sheet.addRow([
    "RUT",
    "Cliente / Proveedor / Persona",
    "Fecha",
    "Tipo",
    "Número",
    "Saldo Pendiente",
  ]);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true };
    cell.border = { bottom: { style: "medium" } };
  });

  for (const f of datos.facturas) {
    const row = sheet.addRow([
      f.entidadRut,
      f.entidadNombre,
      f.fecha ? formatearFecha(f.fecha) : "",
      f.tipoDocumento ?? "",
      f.numero,
      f.saldo,
    ]);
    row.getCell(6).numFmt = "#,##0";
  }

  const totalRow = sheet.addRow(["", "", "", "", "Total pendiente", datos.total]);
  totalRow.eachCell((cell) => {
    cell.font = { bold: true };
    cell.border = { top: { style: "medium" } };
  });
  totalRow.getCell(6).numFmt = "#,##0";
}

function agregarHojaBalance(workbook: ExcelJS.Workbook, nombreHoja: string, datos: DatosExportarBalance) {
  const sheet = workbook.addWorksheet(nombreHoja);

  sheet.columns = [
    { width: 12 },
    { width: 32 },
    { width: 15 },
    { width: 15 },
    { width: 15 },
    { width: 15 },
    { width: 15 },
    { width: 15 },
    { width: 15 },
    { width: 15 },
  ];

  sheet.mergeCells("A1:J1");
  sheet.getCell("A1").value = datos.titulo;
  sheet.getCell("A1").font = { bold: true, size: 14 };

  sheet.mergeCells("A2:J2");
  sheet.getCell("A2").value = datos.subtitulo;
  sheet.getCell("A2").font = { italic: true, size: 10, color: { argb: "FF555555" } };

  sheet.addRow([]);

  const encabezados = [
    "Código",
    "Cuenta",
    "Débitos",
    "Créditos",
    "Deudor",
    "Acreedor",
    "Activo",
    "Pasivo",
    "Pérdidas",
    "Ganancias",
  ];
  const headerRow = sheet.addRow(encabezados);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true };
    cell.border = { bottom: { style: "medium" } };
  });

  let totalDeudor = 0,
    totalAcreedor = 0,
    totalActivo = 0,
    totalPasivo = 0,
    totalPerdidas = 0,
    totalGanancias = 0;

  for (const c of datos.cuentas) {
    const row = sheet.addRow([
      c.codigo ?? "",
      c.nombre,
      c.debitos,
      c.creditos,
      c.deudor,
      c.acreedor,
      c.activo,
      c.pasivo,
      c.perdidas,
      c.ganancias,
    ]);
    for (let col = 3; col <= 10; col++) row.getCell(col).numFmt = "#,##0";
    totalDeudor += c.deudor;
    totalAcreedor += c.acreedor;
    totalActivo += c.activo;
    totalPasivo += c.pasivo;
    totalPerdidas += c.perdidas;
    totalGanancias += c.ganancias;
  }

  const totalRow = sheet.addRow([
    "",
    "Totales",
    datos.totalDebitos,
    datos.totalCreditos,
    totalDeudor,
    totalAcreedor,
    totalActivo,
    totalPasivo,
    totalPerdidas,
    totalGanancias,
  ]);
  totalRow.eachCell((cell) => {
    cell.font = { bold: true };
    cell.border = { top: { style: "medium" } };
  });
  for (let col = 3; col <= 10; col++) totalRow.getCell(col).numFmt = "#,##0";
}

export async function generarExcelFacturasPendientes(datos: DatosExportar): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  agregarHojaFacturas(workbook, "Facturas Pendientes", datos);
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export async function generarExcelBalance(datos: DatosExportarBalance): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  agregarHojaBalance(workbook, "Balance", datos);
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export interface SeccionCompleta {
  nombreHoja: string;
  balance?: DatosExportarBalance;
  facturas?: DatosExportar;
}

// Arma un solo libro con una hoja por cada sección disponible (Balance, Proveedores,
// Honorarios, Clientes), en ese orden — para descargar todo junto.
export async function generarExcelCompleto(secciones: SeccionCompleta[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  for (const seccion of secciones) {
    if (seccion.balance) agregarHojaBalance(workbook, seccion.nombreHoja, seccion.balance);
    else if (seccion.facturas) agregarHojaFacturas(workbook, seccion.nombreHoja, seccion.facturas);
  }
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export function nombreArchivo(titulo: string, extension: string) {
  const slug = titulo
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return `${slug || "facturas-pendientes"}.${extension}`;
}
