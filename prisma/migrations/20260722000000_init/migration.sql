-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Empresa" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "rut" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmpresaMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmpresaMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CargaAuxiliar" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "cuentaCodigo" TEXT,
    "cuentaNombre" TEXT,
    "periodoDesde" TIMESTAMP(3),
    "periodoHasta" TIMESTAMP(3),
    "archivoOrigen" TEXT,
    "totalSaldo" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creadoPorId" TEXT,

    CONSTRAINT "CargaAuxiliar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacturaPendiente" (
    "id" TEXT NOT NULL,
    "cargaId" TEXT NOT NULL,
    "entidadRut" TEXT NOT NULL,
    "entidadNombre" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "fecha" TIMESTAMP(3),
    "tipoDocumento" TEXT,
    "glosa" TEXT,
    "saldo" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "FacturaPendiente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "EmpresaMember_userId_empresaId_key" ON "EmpresaMember"("userId", "empresaId");

-- CreateIndex
CREATE INDEX "CargaAuxiliar_empresaId_tipo_idx" ON "CargaAuxiliar"("empresaId", "tipo");

-- CreateIndex
CREATE INDEX "FacturaPendiente_cargaId_idx" ON "FacturaPendiente"("cargaId");

-- AddForeignKey
ALTER TABLE "EmpresaMember" ADD CONSTRAINT "EmpresaMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmpresaMember" ADD CONSTRAINT "EmpresaMember_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CargaAuxiliar" ADD CONSTRAINT "CargaAuxiliar_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CargaAuxiliar" ADD CONSTRAINT "CargaAuxiliar_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacturaPendiente" ADD CONSTRAINT "FacturaPendiente_cargaId_fkey" FOREIGN KEY ("cargaId") REFERENCES "CargaAuxiliar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

