-- Quick SQL to check your data status
-- Run these in your database client or use Prisma Studio

-- 1. Check if you have doctors
SELECT id, name, email, role, status FROM "User" WHERE role = 'DOCTOR';

-- 2. Check if doctors have profiles with expertise
SELECT 
  dp.id, 
  dp."userId", 
  u.name as doctor_name,
  u.status as doctor_status
FROM "DoctorProfile" dp
JOIN "User" u ON u.id = dp."userId";

-- 3. Check doctor expertise (many-to-many)
SELECT 
  u.name as doctor_name,
  d.name as expertise_name,
  d.id as expertise_id
FROM "User" u
JOIN "DoctorProfile" dp ON dp."userId" = u.id
JOIN "_DoctorExpertise" de ON de."B" = dp.id
JOIN "Disease" d ON d.id = de."A"
WHERE u.role = 'DOCTOR' AND u.status = 'APPROVED';

-- 4. Check available time slots
SELECT 
  ts.id,
  ts."doctorId",
  u.name as doctor_name,
  ts."startTime",
  ts."endTime",
  ts."isBooked"
FROM "TimeSlot" ts
JOIN "User" u ON u.id = ts."doctorId"
WHERE ts."isBooked" = false 
  AND ts."startTime" > NOW()
ORDER BY ts."startTime"
LIMIT 10;

-- 5. Check diseases/expertises available
SELECT id, name FROM "Disease";
