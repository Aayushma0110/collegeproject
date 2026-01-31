/*
  Warnings:

  - You are about to drop the column `problems` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `doctorId` on the `TimeSlot` table. All the data in the column will be lost.
  - Added the required column `doctorAvailabilityId` to the `TimeSlot` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PaymentMethod" ADD VALUE 'ESEWA';
ALTER TYPE "PaymentMethod" ADD VALUE 'STRIPE';

-- DropForeignKey
ALTER TABLE "TimeSlot" DROP CONSTRAINT "TimeSlot_doctorId_fkey";

-- AlterTable
ALTER TABLE "Appointment" DROP COLUMN "problems",
ADD COLUMN     "problemId" INTEGER;

-- AlterTable
ALTER TABLE "DoctorProfile" ADD COLUMN     "experience" INTEGER,
ADD COLUMN     "fees" DOUBLE PRECISION,
ALTER COLUMN "languages" DROP DEFAULT,
ALTER COLUMN "consultationModes" DROP DEFAULT;

-- AlterTable
ALTER TABLE "TimeSlot" DROP COLUMN "doctorId",
ADD COLUMN     "doctorAvailabilityId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "phoneNumber" DROP DEFAULT,
ALTER COLUMN "profilePicture" DROP DEFAULT;

-- CreateTable
CREATE TABLE "_DiseaseToDoctorProfile" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_DiseaseToDoctorProfile_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_DiseaseToDoctorProfile_B_index" ON "_DiseaseToDoctorProfile"("B");

-- AddForeignKey
ALTER TABLE "TimeSlot" ADD CONSTRAINT "TimeSlot_doctorAvailabilityId_fkey" FOREIGN KEY ("doctorAvailabilityId") REFERENCES "DoctorAvailability"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DiseaseToDoctorProfile" ADD CONSTRAINT "_DiseaseToDoctorProfile_A_fkey" FOREIGN KEY ("A") REFERENCES "Disease"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DiseaseToDoctorProfile" ADD CONSTRAINT "_DiseaseToDoctorProfile_B_fkey" FOREIGN KEY ("B") REFERENCES "DoctorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
