import express from "express";
import {
  createPayment,
  getPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
  getPaymentStatus,
  refundPayment
} from "../controller/payment.controller.js";
import { auth} from "../middleware/auth.js";
const router = express.Router();

router.post("/", auth, createPayment);    
router.get("/", auth, getPayments);        
router.get("/:id", auth, getPaymentById);    
router.put("/:id", auth, updatePayment);  
router.delete("/:id", auth, deletePayment);  
router.get("/:id/status", auth, getPaymentStatus);
router.post("/:id/refund", auth, refundPayment);

export default router;
