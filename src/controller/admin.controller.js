import prisma  from '../utils/prisma-clients.js';


export const getPendingDoctors = async (req, res) => {
  try {
    const doctors = await prisma.user.findMany({
      where: { role: "DOCTOR", status: "PENDING" },
      select: {
        id: true,
        name: true,
        email: true,
        specialty: true,
        fees: true,
        status: true,
        createdAt: true,
      },
    });

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

    const doctor = await prisma.user.update({
      where: { id: Number(id) },
      data: { status },
    });

    res.json({ message: `Doctor ${status.toLowerCase()}`, doctor });
  } catch (error) {
    res.status(500).json({ message: "Error updating doctor status", error: error.message });
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
export const approveDoctor = async (req, res) => {
  const doctorId = Number(req.params.id);

  const doctor = await prisma.user.update({
    where: { id: doctorId },
    data: { isApproved: true }
  });

  res.json({
    message: "Doctor approved successfully",
    doctor
  });
};

