// src/routes/doctor.routes.js
import express from "express";
import { getDoctors, getDoctorById, updateAvailability } from "../controllers/doctor.controller.js";
import { isDoctor } from "../middleware/doctor.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getDoctors); // public
router.get("/:id", getDoctorById); // public
router.put("/me/availability", verifyToken, isDoctor, updateAvailability); // protected

export default router;

