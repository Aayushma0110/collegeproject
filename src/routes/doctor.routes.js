
import express from "express";
import { getDoctors, getDoctorById, updateAvailability, registerDoctor } from "../controller/doctor.controller.js";
import { isDoctor } from "../middleware/doctor.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

 router.post("/",registerDoctor);
router.get("/", auth,getDoctors); 
router.get("/:id", getDoctorById); 
// Pseudo-solution for doctor.routes.js
router.put("/me/availability", auth, isDoctor, updateAvailability); 
export default router;

