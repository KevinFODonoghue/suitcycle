/*
  Warnings:

  - Added the required column `ageCategory` to the `Listing` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AgeCategory" AS ENUM ('twelve_and_under', 'thirteen_and_over');

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "ageCategory" "AgeCategory" NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "handle" SET DEFAULT concat('user_', substr(gen_random_uuid()::text, 1, 8));

-- CreateIndex
CREATE INDEX "Listing_ageCategory_idx" ON "Listing"("ageCategory");
