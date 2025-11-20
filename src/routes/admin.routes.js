import express from "express";
import { isAdmin } from "../middleware/admin.js";
import { auth } from "../middleware/auth.js";

import {getPendingDoctors,verifyDoctor,getAllAppointments,getAllPayments,} from "../controller/admin.controller.js";


const router = express.Router();


// Pseudo-solution for admin.routes.js
router.get("/doctors/pending", auth, isAdmin, getPendingDoctors);
router.put("/doctors/:id/verify", auth, isAdmin, verifyDoctor);
router.get("/appointments", auth, isAdmin, getAllAppointments);
router.get("/payments", auth, isAdmin, getAllPayments);

export default router;
