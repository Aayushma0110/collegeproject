import prisma from "../utils/prisma-clients.js";

export const getPatients = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        medicalHistory: true,
        specialty: true,      
        fees: true,
        availability: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const updatePatients = async (req, res) => {
  try {
    const { name, medicalHistory, specialty, fees, availability } = req.body;

    let updateData = {};
    if (name) updateData.name = name;

    if (req.user.role === "PATIENT") {
      if (medicalHistory !== undefined) {
        updateData.medicalHistory = medicalHistory;
      }
    }

    if (req.user.role === "DOCTOR") {
      if (specialty !== undefined) updateData.specialty = specialty;
      if (fees !== undefined) updateData.fees = fees;
      if (availability !== undefined) updateData.availability = availability;
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        medicalHistory: true,
        specialty: true,
        fees: true,
        availability: true
      }
    });

    res.json({ message: "Profile updated", user: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
