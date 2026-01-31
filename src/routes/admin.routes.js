import express from "express";
import { isAdmin } from "../middleware/admin.js";
import { auth } from "../middleware/auth.js";

import {
  getPendingDoctors,
  getAllDoctors,
  verifyDoctor,
  regenerateDoctorSlots,
  getAllAppointments,
  getAppointmentsReport,
  getAllPayments,
  getRevenueReport,
  getStats,
  getAllUsers,
  getDiseases,
  getDiseaseById,
  getDiseaseSymptoms,
  updateDiseaseSymptoms,
  createDisease,
  updateDisease,
  deleteDisease,
  getSymptoms,
  getSymptomById,
  createSymptom,
  updateSymptom,
  deleteSymptom,
  addSymptomToDisease,
  sendAppointmentReminders,
} from "../controller/admin.controller.js";

const router = express.Router();

// Pseudo-solution for admin.routes.js
router.get("/doctors", auth, isAdmin, getAllDoctors); // Get all doctors
router.get("/doctors/pending", auth, isAdmin, getPendingDoctors); // Get pending doctors only
router.put("/doctors/:id/verify", auth, isAdmin, verifyDoctor);
router.post("/doctors/:doctorId/regenerate-slots", auth, isAdmin, regenerateDoctorSlots); // Regenerate slots for a doctor
router.get("/appointments", auth, isAdmin, getAllAppointments);
router.get("/appointments/report", auth, isAdmin, getAppointmentsReport);
router.get("/payments", auth, isAdmin, getAllPayments);
router.get("/revenue/report", auth, isAdmin, getRevenueReport);
router.get("/stats", auth, isAdmin, getStats);
router.get("/users", auth, isAdmin, getAllUsers);
router.get("/diseases", auth, isAdmin, getDiseases);
router.get("/diseases/:id", auth, isAdmin, getDiseaseById);
router.get("/diseases/:id/symptoms", auth, isAdmin, getDiseaseSymptoms);
router.put("/diseases/:id/symptoms", auth, isAdmin, updateDiseaseSymptoms);
router.post("/diseases", auth, isAdmin, createDisease);
router.put("/diseases/:id", auth, isAdmin, updateDisease);
router.delete("/diseases/:id", auth, isAdmin, deleteDisease);
router.post("/diseases/symptoms", auth, isAdmin, addSymptomToDisease);
router.get("/symptoms", auth, isAdmin, getSymptoms);
router.get("/symptoms/:id", auth, isAdmin, getSymptomById);
router.post("/symptoms", auth, isAdmin, createSymptom);
router.put("/symptoms/:id", auth, isAdmin, updateSymptom);
router.delete("/symptoms/:id", auth, isAdmin, deleteSymptom);
router.post("/reminders/send-upcoming", auth, isAdmin, sendAppointmentReminders);

export default router;
