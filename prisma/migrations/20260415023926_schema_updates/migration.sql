/*
  Warnings:

  - You are about to drop the column `elasticityScore` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `fabricPillingScore` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `logoWearScore` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `seamIntegrityScore` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `stitchWearScore` on the `Listing` table. All the data in the column will be lost.
  - Added the required column `suitType` to the `Listing` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SuitType" AS ENUM ('jammer', 'kneeskin', 'fullBody', 'openBack');

-- CreateEnum
CREATE TYPE "VoucherType" AS ENUM ('priority_listing', 'authentication', 'verified_suitscore', 'membership_trial');

-- CreateEnum
CREATE TYPE "MembershipPlan" AS ENUM ('monthly', 'annual');

-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('active', 'cancelled', 'past_due');

-- AlterTable
ALTER TABLE "Listing" DROP COLUMN "elasticityScore",
DROP COLUMN "fabricPillingScore",
DROP COLUMN "logoWearScore",
DROP COLUMN "seamIntegrityScore",
DROP COLUMN "stitchWearScore",
ADD COLUMN     "isAuthenticated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPriority" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "priorityExpiresAt" TIMESTAMP(3),
ADD COLUMN     "suitScoreVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "suitType" "SuitType" NOT NULL;

-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "orderId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "handle" SET DEFAULT concat('user_', substr(gen_random_uuid()::text, 1, 8));

-- CreateTable
CREATE TABLE "Voucher" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "VoucherType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "redeemedAt" TIMESTAMP(3),
    "redeemedById" TEXT,

    CONSTRAINT "Voucher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Membership" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "plan" "MembershipPlan" NOT NULL,
    "stripeSubscriptionId" TEXT,
    "status" "MembershipStatus" NOT NULL DEFAULT 'active',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Voucher_code_key" ON "Voucher"("code");

-- CreateIndex
CREATE INDEX "Voucher_code_idx" ON "Voucher"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Membership_userId_key" ON "Membership"("userId");

-- CreateIndex
CREATE INDEX "Membership_userId_idx" ON "Membership"("userId");

-- AddForeignKey
ALTER TABLE "Voucher" ADD CONSTRAINT "Voucher_redeemedById_fkey" FOREIGN KEY ("redeemedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
