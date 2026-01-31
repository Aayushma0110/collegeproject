/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Leave` table. All the data in the column will be lost.
  - You are about to drop the `_DoctorExpertise` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `doctorId` on table `TimeSlot` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "PaymentMethod" ADD VALUE 'CARD';

-- AlterEnum
ALTER TYPE "Status" ADD VALUE 'REJECTED';

-- DropForeignKey
ALTER TABLE "TimeSlot" DROP CONSTRAINT "TimeSlot_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "_DoctorExpertise" DROP CONSTRAINT "_DoctorExpertise_A_fkey";

-- DropForeignKey
ALTER TABLE "_DoctorExpertise" DROP CONSTRAINT "_DoctorExpertise_B_fkey";

-- AlterTable
ALTER TABLE "Disease" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Leave" DROP COLUMN "createdAt";

-- AlterTable
ALTER TABLE "TimeSlot" ALTER COLUMN "doctorId" SET NOT NULL;

-- DropTable
DROP TABLE "_DoctorExpertise";

-- CreateTable
CREATE TABLE "_DiseaseToDoctorProfile" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_DiseaseToDoctorProfile_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_DiseaseToDoctorProfile_B_index" ON "_DiseaseToDoctorProfile"("B");

-- AddForeignKey
ALTER TABLE "TimeSlot" ADD CONSTRAINT "TimeSlot_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DiseaseToDoctorProfile" ADD CONSTRAINT "_DiseaseToDoctorProfile_A_fkey" FOREIGN KEY ("A") REFERENCES "Disease"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DiseaseToDoctorProfile" ADD CONSTRAINT "_DiseaseToDoctorProfile_B_fkey" FOREIGN KEY ("B") REFERENCES "DoctorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
