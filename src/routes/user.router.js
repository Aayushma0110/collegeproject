
import express from "express";
import { getAllUsers, createUser, getOneUser, deleteUser, updateUser,} from "../controller/user.controller.js"; 
import { getProfile, profileUpdate } from "../controller/user.controller.js"; 
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getAllUsers);
router.post("/", createUser);
router.get("/:id", getOneUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

router.get("/me", auth, getProfile);
router.get("/me/appointments", auth, getMyAppointmentHistory); 
router.put("/me", auth, profileUpdate);


router.get("/profile", (req, res) => {
  res.send("User profile page");
});

export default router;

