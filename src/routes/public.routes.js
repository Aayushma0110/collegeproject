import express from "express";
import prisma from "../utils/prisma-clients.js";

const router = express.Router();

// Public endpoint to get all approved doctors (for patients to book)
router.get("/doctors", async (req, res) => {
  try {
    const doctors = await prisma.doctorProfile.findMany({
      where: { status: "APPROVED" },
      select: {
        id: true,
        userId: true,
        specialty: true,
        fees: true,
        status: true,
        experience: true,
        bio: true,
        user: { select: { id: true, name: true, email: true, phoneNumber: true } }
      },
      orderBy: { specialty: "asc" }
    });

    const doctorList = doctors.map(p => ({
      id: p.user.id,
      userId: p.userId,
      name: p.user.name,
      email: p.user.email,
      specialty: p.specialty,
      specialization: p.specialty,
      fees: p.fees,
      fee: p.fees,
      experience: p.experience,
      status: p.status,
      bio: p.bio,
      phoneNumber: p.user.phoneNumber || []
    }));

    res.json(doctorList);
  } catch (error) {
    console.error("Error fetching approved doctors:", error);
    res.status(500).json({ message: "Error fetching doctors", error: error.message });
  }
});

export default router;
