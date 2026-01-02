
import express from "express";
import { getAllUsers, createUser, getOneUser, deleteUser, updateUser, loginUser, passwordChange } from "../controller/user.controller.js"; 
import { auth } from "../middleware/auth.js";



const router = express.Router();


router.get("/", getAllUsers);
router.post("/", createUser);
router.get("/:id", getOneUser);
router.put("/:id", auth, updateUser);
router.post("/login", loginUser);
router.post("/password-change", auth, passwordChange);
router.delete("/:id", deleteUser);


 export default router;

