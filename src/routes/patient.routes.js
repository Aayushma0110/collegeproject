import express from "express";
import {createPatient,getPatients,updatePatients,getPatientSymptoms,addSymptomToPatient,removeSymptomFromPatient,addSymptomToCurrentPatient,} from "../controller/patient.controller.js";
import { auth} from "../middleware/auth.js";
const router = express.Router();

 router.post("/", auth,createPatient);      
router.get("/", auth, getPatients);         
router.post("/symptoms", auth, addSymptomToCurrentPatient);
router.get("/:id/symptoms", auth, getPatientSymptoms);
router.post("/:id/symptoms", auth, addSymptomToPatient);
router.delete("/:id/symptoms/:symptomId", auth, removeSymptomFromPatient);
router.put("/:id", auth, updatePatients);      

export default router;