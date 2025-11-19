import express from "express";
import {
  createPayment,
  getPayments,
  getPaymentById,
  updatePayment,
  deletePayment
} from "..controller/payment.controller.js";
import { auth} from "../middleware/auth.js";
const router = express.Router();

router.post("/payment", auth, createPayment);    
router.get("/payments", auth, getPayments);        
router.get("/payments/:id", auth, getPaymentById);    
router.put("/payments/:id/status", auth, updatePayment);  
router.delete("/payments/:id", auth, deletePayment);  

export default router;
