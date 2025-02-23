/*
  Warnings:

  - You are about to drop the column `change24h` on the `CryptoCurrency` table. All the data in the column will be lost.
  - You are about to drop the column `logo` on the `CryptoCurrency` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `CryptoCurrency` table. All the data in the column will be lost.
  - You are about to drop the column `symbol` on the `CryptoCurrency` table. All the data in the column will be lost.
  - You are about to drop the column `tradingViewSymbol` on the `CryptoCurrency` table. All the data in the column will be lost.
  - The `marketCap` column on the `CryptoCurrency` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[pairAddress]` on the table `CryptoCurrency` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `baseTokenAddress` to the `CryptoCurrency` table without a default value. This is not possible if the table is not empty.
  - Added the required column `baseTokenName` to the `CryptoCurrency` table without a default value. This is not possible if the table is not empty.
  - Added the required column `baseTokenSymbol` to the `CryptoCurrency` table without a default value. This is not possible if the table is not empty.
  - Added the required column `chainId` to the `CryptoCurrency` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dexId` to the `CryptoCurrency` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dexScreenerUrl` to the `CryptoCurrency` table without a default value. This is not possible if the table is not empty.
  - Added the required column `liquidity` to the `CryptoCurrency` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pairAddress` to the `CryptoCurrency` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priceNative` to the `CryptoCurrency` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priceUsd` to the `CryptoCurrency` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quoteTokenAddress` to the `CryptoCurrency` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quoteTokenName` to the `CryptoCurrency` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quoteTokenSymbol` to the `CryptoCurrency` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tradingViewUrl` to the `CryptoCurrency` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `volume24h` on the `CryptoCurrency` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropIndex
DROP INDEX "CryptoCurrency_symbol_key";

-- AlterTable
ALTER TABLE "CryptoCurrency" DROP COLUMN "change24h",
DROP COLUMN "logo",
DROP COLUMN "name",
DROP COLUMN "symbol",
DROP COLUMN "tradingViewSymbol",
ADD COLUMN     "baseTokenAddress" TEXT NOT NULL,
ADD COLUMN     "baseTokenName" TEXT NOT NULL,
ADD COLUMN     "baseTokenSymbol" TEXT NOT NULL,
ADD COLUMN     "chainId" TEXT NOT NULL,
ADD COLUMN     "dexId" TEXT NOT NULL,
ADD COLUMN     "dexScreenerUrl" TEXT NOT NULL,
ADD COLUMN     "fdv" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "liquidity" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "pairAddress" TEXT NOT NULL,
ADD COLUMN     "priceChange24h" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "priceNative" TEXT NOT NULL,
ADD COLUMN     "priceUsd" TEXT NOT NULL,
ADD COLUMN     "quoteTokenAddress" TEXT NOT NULL,
ADD COLUMN     "quoteTokenName" TEXT NOT NULL,
ADD COLUMN     "quoteTokenSymbol" TEXT NOT NULL,
ADD COLUMN     "tradingViewUrl" TEXT NOT NULL,
ADD COLUMN     "txnCount24h" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "marketCap",
ADD COLUMN     "marketCap" DOUBLE PRECISION NOT NULL DEFAULT 0,
DROP COLUMN "volume24h",
ADD COLUMN     "volume24h" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "bullishPercentage" SET DEFAULT 50;

-- CreateIndex
CREATE UNIQUE INDEX "CryptoCurrency_pairAddress_key" ON "CryptoCurrency"("pairAddress");

-- CreateIndex
CREATE INDEX "CryptoCurrency_chainId_baseTokenAddress_idx" ON "CryptoCurrency"("chainId", "baseTokenAddress");

-- CreateIndex
CREATE INDEX "CryptoCurrency_chainId_pairAddress_idx" ON "CryptoCurrency"("chainId", "pairAddress");
