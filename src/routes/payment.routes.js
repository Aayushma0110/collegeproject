import express from "express";
import {
  createPayment,
  getPayments,
  getPaymentById,
  updatePayment,
  deletePayment
} from "../controller/payment.controller.js";

const router = express.Router();

router.post("/", createPayment);       // Create payment
router.get("/", getPayments);          // Get all payments
router.get("/:id", getPaymentById);    // Get single payment
router.put("/:id", updatePayment);     // Update payment
router.delete("/:id", deletePayment);  // Delete payment

export default router;
