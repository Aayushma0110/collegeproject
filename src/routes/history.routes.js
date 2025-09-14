import express from "express";
import {
  getAllHistories,
  createHistory,
  getOneHistory,
  updateHistory,
  deleteHistory
} from "../controller/history.controller.js";

const router = express.Router();

router.post("/", createHistory);       // Create history
router.get("/", getAllHistories);      // Get all histories
router.get("/:id", getOneHistory);     // Get single history
router.put("/:id", updateHistory);     // Update history
router.delete("/:id", deleteHistory);  // Delete history

export default router;
