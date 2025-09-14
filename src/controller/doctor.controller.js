
import { prisma } from "../utils/prisma-client.js";

// 1. GET /api/doctors
// List all doctors with optional filters
export const getDoctors = async (req, res) => {
  try {
    const { specialty, minRating, maxFees } = req.query;

    const doctors = await prisma.user.findMany({
      where: {
        role: "DOCTOR",
        ...(specialty && { specialty }),
        ...(minRating && { ratings: { gte: parseFloat(minRating) } }),
        ...(maxFees && { fees: { lte: parseFloat(maxFees) } }),
      },
      select: {
        id: true,
        name: true,
        specialty: true,
        experience: true,
        fees: true,
        ratings: true,
        availability: true,
      },
    });

    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. GET /api/doctors/:id
// Get single doctor profile
export const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        name: true,
        email: true,
        specialty: true,
        experience: true,
        fees: true,
        ratings: true,
        availability: true,
        createdAt: true,
      },
    });

    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    res.json(doctor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. PUT /api/doctors/me/availability
// Update availability JSON for logged-in doctor
export const updateAvailability = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { availability } = req.body;

    if (req.user.role !== "DOCTOR") {
      return res.status(403).json({ error: "Only doctors can update availability" });
    }

    const updatedDoctor = await prisma.user.update({
      where: { id: doctorId },
      data: { availability },
      select: {
        id: true,
        name: true,
        specialty: true,
        availability: true,
      },
    });

    res.json({ message: "Availability updated", doctor: updatedDoctor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

