-- CreateTable
CREATE TABLE "CargaBalance" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "periodoDesde" TIMESTAMP(3),
    "periodoHasta" TIMESTAMP(3),
    "archivoOrigen" TEXT,
    "totalDebitos" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCreditos" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creadoPorId" TEXT,

    CONSTRAINT "CargaBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CuentaBalance" (
    "id" TEXT NOT NULL,
    "cargaId" TEXT NOT NULL,
    "codigo" TEXT,
    "nombre" TEXT NOT NULL,
    "debitos" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "creditos" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "deudor" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "acreedor" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "activo" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pasivo" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "perdidas" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ganancias" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "CuentaBalance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CargaBalance_empresaId_idx" ON "CargaBalance"("empresaId");

-- CreateIndex
CREATE INDEX "CuentaBalance_cargaId_idx" ON "CuentaBalance"("cargaId");

-- AddForeignKey
ALTER TABLE "CargaBalance" ADD CONSTRAINT "CargaBalance_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CargaBalance" ADD CONSTRAINT "CargaBalance_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CuentaBalance" ADD CONSTRAINT "CuentaBalance_cargaId_fkey" FOREIGN KEY ("cargaId") REFERENCES "CargaBalance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

