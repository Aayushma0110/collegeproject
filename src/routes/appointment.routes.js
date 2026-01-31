import express from "express";
import { auth } from "../middleware/auth.js";
import { isPatient } from '../middleware/patient.js';
import {createAppointment,getAppointments,getAppointmentById,updateAppointment,deleteAppointment, getAppointmentsByPatientId, getAppointmentsByDoctorId, approveAppointment} from "../controller/appointment.controller.js";
const router = express.Router();


router.post("/", auth, isPatient, createAppointment); // Let's protect this route       
router.get("/", auth, getAppointments); // This should get the user's appointments, not all
router.get("/:id", auth, getAppointmentById);    
router.put("/:id", auth, updateAppointment); // Generic update for status or rescheduling
router.put("/:id/approve", auth, approveAppointment); // Approve appointment
router.delete("/:id", auth, deleteAppointment); 
router.get("/patient/:id", auth, getAppointmentsByPatientId);
router.get("/doctor/:id", auth, getAppointmentsByDoctorId);

export default router;
