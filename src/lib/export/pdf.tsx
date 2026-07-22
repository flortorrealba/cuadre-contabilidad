import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import { formatearFecha, formatearMonto } from "@/lib/format";
import type { DatosExportar, DatosExportarBalance, SeccionCompleta } from "./excel";

const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 8, fontFamily: "Helvetica" },
  pageLandscape: { padding: 24, fontSize: 7, fontFamily: "Helvetica" },
  titulo: { fontSize: 14, fontWeight: 700, marginBottom: 2 },
  subtitulo: { fontSize: 9, color: "#555", marginBottom: 12 },
  row: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: "#ddd", paddingVertical: 3 },
  headerRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingVertical: 4,
    backgroundColor: "#f3f3f3",
  },
  totalRow: { flexDirection: "row", borderTopWidth: 1, borderTopColor: "#000", paddingVertical: 4 },
  bold: { fontWeight: 700 },
  cellRut: { width: 85 },
  cellNombre: { width: 220, flexShrink: 0 },
  cellFecha: { width: 60 },
  cellTipo: { width: 45 },
  cellNumero: { width: 75 },
  cellSaldo: { width: 90, textAlign: "right" },
  balCodigo: { width: 55 },
  balCuenta: { width: 160, flexShrink: 0 },
  balNum: { width: 78, textAlign: "right" },
});

function PaginaFacturas({ datos }: { datos: DatosExportar }) {
  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.titulo}>{datos.titulo}</Text>
      <Text style={styles.subtitulo}>{datos.subtitulo}</Text>
      <View style={styles.headerRow} fixed>
        <Text style={[styles.cellRut, styles.bold]}>RUT</Text>
        <Text style={[styles.cellNombre, styles.bold]}>Cliente / Proveedor / Persona</Text>
        <Text style={[styles.cellFecha, styles.bold]}>Fecha</Text>
        <Text style={[styles.cellTipo, styles.bold]}>Tipo</Text>
        <Text style={[styles.cellNumero, styles.bold]}>Número</Text>
        <Text style={[styles.cellSaldo, styles.bold]}>Saldo Pendiente</Text>
      </View>
      {datos.facturas.map((f, i) => (
        <View style={styles.row} key={i} wrap={false}>
          <Text style={styles.cellRut}>{f.entidadRut}</Text>
          <Text style={styles.cellNombre}>{f.entidadNombre}</Text>
          <Text style={styles.cellFecha}>{f.fecha ? formatearFecha(f.fecha) : "-"}</Text>
          <Text style={styles.cellTipo}>{f.tipoDocumento ?? "-"}</Text>
          <Text style={styles.cellNumero}>{f.numero}</Text>
          <Text style={styles.cellSaldo}>{formatearMonto(f.saldo)}</Text>
        </View>
      ))}
      <View style={styles.totalRow} wrap={false}>
        <Text style={styles.cellRut} />
        <Text style={styles.cellNombre} />
        <Text style={styles.cellFecha} />
        <Text style={styles.cellTipo} />
        <Text style={[styles.cellNumero, styles.bold]}>Total pendiente</Text>
        <Text style={[styles.cellSaldo, styles.bold]}>{formatearMonto(datos.total)}</Text>
      </View>
    </Page>
  );
}

function PaginaBalance({ datos }: { datos: DatosExportarBalance }) {
  const totalDeudor = datos.cuentas.reduce((s, c) => s + c.deudor, 0);
  const totalAcreedor = datos.cuentas.reduce((s, c) => s + c.acreedor, 0);
  const totalActivo = datos.cuentas.reduce((s, c) => s + c.activo, 0);
  const totalPasivo = datos.cuentas.reduce((s, c) => s + c.pasivo, 0);
  const totalPerdidas = datos.cuentas.reduce((s, c) => s + c.perdidas, 0);
  const totalGanancias = datos.cuentas.reduce((s, c) => s + c.ganancias, 0);

  return (
    <Page size="A4" orientation="landscape" style={styles.pageLandscape}>
      <Text style={styles.titulo}>{datos.titulo}</Text>
      <Text style={styles.subtitulo}>{datos.subtitulo}</Text>
      <View style={styles.headerRow} fixed>
        <Text style={[styles.balCodigo, styles.bold]}>Código</Text>
        <Text style={[styles.balCuenta, styles.bold]}>Cuenta</Text>
        <Text style={[styles.balNum, styles.bold]}>Débitos</Text>
        <Text style={[styles.balNum, styles.bold]}>Créditos</Text>
        <Text style={[styles.balNum, styles.bold]}>Deudor</Text>
        <Text style={[styles.balNum, styles.bold]}>Acreedor</Text>
        <Text style={[styles.balNum, styles.bold]}>Activo</Text>
        <Text style={[styles.balNum, styles.bold]}>Pasivo</Text>
        <Text style={[styles.balNum, styles.bold]}>Pérdidas</Text>
        <Text style={[styles.balNum, styles.bold]}>Ganancias</Text>
      </View>
      {datos.cuentas.map((c, i) => (
        <View style={styles.row} key={i} wrap={false}>
          <Text style={styles.balCodigo}>{c.codigo ?? "-"}</Text>
          <Text style={styles.balCuenta}>{c.nombre}</Text>
          <Text style={styles.balNum}>{formatearMonto(c.debitos)}</Text>
          <Text style={styles.balNum}>{formatearMonto(c.creditos)}</Text>
          <Text style={styles.balNum}>{c.deudor ? formatearMonto(c.deudor) : "-"}</Text>
          <Text style={styles.balNum}>{c.acreedor ? formatearMonto(c.acreedor) : "-"}</Text>
          <Text style={styles.balNum}>{c.activo ? formatearMonto(c.activo) : "-"}</Text>
          <Text style={styles.balNum}>{c.pasivo ? formatearMonto(c.pasivo) : "-"}</Text>
          <Text style={styles.balNum}>{c.perdidas ? formatearMonto(c.perdidas) : "-"}</Text>
          <Text style={styles.balNum}>{c.ganancias ? formatearMonto(c.ganancias) : "-"}</Text>
        </View>
      ))}
      <View style={styles.totalRow} wrap={false}>
        <Text style={styles.balCodigo} />
        <Text style={[styles.balCuenta, styles.bold]}>Totales</Text>
        <Text style={[styles.balNum, styles.bold]}>{formatearMonto(datos.totalDebitos)}</Text>
        <Text style={[styles.balNum, styles.bold]}>{formatearMonto(datos.totalCreditos)}</Text>
        <Text style={[styles.balNum, styles.bold]}>{formatearMonto(totalDeudor)}</Text>
        <Text style={[styles.balNum, styles.bold]}>{formatearMonto(totalAcreedor)}</Text>
        <Text style={[styles.balNum, styles.bold]}>{formatearMonto(totalActivo)}</Text>
        <Text style={[styles.balNum, styles.bold]}>{formatearMonto(totalPasivo)}</Text>
        <Text style={[styles.balNum, styles.bold]}>{formatearMonto(totalPerdidas)}</Text>
        <Text style={[styles.balNum, styles.bold]}>{formatearMonto(totalGanancias)}</Text>
      </View>
    </Page>
  );
}

export async function generarPdfFacturasPendientes(datos: DatosExportar): Promise<Buffer> {
  const documento = (
    <Document>
      <PaginaFacturas datos={datos} />
    </Document>
  );
  return renderToBuffer(documento);
}

export async function generarPdfBalance(datos: DatosExportarBalance): Promise<Buffer> {
  const documento = (
    <Document>
      <PaginaBalance datos={datos} />
    </Document>
  );
  return renderToBuffer(documento);
}

// Un solo PDF con una página (o más, si no entra) por cada sección disponible (Balance,
// Proveedores, Honorarios, Clientes), en ese orden — para descargar todo junto.
export async function generarPdfCompleto(secciones: SeccionCompleta[]): Promise<Buffer> {
  const documento = (
    <Document>
      {secciones.map((seccion, i) =>
        seccion.balance ? (
          <PaginaBalance key={i} datos={seccion.balance} />
        ) : seccion.facturas ? (
          <PaginaFacturas key={i} datos={seccion.facturas} />
        ) : null
      )}
    </Document>
  );
  return renderToBuffer(documento);
}
