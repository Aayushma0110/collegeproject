import express from "express";
import {getPatients,updatePatients,} from "../controller/patient.controller.js";
import { auth} from "../middleware/auth.js";
const router = express.Router();

// router.post("/", createPatient);      
router.get("/", auth, getPatients);         
// router.get("/:id", getPatientById);    
router.put("/:id", auth, updatePatients);      
// router.delete("/:id", deletePatient);   
export default router;