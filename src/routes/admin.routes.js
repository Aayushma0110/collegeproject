import express from "express";
import { isAdmin } from "../middleware/admin.js";
import { auth } from "../middleware/auth.js";

import {getPendingDoctors,verifyDoctor,getAllAppointments,getAllPayments,} from "../controller/admin.controller.js";


const router = express.Router();


router.get("/admin/doctor", auth,isAdmin,getPendingDoctors);
router.put("/admin/doctor/:id/verify", auth,isAdmin, verifyDoctor);
router.get("/admin/appointments", auth,isAdmin, getAllAppointments);
router.get("/admin/payments", auth, isAdmin,getAllPayments);

export default router;
