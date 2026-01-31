// it is routes file generally used to manage all the routes and routes file.

import express from 'express';
import authRoutes from "../routes/auth.routes.js";
import userRoutes from "../routes/user.routes.js";
import doctorRoutes from "../routes/doctor.routes.js";
import appointmentRoutes from "../routes/appointment.routes.js";
import paymentRoutes from "../routes/payment.routes.js";
import adminRoutes from "../routes/admin.routes.js";
import patientRoutes from "./patient.routes.js";
import reviewRoutes from "./review.routes.js";
import reminderRoutes from "./reminder.routes.js";
import diseaseRoutes from "./disease.routes.js";
import slotRoutes from "./slot.routes.js";
import publicRoutes from "./public.routes.js";
import { recommendDoctors } from "../controller/recommendation.controller.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// Auth routes
router.use("/auth", authRoutes);

// Public routes (no authentication required)
router.use("/public", publicRoutes);

router.use("/users", userRoutes);
router.use("/doctors", doctorRoutes);
router.use("/appointments", appointmentRoutes);
router.use("/payments", paymentRoutes);
router.use("/admin", adminRoutes);
router.use("/patients", patientRoutes);
router.use("/reviews", reviewRoutes);
router.use("/reminders", reminderRoutes);
router.use("/diseases", diseaseRoutes);
router.use("/slots", slotRoutes);
router.post("/recommendations/doctors", auth, recommendDoctors);

export default router;