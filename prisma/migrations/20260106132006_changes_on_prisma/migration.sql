/*
  Warnings:

  - The values [ESEWA] on the enum `PaymentMethod` will be removed. If these variants are still used in the database, this will fail.
  - The `phoneNumber` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `profilePicture` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PaymentMethod_new" AS ENUM ('CASH', 'KHALTI');
ALTER TABLE "Payment" ALTER COLUMN "method" TYPE "PaymentMethod_new" USING ("method"::text::"PaymentMethod_new");
ALTER TYPE "PaymentMethod" RENAME TO "PaymentMethod_old";
ALTER TYPE "PaymentMethod_new" RENAME TO "PaymentMethod";
DROP TYPE "public"."PaymentMethod_old";
COMMIT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "ratings" DOUBLE PRECISION,
DROP COLUMN "phoneNumber",
ADD COLUMN     "phoneNumber" TEXT[],
DROP COLUMN "profilePicture",
ADD COLUMN     "profilePicture" TEXT[];
