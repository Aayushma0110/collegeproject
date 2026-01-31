import bcrypt from "bcrypt";
import prisma from "../utils/prisma-clients.js";
import jwt from "jsonwebtoken";


export const registerDoctor = async (req, res) => {
  try {
    const { name, email, password, specialty, phone } = req.body;

    if (!name || !email || !password || !specialty) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const doctor = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "DOCTOR",
        isApproved: true||false,
        specialty,
        phoneNumber: phone ? [phone] : [],
        status: "PENDING"
      }
    });

    const token = jwt.sign(
      { id: doctor.id, role: doctor.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      token,
      doctor: {
        id: doctor.id,
        name: doctor.name,
        email: doctor.email,
        specialty: doctor.specialty,
        isApproved: true
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* =========================
   DOCTOR LOGIN
========================= */
export const doctorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const doctor = await prisma.user.findUnique({
      where: { email }
    });

    if (!doctor || doctor.role !== "DOCTOR") {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (doctor.status !== "APPROVED") {
      return res.status(403).json({ message: "Doctor not approved yet" });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: doctor.id, role: doctor.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      doctor: {
        id: doctor.id,
        name: doctor.name,
        email: doctor.email,
        specialty: doctor.specialty
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   GET ALL DOCTORS
========================= */
export const getDoctors = async (req, res) => {
  console.log("🔍 getDoctors called");
  try {
    const doctors = await prisma.user.findMany({
      where: {
        role: "DOCTOR"
      },
      include: {
        doctorProfile: true
      }
    });

    console.log(`✅ Found ${doctors.length} doctors`);

    // Format response to include doctor profile fields
    const formattedDoctors = doctors.map(doctor => ({
      id: doctor.id,
      name: doctor.name,
      email: doctor.email,
      phoneNumber: doctor.phoneNumber,
      doctorProfile: doctor.doctorProfile
    }));

    res.json(formattedDoctors);
  } catch (err) {
    console.error("❌ getDoctors error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/* =========================
   SEARCH DOCTORS
========================= */
export const searchDoctors = async (req, res) => {
  console.log("🔍 searchDoctors called, query:", req.query);
  try {
    const { specialty, city, name } = req.query;

    // Build where clause based on query parameters
    const whereClause = {
      role: "DOCTOR"
    };

    // If searching by specialty or city, we need to filter by doctorProfile
    const doctorProfileWhere = {};
    
    if (specialty) {
      doctorProfileWhere.specialty = {
        contains: specialty,
        mode: 'insensitive'
      };
    }

    if (city) {
      doctorProfileWhere.city = {
        contains: city,
        mode: 'insensitive'
      };
    }

    if (name) {
      whereClause.name = {
        contains: name,
        mode: 'insensitive'
      };
    }

    const doctors = await prisma.user.findMany({
      where: whereClause,
      include: {
        doctorProfile: Object.keys(doctorProfileWhere).length > 0 ? {
          where: doctorProfileWhere
        } : true
      }
    });

    // Filter out doctors without matching profiles if profile filters were applied
    const filteredDoctors = doctors.filter(doctor => {
      if (Object.keys(doctorProfileWhere).length > 0) {
        return doctor.doctorProfile !== null;
      }
      return true;
    });

    console.log(`✅ Found ${filteredDoctors.length} doctors matching search criteria`);

    const formattedDoctors = filteredDoctors.map(doctor => ({
      id: doctor.id,
      name: doctor.name,
      email: doctor.email,
      phoneNumber: doctor.phoneNumber,
      doctorProfile: doctor.doctorProfile
    }));

    res.json(formattedDoctors);
  } catch (err) {
    console.error("❌ searchDoctors error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/* =========================
   GET DOCTOR BY ID
========================= */
export const getDoctorById = async (req, res) => {
  console.log("🔍 getDoctorById called, params:", req.params);
  try {
    const { id } = req.params;
    console.log("ID from params:", id, "Type:", typeof id);

    if (!id || id === 'undefined') {
      return res.status(400).json({ error: "Doctor ID is required" });
    }

    const doctor = await prisma.user.findUnique({
      where: { id: Number(id) },
      include: {
        doctorProfile: true
      }
    });

    if (!doctor || doctor.role !== "DOCTOR") {
      return res.status(404).json({ error: "Doctor not found" });
    }

    res.json(doctor);
  } catch (err) {
    console.error("❌ getDoctorById error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/* =========================
   CREATE DOCTOR PROFILE
========================= */
export const createDoctorProfile = async (req, res) => {
  try {
    const { education, bio, city, languages, certifications, clinicName, consultationModes } = req.body;

    if (!education || !bio || !city) {
      return res.status(400).json({ message: "education, bio, and city are required" });
    }

    // Use authenticated user's ID
    const userId = req.user.id;

    // Check if user is a doctor
    if (req.user.role !== "DOCTOR") {
      return res.status(403).json({ message: "Only doctors can create doctor profiles" });
    }

    // Check if profile already exists
    const existingProfile = await prisma.doctorProfile.findUnique({ where: { userId } });
    if (existingProfile) {
      return res.status(400).json({ message: "Doctor profile already exists" });
    }

    const profile = await prisma.doctorProfile.create({
      data: {
        userId,
        education,
        bio,
        city,
        languages: languages || [],
        certifications,
        clinicName,
        consultationModes: consultationModes || [],
        experience: req.user.experience,
        fees: req.user.fees
      }
    });

    res.status(201).json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* =========================
   GET AVAILABILITY
========================= */
export const getAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const doctorId = parseInt(id);

    if (isNaN(doctorId)) {
      return res.status(400).json({ error: "Invalid doctor ID" });
    }

    const doctor = await prisma.user.findUnique({
      where: { id: doctorId },
      select: {
        id: true,
        name: true,
        email: true,
        doctorProfile: true
      }
    });

    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    // Get doctor availability from DoctorAvailability model
    const availabilities = await prisma.doctorAvailability.findMany({
      where: { doctorId: doctorId }
    });

    res.json({
      message: "Doctor availability retrieved",
      doctor: {
        ...doctor,
        availabilities
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =========================
   GET AVAILABLE SLOTS
========================= */
export const getAvailableSlots = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;
    const doctorId = parseInt(id);

    if (isNaN(doctorId)) {
      return res.status(400).json({ error: "Invalid doctor ID" });
    }

    if (!date) {
      return res.status(400).json({ error: "Date is required (format: YYYY-MM-DD)" });
    }

    // Parse the date and get day of week
    const requestedDate = new Date(date);
    const dayNames = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
    const dayOfWeek = dayNames[requestedDate.getDay()];

    // Get doctor's availability for that day
    const availabilities = await prisma.doctorAvailability.findMany({
      where: {
        doctorId: doctorId,
        day: dayOfWeek,
        isActive: true
      }
    });

    if (availabilities.length === 0) {
      return res.json({
        message: "No availability for this date",
        date,
        dayOfWeek,
        slots: []
      });
    }

    // Get existing appointments for that date
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        doctorId: doctorId,
        date: new Date(date),
        status: {
          notIn: ["CANCELLED", "REJECTED"]
        }
      },
      select: {
        startTime: true,
        endTime: true
      }
    });

    // Generate time slots (30-minute intervals)
    const slots = [];
    availabilities.forEach(avail => {
      const [startHour, startMin] = avail.startTime.split(':').map(Number);
      const [endHour, endMin] = avail.endTime.split(':').map(Number);
      
      let currentHour = startHour;
      let currentMin = startMin;

      while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
        const slotTime = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;

        // Check if slot is already booked
        const isBooked = existingAppointments.some(apt => 
          apt.startTime === slotTime
        );

        slots.push({
          time: slotTime,

          available: !isBooked
        });

        // Increment by 30 minutes
        currentMin += 30;
        if (currentMin >= 60) {
          currentMin = 0;
          currentHour += 1;
        }
      }
    });

    res.json({
      message: "Available slots retrieved",
      date,
      dayOfWeek,
      slots
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =========================
   UPDATE AVAILABILITY
========================= */
export const updateAvailability = async (req, res) => {
  try {
    if (req.user.role !== "DOCTOR") {
      return res.status(403).json({ error: "Only doctors can update availability" });
    }

    const { day, startTime, endTime, isActive } = req.body;

    // Validate input
    if (!day || !startTime || !endTime) {
      return res.status(400).json({ error: "day, startTime, and endTime are required" });
    }

    // Check if availability slot already exists
    const existingSlot = await prisma.doctorAvailability.findFirst({
      where: {
        doctorId: req.user.id,
        day
      }
    });

    let updatedAvailability;
    if (existingSlot) {
      // Update existing slot
      updatedAvailability = await prisma.doctorAvailability.update({
        where: { id: existingSlot.id },
        data: {
          startTime,
          endTime,
          isActive: isActive !== undefined ? isActive : true
        }
      });
    } else {
      // Create new availability slot
      updatedAvailability = await prisma.doctorAvailability.create({
        data: {
          doctorId: req.user.id,
          day,
          startTime,
          endTime,
          isActive: isActive !== undefined ? isActive : true
        }
      });
    }

    res.json({
      message: "Availability updated",
      availability: updatedAvailability
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
