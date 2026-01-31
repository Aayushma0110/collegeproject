
import express from "express";
import { getDoctors, getDoctorById, searchDoctors, getAvailability, getAvailableSlots, updateAvailability, registerDoctor, createDoctorProfile } from "../controller/doctor.controller.js";
import { isDoctor } from "../middleware/doctor.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.post("/",registerDoctor);
router.post("/profile", auth, createDoctorProfile);
router.get("/", auth,getDoctors); 
// IMPORTANT: Specific routes must come BEFORE parameterized routes
router.get("/search", auth, searchDoctors); 
router.get("/:id/availability", getAvailability);
router.get("/:id/slots", getAvailableSlots);
router.get("/:id", getDoctorById); 
router.put("/me/availability", auth, isDoctor, updateAvailability); 
export default router;

