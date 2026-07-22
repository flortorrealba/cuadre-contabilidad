import { redirect } from "next/navigation";

export default async function EmpresaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: empresaId } = await params;
  redirect(`/empresas/${empresaId}/estados-financieros/proveedores`);
}
