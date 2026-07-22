import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TIPOS_AUXILIAR } from "@/lib/format";

export default async function EmpresaLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id: empresaId } = await params;
  const membership = await prisma.empresaMember.findUnique({
    where: { userId_empresaId: { userId: user.id, empresaId } },
    include: { empresa: true },
  });
  if (!membership) notFound();

  const tabsEstadosFinancieros = [
    { href: `/empresas/${empresaId}/balance`, label: "Balance" },
    { href: `/empresas/${empresaId}/estados-financieros/proveedores`, label: TIPOS_AUXILIAR.PROVEEDORES },
    { href: `/empresas/${empresaId}/estados-financieros/honorarios`, label: TIPOS_AUXILIAR.HONORARIOS },
    { href: `/empresas/${empresaId}/estados-financieros/clientes`, label: TIPOS_AUXILIAR.CLIENTES },
  ];
  const otrasTabs = [
    { href: `/empresas/${empresaId}/miembros`, label: "Miembros" },
    { href: `/empresas/${empresaId}/configuracion`, label: "Configuración" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Link href="/empresas" className="text-sm text-neutral-500 hover:underline">
          ← Todas las empresas
        </Link>
        <h1 className="mt-1 text-2xl font-bold text-neutral-900">{membership.empresa.nombre}</h1>
        {membership.empresa.rut && <p className="text-sm text-neutral-500">{membership.empresa.rut}</p>}
      </div>
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Estados Financieros</p>
        <nav className="flex flex-wrap gap-1 border-b border-neutral-200">
          {tabsEstadosFinancieros.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className="rounded-t-md px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
            >
              {tab.label}
            </Link>
          ))}
          <span className="mx-2 self-center h-5 w-px bg-neutral-200" />
          {otrasTabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className="rounded-t-md px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>
      <div>{children}</div>
    </div>
  );
}
