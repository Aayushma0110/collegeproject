import express from "express";
import {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment
} from "../controller/appointment.controller.js";

const router = express.Router();

router.post("/", createAppointment);       // Create
router.get("/", getAppointments);          // Read all
router.get("/:id", getAppointmentById);    // Read one
router.put("/:id", updateAppointment);     // Update
router.delete("/:id", deleteAppointment);  // Delete

export default router;
