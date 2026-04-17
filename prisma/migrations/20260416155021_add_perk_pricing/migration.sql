-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "sellerPerkAuthVoucherCovered" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sellerPerkAuthentication" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sellerPerkPriority" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sellerPerkPriorityVoucherCovered" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sellerPerkSuitscoreVoucherCovered" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sellerPerkVerifiedSuitscore" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "buyerPerkAuthentication" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "buyerPerkVerifiedSuitscore" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "buyerPerksFee" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "sellerPerksFeePercent" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "handle" SET DEFAULT concat('user_', substr(gen_random_uuid()::text, 1, 8));
