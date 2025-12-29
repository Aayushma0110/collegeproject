import prisma from '../utils/prisma-clients.js';

// CREATE Appointment
export const createAppointment = async (req, res) => {
  try {
    const { doctorId, scheduledAt } = req.body;

    if (!doctorId || !scheduledAt) {
      return res.status(400).json({ message: "doctorId and scheduledAt are required" });
    }

    const parsedDate = new Date(scheduledAt);
    if (isNaN(parsedDate)) {
      return res.status(400).json({
        message: "Invalid scheduledAt format. Use ISO 8601 (e.g., 2025-12-30T10:00:00.000Z)"
      });
    }

    // Ensure doctor exists and approved
    const doctor = await prisma.user.findUnique({ where: { id: doctorId } });
    if (!doctor || doctor.status !== "APPROVED") {
      return res.status(403).json({ message: "Doctor is not approved or does not exist" });
    }

    // Check for conflicts
    const existing = await prisma.appointment.findFirst({
      where: { doctorId, scheduledAt: parsedDate }
    });
    if (existing) {
      return res.status(400).json({ message: "Doctor already booked at this time" });
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId: req.user.id,
        doctorId,
        scheduledAt: parsedDate
      }
    });

    res.status(201).json({ message: "Appointment created successfully", appointment });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// GET All Appointments (for a patient or admin)
export const getAppointments = async (req, res) => {
  try {
    const user = req.user;

    let appointments;
    if (user.role === "ADMIN") {
      // Admin can see all appointments
      appointments = await prisma.appointment.findMany({
        include: {
          doctor: { select: { id: true, name: true, specialty: true } },
          patient: { select: { id: true, name: true, email: true } }
        },
        orderBy: { scheduledAt: 'asc' }
      });
    } else {
      // Patient can see only their own appointments
      appointments = await prisma.appointment.findMany({
        where: { patientId: user.id },
        include: { doctor: { select: { id: true, name: true, specialty: true } } },
        orderBy: { scheduledAt: 'asc' }
      });
    }

    res.status(200).json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// GET Single Appointment
export const getAppointmentById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const user = req.user;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        doctor: { select: { id: true, name: true, specialty: true } },
        patient: { select: { id: true, name: true, email: true } }
      }
    });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Only patient or admin can view
    if (user.role !== "ADMIN" && appointment.patientId !== user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// UPDATE Appointment (e.g., reschedule)
export const updateAppointment = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { scheduledAt } = req.body;
    const user = req.user;

    if (!scheduledAt) {
      return res.status(400).json({ message: "scheduledAt is required to update" });
    }

    const parsedDate = new Date(scheduledAt);
    if (isNaN(parsedDate)) {
      return res.status(400).json({ message: "Invalid scheduledAt format" });
    }

    const appointment = await prisma.appointment.findUnique({ where: { id } });
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    // Only patient who booked or admin can update
    if (user.role !== "ADMIN" && appointment.patientId !== user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Check doctor availability
    const conflict = await prisma.appointment.findFirst({
      where: { doctorId: appointment.doctorId, scheduledAt: parsedDate }
    });
    if (conflict) {
      return res.status(400).json({ message: "Doctor already booked at this time" });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: { scheduledAt: parsedDate }
    });

    res.status(200).json({ message: "Appointment updated successfully", appointment: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// DELETE Appointment
export const deleteAppointment = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const user = req.user;

    const appointment = await prisma.appointment.findUnique({ where: { id } });
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    // Only patient who booked or admin can delete
    if (user.role !== "ADMIN" && appointment.patientId !== user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    await prisma.appointment.delete({ where: { id } });
    res.status(200).json({ message: "Appointment deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
