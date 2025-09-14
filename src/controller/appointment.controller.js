import prisma from "../utils/prisma-client.js";

// CREATE Appointment
export const createAppointment = async (req, res) => {
  try {
    const { patientId, doctorId, date, time } = req.body;

    if (!patientId || !doctorId || !date || !time) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if doctor is already booked
    const existing = await prisma.appointment.findFirst({
      where: {
        doctorId,
        date: new Date(date),
        time
      }
    });

    if (existing) {
      return res.status(400).json({ error: "Doctor already booked at this time" });
    }

    const appointment = await prisma.appointment.create({
      data: { patientId, doctorId, date: new Date(date), time }
    });

    res.json({ message: "Appointment created successfully", appointment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET all Appointments
export const getAppointments = async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany({
      include: { patient: true, doctor: true }
    });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET Appointment by ID
export const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await prisma.appointment.findUnique({
      where: { id: Number(id) },
      include: { patient: true, doctor: true }
    });

    if (!appointment) return res.status(404).json({ error: "Appointment not found" });
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE Appointment (status, date, time)
export const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time, status } = req.body;

    const appointment = await prisma.appointment.update({
      where: { id: Number(id) },
      data: { date: date ? new Date(date) : undefined, time, status }
    });

    res.json({ message: "Appointment updated successfully", appointment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE Appointment
export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.appointment.delete({ where: { id: Number(id) } });
    res.json({ message: "Appointment deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
//   user doctor lai diyeko  appointment  herni api.
