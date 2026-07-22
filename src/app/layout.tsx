import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cuadre de Auxiliares | Proveedores, Honorarios y Clientes",
  description:
    "Sube los auxiliares de iContador y obtén las facturas y honorarios pendientes de pago al cierre del mes, netos de notas de crédito.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-neutral-50 text-neutral-900">
        <header className="border-b border-neutral-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href={user ? "/empresas" : "/"} className="font-semibold text-neutral-900">
              🧾 Cuadre de Auxiliares
            </Link>
            {user ? (
              <div className="flex items-center gap-4 text-sm">
                <span className="text-neutral-500">{user.nombre}</span>
                <Link href="/cuenta" className="text-neutral-600 hover:text-neutral-900 hover:underline">
                  Mi cuenta
                </Link>
                <form action={logoutAction}>
                  <button type="submit" className="text-neutral-500 hover:text-neutral-900 hover:underline">
                    Cerrar sesión
                  </button>
                </form>
              </div>
            ) : (
              <nav className="flex items-center gap-4 text-sm">
                <Link href="/login" className="text-neutral-600 hover:text-neutral-900">
                  Ingresar
                </Link>
                <Link
                  href="/registro"
                  className="rounded-md bg-neutral-900 px-3 py-1.5 text-white hover:bg-neutral-700"
                >
                  Crear cuenta
                </Link>
              </nav>
            )}
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
