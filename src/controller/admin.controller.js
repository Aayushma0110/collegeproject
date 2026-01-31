import prisma  from '../utils/prisma-clients.js';
import { sendUpcomingReminders } from '../services/notification.service.js';



export const getPendingDoctors = async (req, res) => {
  try {
    const profiles = await prisma.doctorProfile.findMany({
      where: { status: "PENDING" },
      select: {
        id: true,
        userId: true,
        specialty: true,
        fees: true,
        status: true,
        bio: true,
        user: { select: { id: true, name: true, email: true } }
      }
    });

    const doctors = profiles.map(p => ({
      id: p.user.id,
      userId: p.userId,
      name: p.user.name,
      email: p.user.email,
      specialty: p.specialty,
      fees: p.fees,
      status: p.status,
      bio: p.bio
    }));

    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: "Error fetching doctors", error: error.message });
  }
};


export const verifyDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // Update DoctorProfile status by userId
    const profile = await prisma.doctorProfile.update({
      where: { userId: Number(id) },
      data: { status },
      include: { user: { select: { id: true, name: true, email: true } } }
    });

    // If doctor is APPROVED, automatically create slots for next week
    if (status === "APPROVED") {
      await createDefaultSlotsForDoctor(Number(id));
    }

    res.json({ message: `Doctor ${status.toLowerCase()}`, doctor: {
      id: profile.user.id,
      userId: profile.userId,
      name: profile.user.name,
      email: profile.user.email,
      specialty: profile.specialty,
      fees: profile.fees,
      status: profile.status
    } });
  } catch (error) {
    res.status(500).json({ message: "Error updating doctor status", error: error.message });
  }
};

// Helper function to create default slots for a doctor
async function createDefaultSlotsForDoctor(doctorId) {
  try {
    const slots = [];
    
    // Create slots for next 7 days
    for (let dayOffset = 1; dayOffset <= 7; dayOffset++) {
      const slotDate = new Date();
      slotDate.setDate(slotDate.getDate() + dayOffset);
      slotDate.setHours(0, 0, 0, 0);
      
      // Skip weekends (Saturday and Sunday)
      if (slotDate.getDay() === 0 || slotDate.getDay() === 6) {
        continue;
      }

      // Create slots from 9 AM to 5 PM with 60-minute duration
      for (let hour = 9; hour < 17; hour++) {
        const startTime = new Date(slotDate);
        startTime.setHours(hour, 0, 0, 0);
        
        const endTime = new Date(startTime);
        endTime.setHours(hour + 1, 0, 0, 0);

        slots.push({
          doctorId,
          date: slotDate,
          startTime,
          endTime,
          isBooked: false,
          duration: 60
        });
      }
    }

    if (slots.length > 0) {
      await prisma.slot.createMany({
        data: slots,
        skipDuplicates: true
      });
      
      console.log(`✅ Created ${slots.length} default slots for doctor ${doctorId}`);
    }
  } catch (error) {
    console.error(`Error creating default slots for doctor ${doctorId}:`, error);
    // Don't throw error - let approval continue even if slots creation fails
  }
}

export const regenerateDoctorSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    // Verify doctor exists
    const doctor = await prisma.doctorProfile.findUnique({
      where: { userId: Number(doctorId) }
    });

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Create new slots
    await createDefaultSlotsForDoctor(Number(doctorId));

    res.json({ 
      message: "Slots regenerated successfully for doctor",
      doctorId
    });
  } catch (error) {
    console.error('Error regenerating slots:', error);
    res.status(500).json({ message: "Error regenerating slots", error: error.message });
  }
};

export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await prisma.doctorProfile.findMany({
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
      orderBy: { status: "asc" }
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
    res.status(500).json({ message: "Error fetching doctors", error: error.message });
  }
};

export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        doctor: { select: { id: true, name: true, specialty: true } },
        patient: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching appointments", error: error.message });
  }
};

export const getAppointmentsReport = async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            doctorProfile: { select: { specialty: true } }
          }
        },
        patient: { select: { id: true, name: true, email: true } },
      }
    });

    const total = appointments.length;
    const completed = appointments.filter(a => a.status === "COMPLETED").length;
    const cancelled = appointments.filter(a => a.status === "CANCELLED").length;
    const scheduled = appointments.filter(a => a.status === "SCHEDULED").length;

    const appointmentsByDoctor = {};
    appointments.forEach(apt => {
      const doctorName = apt.doctor.name;
      appointmentsByDoctor[doctorName] = (appointmentsByDoctor[doctorName] || 0) + 1;
    });

    res.json({
      totalAppointments: total,
      completed,
      cancelled,
      scheduled,
      appointmentsByDoctor
    });
  } catch (error) {
    res.status(500).json({ message: "Error generating report", error: error.message });
  }
};


export const getAllPayments = async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        appointment: {
          include: {
            doctor: { select: { id: true, name: true } },
            patient: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching payments", error: error.message });
  }
};

export const getRevenueReport = async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        appointment: {
          include: {
            doctor: { select: { name: true } }
          }
        }
      }
    });

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const completedPayments = payments.filter(p => p.status === "COMPLETED").length;
    const refundedPayments = payments.filter(p => p.status === "REFUNDED").length;
    const totalRefunded = payments
      .filter(p => p.status === "REFUNDED")
      .reduce((sum, p) => sum + p.amount, 0);

    const revenueByMethod = {};
    payments.forEach(payment => {
      const method = payment.method;
      if (!revenueByMethod[method]) {
        revenueByMethod[method] = 0;
      }
      if (payment.status === "COMPLETED") {
        revenueByMethod[method] += payment.amount;
      }
    });

    res.json({
      totalRevenue,
      completedPayments,
      refundedPayments,
      totalRefunded,
      netRevenue: totalRevenue - totalRefunded,
      revenueByMethod
    });
  } catch (error) {
    res.status(500).json({ message: "Error generating revenue report", error: error.message });
  }
};
export const approveDoctor = async (req, res) => {
  try {
    const doctorId = Number(req.params.id);
    const profile = await prisma.doctorProfile.update({
      where: { userId: doctorId },
      data: { status: "APPROVED" },
      include: { user: { select: { id: true, name: true, email: true } } }
    });
    res.json({ message: "Doctor approved successfully", doctor: {
      id: profile.user.id,
      userId: profile.userId,
      name: profile.user.name,
      email: profile.user.email,
      specialty: profile.specialty,
      fees: profile.fees,
      status: profile.status
    } });
  } catch (error) {
    res.status(500).json({ message: "Error approving doctor", error: error.message });
  }
};

export const getStats = async (req, res) => {
  try {
    const [totalUsers, totalDoctors, totalPatients, totalAppointments, totalPayments, pendingDoctors, approvedDoctors] = await Promise.all([
      prisma.user.count(),
      prisma.doctorProfile.count(),
      prisma.patientProfile.count(),
      prisma.appointment.count(),
      prisma.payment.count(),
      prisma.doctorProfile.count({ where: { status: "PENDING" } }),
      prisma.doctorProfile.count({ where: { status: "APPROVED" } })
    ]);

    res.json({
      totalUsers,
      totalDoctors,
      totalPatients,
      totalAppointments,
      totalPayments,
      pendingDoctors,
      approvedDoctors
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching stats", error: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phoneNumber: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: "desc" }
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
};

export const getDiseases = async (req, res) => {
  try {
    const diseases = await prisma.disease.findMany();
    res.json(diseases);
  } catch (error) {
    res.status(500).json({ message: "Error fetching diseases", error: error.message });
  }
};

export const getDiseaseById = async (req, res) => {
  try {
    const { id } = req.params;
    const disease = await prisma.disease.findUnique({
      where: { id: Number(id) },
      include: { symptoms: true }
    });

    if (!disease) {
      return res.status(404).json({ message: "Disease not found" });
    }

    res.json(disease);
  } catch (error) {
    res.status(500).json({ message: "Error fetching disease", error: error.message });
  }
};

export const getDiseaseSymptoms = async (req, res) => {
  try {
    const { id } = req.params;

    const disease = await prisma.disease.findUnique({
      where: { id: Number(id) },
      include: {
        symptoms: {
          include: { symptom: true }
        }
      }
    });

    if (!disease) {
      return res.status(404).json({ message: "Disease not found" });
    }

    const symptoms = disease.symptoms.map(ds => ds.symptom);
    res.json(symptoms);
  } catch (error) {
    res.status(500).json({ message: "Error fetching disease symptoms", error: error.message });
  }
};

export const updateDiseaseSymptoms = async (req, res) => {
  try {
    const { id } = req.params;
    const { symptomIds } = req.body;

    if (!Array.isArray(symptomIds)) {
      return res.status(400).json({ message: "symptomIds must be an array" });
    }

    // Verify disease exists
    const disease = await prisma.disease.findUnique({
      where: { id: Number(id) }
    });

    if (!disease) {
      return res.status(404).json({ message: "Disease not found" });
    }

    // Verify all symptoms exist
    if (symptomIds.length > 0) {
      const symptoms = await prisma.symptom.findMany({
        where: { id: { in: symptomIds.map(id => Number(id)) } }
      });

      if (symptoms.length !== symptomIds.length) {
        return res.status(404).json({ message: "One or more symptom IDs not found" });
      }
    }

    // Delete existing symptom relationships
    await prisma.diseaseSymptom.deleteMany({
      where: { diseaseId: Number(id) }
    });

    // Create new symptom relationships
    if (symptomIds.length > 0) {
      await prisma.diseaseSymptom.createMany({
        data: symptomIds.map(symptomId => ({
          diseaseId: Number(id),
          symptomId: Number(symptomId)
        }))
      });
    }

    // Fetch updated disease with symptoms
    const updatedDisease = await prisma.disease.findUnique({
      where: { id: Number(id) },
      include: {
        symptoms: {
          include: { symptom: true }
        }
      }
    });

    res.json({ message: "Disease symptoms updated successfully", disease: updatedDisease });
  } catch (error) {
    res.status(500).json({ message: "Error updating disease symptoms", error: error.message });
  }
};

export const createDisease = async (req, res) => {
  try {
    const { name, symptoms } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: "Disease name is required" });
    }

    const disease = await prisma.disease.create({
      data: {
        name,
        symptoms: symptoms ? {
          create: symptoms.map(s => ({ name: s }))
        } : undefined
      },
      include: { symptoms: true }
    });

    res.status(201).json(disease);
  } catch (error) {
    res.status(500).json({ message: "Error creating disease", error: error.message });
  }
};

export const updateDisease = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Disease name is required" });
    }

    const disease = await prisma.disease.update({
      where: { id: Number(id) },
      data: { name },
      include: { symptoms: true }
    });

    res.json({ message: "Disease updated successfully", disease });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Disease not found" });
    }
    res.status(500).json({ message: "Error updating disease", error: error.message });
  }
};

export const deleteDisease = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.disease.delete({
      where: { id: Number(id) }
    });

    res.json({ message: "Disease deleted successfully" });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Disease not found" });
    }
    res.status(500).json({ message: "Error deleting disease", error: error.message });
  }
};

export const getSymptoms = async (req, res) => {
  try {
    const symptoms = await prisma.symptom.findMany();
    res.json(symptoms);
  } catch (error) {
    res.status(500).json({ message: "Error fetching symptoms", error: error.message });
  }
};

export const getSymptomById = async (req, res) => {
  try {
    const { id } = req.params;
    const symptom = await prisma.symptom.findUnique({
      where: { id: Number(id) },
      include: { diseases: true, patientSymptoms: true }
    });

    if (!symptom) {
      return res.status(404).json({ message: "Symptom not found" });
    }

    res.json(symptom);
  } catch (error) {
    res.status(500).json({ message: "Error fetching symptom", error: error.message });
  }
};

export const createSymptom = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: "Symptom name is required" });
    }

    const symptom = await prisma.symptom.create({
      data: {
        name
      }
    });

    res.status(201).json(symptom);
  } catch (error) {
    res.status(500).json({ message: "Error creating symptom", error: error.message });
  }
};

export const updateSymptom = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Symptom name is required" });
    }

    const symptom = await prisma.symptom.update({
      where: { id: Number(id) },
      data: { name }
    });

    res.json({ message: "Symptom updated successfully", symptom });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Symptom not found" });
    }
    res.status(500).json({ message: "Error updating symptom", error: error.message });
  }
};

export const deleteSymptom = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.symptom.delete({
      where: { id: Number(id) }
    });

    res.json({ message: "Symptom deleted successfully" });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Symptom not found" });
    }
    res.status(500).json({ message: "Error deleting symptom", error: error.message });
  }
};

export const addSymptomToDisease = async (req, res) => {
  try {
    const { diseaseId, symptomId } = req.body;

    if (!diseaseId || !symptomId) {
      return res.status(400).json({ message: "diseaseId and symptomId are required" });
    }

    // Verify disease exists
    const disease = await prisma.disease.findUnique({
      where: { id: Number(diseaseId) }
    });
    if (!disease) {
      return res.status(404).json({ message: "Disease not found" });
    }

    // Verify symptom exists
    const symptom = await prisma.symptom.findUnique({
      where: { id: Number(symptomId) }
    });
    if (!symptom) {
      return res.status(404).json({ message: "Symptom not found" });
    }

    const relation = await prisma.diseaseSymptom.create({
      data: {
        diseaseId: Number(diseaseId),
        symptomId: Number(symptomId)
      }
    });

    res.status(201).json({ message: "Symptom added to disease successfully", relation });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({ message: "Symptom already added to this disease" });
    }
    res.status(500).json({ message: "Error adding symptom to disease", error: error.message });
  }
};

export const sendAppointmentReminders = async (req, res) => {
  try {
    const result = await sendUpcomingReminders(prisma);
    
    if (result.success) {
      res.json({
        message: `Successfully sent ${result.sent} reminder${result.sent !== 1 ? 's' : ''}`,
        count: result.sent
      });
    } else {
      res.status(500).json({ message: "Error sending reminders", error: result.error });
    }
  } catch (error) {
    res.status(500).json({ message: "Error sending reminders", error: error.message });
  }
};

