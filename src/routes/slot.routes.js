import express from 'express';
import { auth } from '../middleware/auth.js';
import { isAdmin } from '../middleware/admin.js';
import {
  createSlots,
  getDoctorSlots,
  getAvailableSlots,
  bookSlot,
  cancelSlot,
  deleteSlot,
  getSlotDetails
} from '../controller/slot.controller.js';

const router = express.Router();

// Admin routes for managing slots
router.post('/create', auth, isAdmin, createSlots); // Create slots
router.get('/doctor/all', auth, getDoctorSlots); // Get all slots for current doctor (must come before :doctorId)
router.get('/doctor/:doctorId', auth, getDoctorSlots); // Get all slots for a doctor
router.get('/available/:doctorId', getAvailableSlots); // Get available slots (public)
router.get('/:slotId', auth, getSlotDetails); // Get slot details
router.post('/book', auth, bookSlot); // Book a slot
router.put('/:slotId/cancel', auth, cancelSlot); // Cancel a slot
router.delete('/:slotId', auth, isAdmin, deleteSlot); // Delete a slot

export default router;
