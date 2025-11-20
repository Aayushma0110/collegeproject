// Pseudo-solution for review.routes.js
router.post("/", auth, isPatient, createReview);
router.get("/doctor/:doctorId", getDoctorReviews);