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
        specialty,
        phoneNumber: phone,
        isApproved: false
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
        specialty: doctor.specialty
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

    if (!doctor.isApproved) {
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
  try {
    const { specialty, minRating, maxFees } = req.query;

    const doctors = await prisma.user.findMany({
      where: {
        role: "DOCTOR",
        ...(specialty && { specialty }),
        ...(minRating && { ratings: { gte: parseFloat(minRating) } }),
        ...(maxFees && { fees: { lte: parseFloat(maxFees) } })
      },
      select: {
        id: true,
        name: true,
        specialty: true,
        experience: true,
        fees: true,
        ratings: true,
        availability: true
      }
    });

    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =========================
   GET DOCTOR BY ID
========================= */
export const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        name: true,
        email: true,
        specialty: true,
        experience: true,
        fees: true,
        ratings: true,
        availability: true,
        createdAt: true
      }
    });

    if (!doctor || doctor.role !== "DOCTOR") {
      return res.status(404).json({ error: "Doctor not found" });
    }

    res.json(doctor);
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

    const { availability } = req.body;

    const updatedDoctor = await prisma.user.update({
      where: { id: req.user.id },
      data: { availability },
      select: {
        id: true,
        name: true,
        specialty: true,
        availability: true
      }
    });

    res.json({ message: "Availability updated", doctor: updatedDoctor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
