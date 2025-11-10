import express from "express";
import { auth } from "../middleware/auth.js";
const router = express.Router();
import {createAppointment,getAppointments,getAppointmentById,updateAppointment,deleteAppointment} from "../controller/appointment.controller.js";


router.post("/appointment", createAppointment);       
router.get("/appointment/me", getAppointments);          
router.get("/appointment/:id/status:id",getAppointmentById);    
router.put("/appointment/:id/reschedule", auth,updateAppointment);     
router.delete("/appointment/:id",auth, deleteAppointment);  

export default router;
