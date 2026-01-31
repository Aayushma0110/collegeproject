/*
  Warnings:

  - The values [REJECTED] on the enum `Status` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `notes` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `problemId` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `slotId` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Disease` table. All the data in the column will be lost.
  - You are about to drop the column `slotDuration` on the `DoctorAvailability` table. All the data in the column will be lost.
  - You are about to drop the column `weeklySchedule` on the `DoctorAvailability` table. All the data in the column will be lost.
  - You are about to drop the column `certifications` on the `DoctorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `clinicName` on the `DoctorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `consultationModes` on the `DoctorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `education` on the `DoctorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `languages` on the `DoctorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `diseaseId` on the `Symptom` table. All the data in the column will be lost.
  - You are about to drop the column `dateOfBirth` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `experience` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `fees` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `medicalHistory` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `ratings` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `scheduledAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `specialty` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Leave` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Problem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Recommendation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TimeSlot` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_DiseaseToDoctorProfile` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[doctorId,day,startTime,endTime]` on the table `DoctorAvailability` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nmcNumber]` on the table `DoctorProfile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Symptom` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `date` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endTime` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `day` to the `DoctorAvailability` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endTime` to the `DoctorAvailability` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `DoctorAvailability` table without a default value. This is not possible if the table is not empty.
  - Added the required column `degree` to the `DoctorProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `institute` to the `DoctorProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nmcNumber` to the `DoctorProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `specialty` to the `DoctorProfile` table without a default value. This is not possible if the table is not empty.
  - Made the column `experience` on table `DoctorProfile` required. This step will fail if there are existing NULL values in that column.
  - Made the column `fees` on table `DoctorProfile` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Day" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "ReminderType" AS ENUM ('EMAIL', 'SMS', 'IN_APP');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PaymentMethod" ADD VALUE 'CARD';
ALTER TYPE "PaymentMethod" ADD VALUE 'STRIPE';

-- AlterEnum
BEGIN;
CREATE TYPE "Status_new" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');
ALTER TABLE "public"."Appointment" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Appointment" ALTER COLUMN "status" TYPE "Status_new" USING ("status"::text::"Status_new");
ALTER TYPE "Status" RENAME TO "Status_old";
ALTER TYPE "Status_new" RENAME TO "Status";
DROP TYPE "public"."Status_old";
ALTER TABLE "Appointment" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_problemId_fkey";

-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_slotId_fkey";

-- DropForeignKey
ALTER TABLE "Leave" DROP CONSTRAINT "Leave_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "Recommendation" DROP CONSTRAINT "Recommendation_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "Recommendation" DROP CONSTRAINT "Recommendation_patientId_fkey";

-- DropForeignKey
ALTER TABLE "Recommendation" DROP CONSTRAINT "Recommendation_problemId_fkey";

-- DropForeignKey
ALTER TABLE "Symptom" DROP CONSTRAINT "Symptom_diseaseId_fkey";

-- DropForeignKey
ALTER TABLE "TimeSlot" DROP CONSTRAINT "TimeSlot_doctorAvailabilityId_fkey";

-- DropForeignKey
ALTER TABLE "TimeSlot" DROP CONSTRAINT "TimeSlot_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "_DiseaseToDoctorProfile" DROP CONSTRAINT "_DiseaseToDoctorProfile_A_fkey";

-- DropForeignKey
ALTER TABLE "_DiseaseToDoctorProfile" DROP CONSTRAINT "_DiseaseToDoctorProfile_B_fkey";

-- DropIndex
DROP INDEX "Appointment_slotId_key";

-- DropIndex
DROP INDEX "DoctorAvailability_doctorId_key";

-- AlterTable
ALTER TABLE "Appointment" DROP COLUMN "notes",
DROP COLUMN "problemId",
DROP COLUMN "slotId",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "endTime" TEXT NOT NULL,
ADD COLUMN     "mode" "Mode" NOT NULL DEFAULT 'IN_PERSON',
ADD COLUMN     "startTime" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Disease" DROP COLUMN "createdAt",
ADD COLUMN     "specialty" TEXT NOT NULL DEFAULT 'General Medicine';

-- AlterTable
ALTER TABLE "DoctorAvailability" DROP COLUMN "slotDuration",
DROP COLUMN "weeklySchedule",
ADD COLUMN     "day" "Day" NOT NULL,
ADD COLUMN     "endTime" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "startTime" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "DoctorProfile" DROP COLUMN "certifications",
DROP COLUMN "clinicName",
DROP COLUMN "consultationModes",
DROP COLUMN "education",
DROP COLUMN "languages",
ADD COLUMN     "degree" TEXT NOT NULL,
ADD COLUMN     "institute" TEXT NOT NULL,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "nmcNumber" TEXT NOT NULL,
ADD COLUMN     "ratings" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "specialty" TEXT NOT NULL,
ADD COLUMN     "status" "DoctorStatus" NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "bio" DROP NOT NULL,
ALTER COLUMN "city" DROP NOT NULL,
ALTER COLUMN "experience" SET NOT NULL,
ALTER COLUMN "fees" SET NOT NULL;

-- AlterTable
ALTER TABLE "Symptom" DROP COLUMN "diseaseId";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "dateOfBirth",
DROP COLUMN "experience",
DROP COLUMN "fees",
DROP COLUMN "gender",
DROP COLUMN "medicalHistory",
DROP COLUMN "phone",
DROP COLUMN "ratings",
DROP COLUMN "scheduledAt",
DROP COLUMN "specialty",
DROP COLUMN "status",
ALTER COLUMN "phoneNumber" DROP DEFAULT,
ALTER COLUMN "profilePicture" DROP NOT NULL,
ALTER COLUMN "profilePicture" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "Leave";

-- DropTable
DROP TABLE "Problem";

-- DropTable
DROP TABLE "Recommendation";

-- DropTable
DROP TABLE "TimeSlot";

-- DropTable
DROP TABLE "_DiseaseToDoctorProfile";

-- CreateTable
CREATE TABLE "PatientProfile" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "medicalHistory" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "gender" TEXT,
    "address" TEXT,

    CONSTRAINT "PatientProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reminder" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "appointmentId" INTEGER NOT NULL,
    "remindAt" TIMESTAMP(3) NOT NULL,
    "isSent" BOOLEAN NOT NULL DEFAULT false,
    "type" "ReminderType" NOT NULL,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiseaseSymptom" (
    "diseaseId" INTEGER NOT NULL,
    "symptomId" INTEGER NOT NULL,

    CONSTRAINT "DiseaseSymptom_pkey" PRIMARY KEY ("diseaseId","symptomId")
);

-- CreateTable
CREATE TABLE "PatientSymptom" (
    "id" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "symptomId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PatientSymptom_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PatientProfile_userId_key" ON "PatientProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Reminder_appointmentId_key" ON "Reminder"("appointmentId");

-- CreateIndex
CREATE UNIQUE INDEX "PatientSymptom_patientId_symptomId_key" ON "PatientSymptom"("patientId", "symptomId");

-- CreateIndex
CREATE UNIQUE INDEX "DoctorAvailability_doctorId_day_startTime_endTime_key" ON "DoctorAvailability"("doctorId", "day", "startTime", "endTime");

-- CreateIndex
CREATE UNIQUE INDEX "DoctorProfile_nmcNumber_key" ON "DoctorProfile"("nmcNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Symptom_name_key" ON "Symptom"("name");

-- AddForeignKey
ALTER TABLE "PatientProfile" ADD CONSTRAINT "PatientProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiseaseSymptom" ADD CONSTRAINT "DiseaseSymptom_diseaseId_fkey" FOREIGN KEY ("diseaseId") REFERENCES "Disease"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiseaseSymptom" ADD CONSTRAINT "DiseaseSymptom_symptomId_fkey" FOREIGN KEY ("symptomId") REFERENCES "Symptom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientSymptom" ADD CONSTRAINT "PatientSymptom_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "PatientProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientSymptom" ADD CONSTRAINT "PatientSymptom_symptomId_fkey" FOREIGN KEY ("symptomId") REFERENCES "Symptom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
