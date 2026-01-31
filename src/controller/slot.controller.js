import prisma from '../utils/prisma-clients.js';

// Create slots for a doctor
export const createSlots = async (req, res) => {
  try {
    const { doctorId, date, startTime, endTime, duration = 60 } = req.body;

    if (!doctorId || !date || !startTime || !endTime) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Parse the date and times
    const slotDate = new Date(date);
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    // Create start and end times for this day
    const dayStart = new Date(slotDate);
    dayStart.setHours(startHour, startMin, 0, 0);

    const dayEnd = new Date(slotDate);
    dayEnd.setHours(endHour, endMin, 0, 0);

    // Generate slots based on duration
    const slots = [];
    let currentTime = new Date(dayStart);

    while (currentTime < dayEnd) {
      const slotStart = new Date(currentTime);
      const slotEnd = new Date(currentTime);
      slotEnd.setMinutes(slotEnd.getMinutes() + duration);

      if (slotEnd > dayEnd) break;

      slots.push({
        doctorId: parseInt(doctorId),
        date: slotDate,
        startTime: slotStart,
        endTime: slotEnd,
        isBooked: false,
        duration
      });

      currentTime = slotEnd;
    }

    // Insert all slots
    const createdSlots = await prisma.slot.createMany({
      data: slots,
      skipDuplicates: true
    });

    res.json({
      message: `Created ${createdSlots.count} slots successfully`,
      count: createdSlots.count
    });
  } catch (error) {
    console.error("Error creating slots:", error);
    res.status(500).json({ message: "Error creating slots", error: error.message });
  }
};

// Get doctor's slots
export const getDoctorSlots = async (req, res) => {
  try {
    let { doctorId } = req.params;
    const { date } = req.query;

    // If doctorId is 'all', don't filter by doctorId (get all slots)
    let where = {};
    
    if (doctorId && doctorId !== 'all') {
      where.doctorId = parseInt(doctorId);
      if (isNaN(where.doctorId)) {
        return res.status(400).json({ message: "Invalid doctorId" });
      }
    }

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      where.date = {
        gte: startDate,
        lte: endDate
      };
    }

    const slots = await prisma.slot.findMany({
      where,
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        appointments: {
          select: {
            id: true,
            patient: { select: { id: true, name: true, email: true } }
          }
        }
      },
      orderBy: { startTime: 'asc' }
    });

    res.json(slots);
  } catch (error) {
    console.error("Error fetching slots:", error);
    res.status(500).json({ message: "Error fetching slots", error: error.message });
  }
};

// Get available slots for a doctor
export const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    let where = {
      doctorId: parseInt(doctorId),
      isBooked: false
    };

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      where.date = {
        gte: startDate,
        lte: endDate
      };
    } else {
      // Default: get slots from today onwards
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      where.date = { gte: today };
    }

    const slots = await prisma.slot.findMany({
      where,
      orderBy: { startTime: 'asc' },
      take: 50 // Limit to 50 slots
    });

    res.json(slots);
  } catch (error) {
    console.error("Error fetching available slots:", error);
    res.status(500).json({ message: "Error fetching available slots", error: error.message });
  }
};

// Book a slot for an appointment
export const bookSlot = async (req, res) => {
  try {
    const { slotId, patientId, doctorId, mode = 'IN_PERSON' } = req.body;

    if (!slotId || !patientId || !doctorId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if slot exists and is available
    const slot = await prisma.slot.findUnique({
      where: { id: parseInt(slotId) }
    });

    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    if (slot.isBooked) {
      return res.status(400).json({ message: "Slot is already booked" });
    }

    if (slot.doctorId !== parseInt(doctorId)) {
      return res.status(400).json({ message: "Slot does not belong to this doctor" });
    }

    // Create appointment and mark slot as booked
    const appointment = await prisma.$transaction(async (tx) => {
      // Mark slot as booked
      await tx.slot.update({
        where: { id: parseInt(slotId) },
        data: { isBooked: true }
      });

      // Create appointment
      const apt = await tx.appointment.create({
        data: {
          doctorId: parseInt(doctorId),
          patientId: parseInt(patientId),
          slotId: parseInt(slotId),
          date: slot.date,
          startTime: slot.startTime.toISOString(),
          endTime: slot.endTime.toISOString(),
          mode,
          status: 'PENDING'
        },
        include: {
          doctor: { select: { id: true, name: true } },
          patient: { select: { id: true, name: true } }
        }
      });

      return apt;
    });

    res.status(201).json({
      message: "Appointment booked successfully",
      appointment
    });
  } catch (error) {
    console.error("Error booking slot:", error);
    res.status(500).json({ message: "Error booking slot", error: error.message });
  }
};

// Cancel a slot (make it available again)
export const cancelSlot = async (req, res) => {
  try {
    const { slotId } = req.params;

    const slot = await prisma.slot.findUnique({
      where: { id: parseInt(slotId) },
      include: { appointments: true }
    });

    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    if (slot.appointments.length > 0) {
      return res.status(400).json({ message: "Cannot cancel slot with existing appointment" });
    }

    const updatedSlot = await prisma.slot.update({
      where: { id: parseInt(slotId) },
      data: { isBooked: false }
    });

    res.json({ message: "Slot cancelled successfully", slot: updatedSlot });
  } catch (error) {
    console.error("Error cancelling slot:", error);
    res.status(500).json({ message: "Error cancelling slot", error: error.message });
  }
};

// Delete a slot
export const deleteSlot = async (req, res) => {
  try {
    const { slotId } = req.params;

    const slot = await prisma.slot.findUnique({
      where: { id: parseInt(slotId) },
      include: { appointments: true }
    });

    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    if (slot.appointments.length > 0) {
      return res.status(400).json({ message: "Cannot delete slot with existing appointment" });
    }

    await prisma.slot.delete({
      where: { id: parseInt(slotId) }
    });

    res.json({ message: "Slot deleted successfully" });
  } catch (error) {
    console.error("Error deleting slot:", error);
    res.status(500).json({ message: "Error deleting slot", error: error.message });
  }
};

// Get slot details
export const getSlotDetails = async (req, res) => {
  try {
    const { slotId } = req.params;

    const slot = await prisma.slot.findUnique({
      where: { id: parseInt(slotId) },
      include: {
        doctor: { select: { id: true, name: true, email: true } },
        appointments: {
          select: {
            id: true,
            patient: { select: { id: true, name: true, email: true } }
          }
        }
      }
    });

    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    res.json(slot);
  } catch (error) {
    console.error("Error fetching slot details:", error);
    res.status(500).json({ message: "Error fetching slot details", error: error.message });
  }
};
