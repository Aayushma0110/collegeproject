import express from "express";
import { auth } from "../middleware/auth.js";
import { isPatient } from '../middleware/patient.js';
router.post("/", auth, isPatient, createAppointment);
const router = express.Router();
import {createAppointment,getAppointments,getAppointmentById,updateAppointment,deleteAppointment} from "../controller/appointment.controller.js";


router.post("/", auth, createAppointment); // Let's protect this route       
router.get("/me", auth, getAppointments); // This should get the user's appointments, not all
router.get("/:id", auth, getAppointmentById);    
router.put("/:id", auth, updateAppointment); // Generic update for status or rescheduling     
router.delete("/:id", auth, deleteAppointment); 

export default router;
