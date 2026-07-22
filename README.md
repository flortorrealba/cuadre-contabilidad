# Cuadre de Auxiliares

Aplicación web para subir, por separado y por empresa, los auxiliares que exporta
iContador de **Cuentas por Pagar Proveedores**, **Honorarios** y **Clientes**, y
obtener automáticamente las facturas y honorarios pendientes de pago al cierre del
mes, netos de notas de crédito y pagos aplicados.

Es una aplicación separada de "Cierre Contable" — no calcula Balance General ni
Estado de Resultados, solo ordena y totaliza los documentos pendientes de cada
auxiliar.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Prisma + PostgreSQL
- Autenticación propia (email/contraseña, sesión por cookie firmada con `jose`)
- Parseo de Excel con `xlsx` (SheetJS)

## Desplegar en Vercel (sin usar la terminal)

1. Entra a [vercel.com](https://vercel.com) y crea una cuenta gratis iniciando
   sesión con tu cuenta de GitHub (la misma dueña de este repositorio).
2. Click en **Add New → Project** e importa este repositorio
   (`flortorrealba/cuadre-contabilidad`).
3. Antes de desplegar, ve a la pestaña **Storage** del proyecto y crea una
   base de datos **Postgres** gratuita (Neon/Vercel Postgres). Al conectarla
   al proyecto, Vercel agrega automáticamente la variable `DATABASE_URL`.
   - Si no aparece esa opción durante la importación, primero completa el
     despliegue (puede fallar la primera vez), luego crea la base de datos
     desde **Storage → Create Database → Postgres**, conéctala al proyecto, y
     finalmente usa el botón **Redeploy**.
4. En **Settings → Environment Variables**, agrega una variable llamada
   `AUTH_SECRET` con cualquier texto largo y aleatorio (por ejemplo, generado
   en [randomkeygen.com](https://randomkeygen.com)).
5. Click en **Deploy**. Cuando termine, Vercel te da una URL
   (`https://tu-proyecto.vercel.app`) — esa es tu app, lista para usar desde
   cualquier navegador, sin instalar nada.

## Correrla en tu computador (alternativa con terminal)

```bash
npm install
cp .env.example .env   # reemplaza DATABASE_URL por tu Postgres y AUTH_SECRET por un valor aleatorio
npx prisma migrate deploy
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000), crea una cuenta, crea una
empresa y sube el auxiliar de Proveedores, Honorarios o Clientes (el reporte de
Facturas/Honorarios Pendientes de Pago que exporta iContador, hoja "ORIGEN").

## Cómo funciona

1. **Empresas**: cada usuario puede crear o unirse a una o más empresas.
2. **Estados Financieros**: cada empresa tiene tres secciones independientes —
   Cuentas por Pagar Proveedores, Honorarios y Clientes — cada una con su
   propia carga de auxiliar. Subir un archivo nuevo reemplaza la carga
   anterior de esa sección.
3. **Cálculo del saldo pendiente**: la columna "Saldo :" del reporte de
   iContador es un saldo corrido por entidad, no el saldo propio de cada
   documento — por eso el saldo de cada documento se calcula sumando
   Débito/Crédito por documento (incluyendo las notas de crédito o pagos que
   lo referencian), en vez de leer esa columna directamente. Ver
   `src/lib/auxiliar-parser.ts`.

## Comandos útiles

```bash
npm run dev       # entorno de desarrollo
npm run build     # build de producción
npm run lint      # eslint
npx prisma studio # explorar la base de datos
```
