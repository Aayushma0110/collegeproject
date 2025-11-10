// it is routes file generally used to manage all the routes and routes file.

import express from 'express';
import userRoutes from "../routes/user.routes.js";
import doctorRoutes from "../routes/doctor.routes.js";
import appointmentRoutes from "../routes/appointment.routes.js";
import paymentRoutes from "../routes/payment.routes.js";
import adminRoutes from "../routes/admin.routes.js";

const router = express.Router();

router.use("/users", userRoutes);
router.use("/doctors", doctorRoutes);
router.use("/appointments", appointmentRoutes);
router.use("/payments", paymentRoutes);
router.use("/admin", adminRoutes);


export default router;