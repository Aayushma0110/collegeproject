import express from "express";
import { auth } from "../middleware/auth.js";
import {
  getAllReminders,
  getUserReminders,
  getRemindersByUserId,
  createReminder,
  markReminderAsSent,
  updateReminder,
  deleteReminder
} from "../controller/reminder.controller.js";

const router = express.Router();

router.get("/", auth, getAllReminders);
router.get("/user", auth, getUserReminders);
router.get("/user/:id", auth, getRemindersByUserId);
router.post("/", auth, createReminder);
router.put("/:id", auth, updateReminder);
router.patch("/:id/sent", auth, markReminderAsSent);
router.delete("/:id", auth, deleteReminder);

export default router;
