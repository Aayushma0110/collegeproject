import prisma from '../utils/prisma-clients.js';

/**
 * Middleware to check if a time slot is already booked
 * Prevents double booking
 */
export const checkSlotAvailability = async (req, res, next) => {
  try {
    const { slotId } = req.body;

    if (!slotId) {
      return res.status(400).json({ message: 'Slot ID is required' });
    }

    // Check if slot exists and is available
    const slot = await prisma.timeSlot.findUnique({
      where: { id: parseInt(slotId) },
    });

    if (!slot) {
      return res.status(404).json({ message: 'Time slot not found' });
    }

    if (slot.isBooked) {
      return res.status(409).json({ 
        message: 'This slot is already booked. Please select another time slot.',
        conflictType: 'SLOT_ALREADY_BOOKED'
      });
    }

    // Check if slot is in the past
    if (new Date(slot.startTime) < new Date()) {
      return res.status(400).json({ 
        message: 'Cannot book a slot in the past',
        conflictType: 'SLOT_IN_PAST'
      });
    }

    // Attach slot to request for use in controller
    req.slot = slot;
    next();
  } catch (error) {
    console.error('Slot lock middleware error:', error);
    res.status(500).json({ message: 'Error checking slot availability', error: error.message });
  }
};
