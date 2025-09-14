import express from "express";
import {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient
} from "../controller/patient.controller.js";

const router = express.Router();
// get appintent by patient userid()
router.post("/", createPatient);        // Create patient
router.get("/", getPatients);           // Get all patients
router.get("/:id", getPatientById);     // Get single patient by ID
router.put("/:id", updatePatient);      // Update patient
router.delete("/:id", deletePatient);   // Delete patient

export default router;
