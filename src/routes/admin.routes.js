import express from "express";
import {
  getPendingDoctors,
  verifyDoctor,
  getAllAppointments,
  getAllPayments,
} from "../controllers/admin.controller.js";
import { isAdmin } from "../middlewares/admin.js";

const router = express.Router();

// Admin routes (protected)
router.get("/doctors", isAdmin, getPendingDoctors);
router.put("/doctors/:id/verify", isAdmin, verifyDoctor);
router.get("/appointments", isAdmin, getAllAppointments);
router.get("/payments", isAdmin, getAllPayments);

export default router;
