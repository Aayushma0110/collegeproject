/*
  Warnings:

  - You are about to drop the `_DiseaseToDoctorProfile` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT IF EXISTS "Appointment_slotId_fkey";

-- DropForeignKey
ALTER TABLE "_DiseaseToDoctorProfile" DROP CONSTRAINT IF EXISTS "_DiseaseToDoctorProfile_A_fkey";

-- DropForeignKey
ALTER TABLE "_DiseaseToDoctorProfile" DROP CONSTRAINT IF EXISTS "_DiseaseToDoctorProfile_B_fkey";

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "notes" TEXT;

-- AlterTable
ALTER TABLE "TimeSlot" ADD COLUMN IF NOT EXISTS "doctorId" INTEGER;

-- DropTable
DROP TABLE IF EXISTS "_DiseaseToDoctorProfile";

-- CreateTable
CREATE TABLE IF NOT EXISTS "_DoctorExpertise" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_DoctorExpertise_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_DoctorExpertise_B_index" ON "_DoctorExpertise"("B");

-- AddForeignKey
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'TimeSlot_doctorId_fkey') THEN
        ALTER TABLE "TimeSlot" ADD CONSTRAINT "TimeSlot_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'TimeSlot_doctorAvailabilityId_fkey') THEN
        ALTER TABLE "TimeSlot" ADD CONSTRAINT "TimeSlot_doctorAvailabilityId_fkey" FOREIGN KEY ("doctorAvailabilityId") REFERENCES "DoctorAvailability"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Appointment_slotId_fkey') THEN
        ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "TimeSlot"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_DoctorExpertise_A_fkey') THEN
        ALTER TABLE "_DoctorExpertise" ADD CONSTRAINT "_DoctorExpertise_A_fkey" FOREIGN KEY ("A") REFERENCES "Disease"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_DoctorExpertise_B_fkey') THEN
        ALTER TABLE "_DoctorExpertise" ADD CONSTRAINT "_DoctorExpertise_B_fkey" FOREIGN KEY ("B") REFERENCES "DoctorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
