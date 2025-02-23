/*
  Warnings:

  - You are about to drop the column `chainId` on the `CryptoCurrency` table. All the data in the column will be lost.
  - You are about to drop the column `priceNative` on the `CryptoCurrency` table. All the data in the column will be lost.
  - Added the required column `priceSOL` to the `CryptoCurrency` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "CryptoCurrency_chainId_baseTokenAddress_idx";

-- DropIndex
DROP INDEX "CryptoCurrency_chainId_pairAddress_idx";

-- AlterTable
ALTER TABLE "CryptoCurrency" DROP COLUMN "chainId",
DROP COLUMN "priceNative",
ADD COLUMN     "priceSOL" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "CryptoCurrency_baseTokenAddress_idx" ON "CryptoCurrency"("baseTokenAddress");

-- CreateIndex
CREATE INDEX "CryptoCurrency_pairAddress_idx" ON "CryptoCurrency"("pairAddress");

-- CreateIndex
CREATE INDEX "CryptoCurrency_quoteTokenAddress_idx" ON "CryptoCurrency"("quoteTokenAddress");
