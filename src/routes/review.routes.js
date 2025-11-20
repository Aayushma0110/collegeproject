// Pseudo-solution for review.routes.js
import express from "express";
import { createReview, getDoctorReviews } from "../controller/review.controller.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

//  it is used Create a new review (only authenticated patients)
router.post("/", auth, createReview);

//  it is  used to Get all reviews for a specific doctor
router.get("/doctor/:doctorId", getDoctorReviews);

// Optional: if you want to add update or delete later, you can add: it is neccessary or  not
// router.put("/:id", auth, updateReview);
// router.delete("/:id", auth, deleteReview);

export default router;








// router.post("/", auth, isPatient, createReview);
// router.get("/doctor/:doctorId", getDoctorReviews);