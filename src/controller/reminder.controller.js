import prisma from "../utils/prisma-clients.js";

export const getAllReminders = async (req, res) => {
  try {
    const reminders = await prisma.reminder.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        appointment: true
      },
      orderBy: { remindAt: "asc" }
    });

    res.json(reminders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reminders", error: error.message });
  }
};

export const getUserReminders = async (req, res) => {
  try {
    const reminders = await prisma.reminder.findMany({
      where: { userId: req.user.id },
      include: {
        appointment: {
          include: {
            doctor: { select: { id: true, name: true } },
            patient: { select: { id: true, name: true } }
          }
        }
      },
      orderBy: { remindAt: "asc" }
    });

    res.json(reminders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reminders", error: error.message });
  }
};

export const getRemindersByUserId = async (req, res) => {
  try {
    const { id } = req.params;

    const reminders = await prisma.reminder.findMany({
      where: { userId: Number(id) },
      include: {
        appointment: {
          include: {
            doctor: { select: { id: true, name: true } },
            patient: { select: { id: true, name: true } }
          }
        }
      },
      orderBy: { remindAt: "asc" }
    });

    res.json(reminders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reminders", error: error.message });
  }
};

export const createReminder = async (req, res) => {
  try {
    const { appointmentId, remindAt, type } = req.body;

    if (!appointmentId || !remindAt || !type) {
      return res.status(400).json({ message: "appointmentId, remindAt, and type are required" });
    }

    // Verify appointment exists
    const appointment = await prisma.appointment.findUnique({
      where: { id: Number(appointmentId) }
    });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const reminder = await prisma.reminder.create({
      data: {
        userId: req.user.id,
        appointmentId: Number(appointmentId),
        remindAt: new Date(remindAt),
        type: type
      },
      include: {
        appointment: true
      }
    });

    res.status(201).json({ message: "Reminder created successfully", reminder });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({ message: "Reminder already exists for this appointment" });
    }
    res.status(500).json({ message: "Error creating reminder", error: error.message });
  }
};

export const markReminderAsSent = async (req, res) => {
  try {
    const { id } = req.params;

    const reminder = await prisma.reminder.update({
      where: { id: Number(id) },
      data: { isSent: true }
    });

    res.json({ message: "Reminder marked as sent", reminder });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Reminder not found" });
    }
    res.status(500).json({ message: "Error updating reminder", error: error.message });
  }
};

export const updateReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const { remindAt, type } = req.body;

    const updateData = {};
    if (remindAt) updateData.remindAt = new Date(remindAt);
    if (type) updateData.type = type;

    const reminder = await prisma.reminder.update({
      where: { id: Number(id) },
      data: updateData,
      include: { appointment: true }
    });

    res.json({ message: "Reminder updated successfully", reminder });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Reminder not found" });
    }
    res.status(500).json({ message: "Error updating reminder", error: error.message });
  }
};

export const deleteReminder = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.reminder.delete({
      where: { id: Number(id) }
    });

    res.json({ message: "Reminder deleted successfully" });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Reminder not found" });
    }
    res.status(500).json({ message: "Error deleting reminder", error: error.message });
  }
};
