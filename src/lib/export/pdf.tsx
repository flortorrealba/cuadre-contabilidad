import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import { formatearFecha, formatearMonto } from "@/lib/format";
import type { DatosExportar } from "./excel";

const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 8, fontFamily: "Helvetica" },
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
});

export async function generarPdfFacturasPendientes(datos: DatosExportar): Promise<Buffer> {
  const documento = (
    <Document>
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
    </Document>
  );

  return renderToBuffer(documento);
}
