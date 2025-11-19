
import express from "express";
import { getDoctors, getDoctorById, updateAvailability } from "../controller/doctor.controller.js";
import { isDoctor } from "../middleware/doctor.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.get("/doctor", getDoctors); 
router.get("/doctor/:id", getDoctorById); 
router.put("/doctor/me/availability", verifyToken, isDoctor, updateAvailability); 

export default router;

