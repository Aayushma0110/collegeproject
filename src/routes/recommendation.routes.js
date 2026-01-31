import express from 'express';
import { recommendDoctors } from '../controller/recommendation.controller.js';
import { getDoctorById } from '../controller/doctor.controller.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// POST /api/recommendations/doctors - Get doctor recommendations based on diseases/symptoms
router.post('/doctors', auth, recommendDoctors);

// GET /api/recommendations/doctor/:id - Get doctor profile for viewing
router.get('/doctor/:id', auth, getDoctorById);

export default router;
