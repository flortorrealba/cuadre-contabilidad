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

export async function generarExcelFacturasPendientes(datos: DatosExportar): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Facturas Pendientes");

  sheet.columns = [
    { width: 16 },
    { width: 42 },
    { width: 14 },
    { width: 10 },
    { width: 16 },
    { width: 18 },
  ];

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
