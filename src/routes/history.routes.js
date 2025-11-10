import express from "express";
import {getAllHistories,createHistory,getOneHistory,updateHistory,deleteHistory} from "../controller/history.controller.js";

const router = express.Router();

router.post("/", createHistory);    
router.get("/", getAllHistories);     
router.get("/:id", getOneHistory);   
router.put("/:id", updateHistory);  
router.delete("/:id", deleteHistory);  
export default router;
