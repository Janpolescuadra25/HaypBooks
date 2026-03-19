-- CreateEnum
CREATE TYPE "BankTransactionStatus" AS ENUM ('PENDING', 'CATEGORIZED', 'MATCHED', 'SPLIT', 'EXCLUDED');

-- AlterTable
ALTER TABLE "BankTransaction" ADD COLUMN     "category" TEXT,
ADD COLUMN     "memo" TEXT,
ADD COLUMN     "status" "BankTransactionStatus" NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "BankTransactionSplit" (
    "id" TEXT NOT NULL,
    "bankTransactionId" TEXT NOT NULL,
    "accountCode" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(19,4) NOT NULL,
    "workspaceId" TEXT NOT NULL,

    CONSTRAINT "BankTransactionSplit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankTransfer" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "fromBankAccountId" TEXT NOT NULL,
    "toBankAccountId" TEXT NOT NULL,
    "amount" DECIMAL(19,4) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "memo" TEXT,
    "fromTransactionId" TEXT,
    "toTransactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BankTransfer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BankTransactionSplit_bankTransactionId_idx" ON "BankTransactionSplit"("bankTransactionId");

-- CreateIndex
CREATE INDEX "BankTransactionSplit_workspaceId_idx" ON "BankTransactionSplit"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "BankTransfer_fromTransactionId_key" ON "BankTransfer"("fromTransactionId");

-- CreateIndex
CREATE UNIQUE INDEX "BankTransfer_toTransactionId_key" ON "BankTransfer"("toTransactionId");

-- CreateIndex
CREATE INDEX "BankTransfer_workspaceId_idx" ON "BankTransfer"("workspaceId");

-- CreateIndex
CREATE INDEX "BankTransfer_fromBankAccountId_idx" ON "BankTransfer"("fromBankAccountId");

-- CreateIndex
CREATE INDEX "BankTransfer_toBankAccountId_idx" ON "BankTransfer"("toBankAccountId");

-- AddForeignKey
ALTER TABLE "BankTransactionSplit" ADD CONSTRAINT "BankTransactionSplit_bankTransactionId_fkey" FOREIGN KEY ("bankTransactionId") REFERENCES "BankTransaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankTransactionSplit" ADD CONSTRAINT "BankTransactionSplit_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankTransfer" ADD CONSTRAINT "BankTransfer_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankTransfer" ADD CONSTRAINT "BankTransfer_fromBankAccountId_fkey" FOREIGN KEY ("fromBankAccountId") REFERENCES "BankAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankTransfer" ADD CONSTRAINT "BankTransfer_toBankAccountId_fkey" FOREIGN KEY ("toBankAccountId") REFERENCES "BankAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
