// Pseudo-solution for review.controller.js
import prisma from '../utils/prisma-clients.js';

// it is created to review a complete appointment
export const createReview = async (req, res) => {
  try {
    const { appointmentId, rating, comment } = req.body;
    const patientId = req.user.id;

    //  it id done for Basic validation
    if (!appointmentId) {
      return res.status(400).json({ error: 'appointmentId is required' });
    }
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'rating must be a number between 1 and 5' });
    }

    //  it is done to Fetch appointment and ensure it exists and is COMPLETED
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: { id: true, status: true, patientId: true, doctorId: true },
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // it is used to Normalize status check depending on how you store it
    if (!appointment.status || appointment.status.toString().toUpperCase() !== 'COMPLETED') {
      return res.status(400).json({ error: 'Cannot review an appointment that is not completed' });
    }

    // 2) it is used  Ensure logged-in user is the patient for this appointment
    if (appointment.patientId !== patientId) {
      return res.status(403).json({ error: 'You are not allowed to review this appointment' });
    }

    const doctorId = appointment.doctorId;
    if (!doctorId) {
      return res.status(400).json({ error: 'Appointment does not have an associated doctor' });
    }

    // Optional:  to reduce redundancy to prevent duplicate review for the same appointment by the same patient
    const existing = await prisma.review.findFirst({
      where: {
        appointmentId,
        patientId,
      },
    });
    if (existing) {
      return res.status(409).json({ error: 'A review for this appointment already exists' });
    }

    //  to Create the review 
    // to recalculate & update doctor's average rating
    const createdReview = await prisma.review.create({
      data: {
        appointmentId,
        reviewerId: patientId,
        doctorId,
        rating,
        comment: comment ?? null,
      },
      include: {
        //  it include patient basic information  if helpful 
        patient: { select: { id: true, name: true, email: true } },
      },
    });

    // Calculate new average rating for the doctor
    const ratingAgg = await prisma.review.aggregate({
      where: { doctorId },
      _avg: { rating: true },
      _count: { id: true },
    });

    // ratingAgg._avg.rating is the new average across all reviews for the doctor
    const newAvg = ratingAgg._avg && ratingAgg._avg.rating ? Number(ratingAgg._avg.rating.toFixed(2)) : rating;

    // Update doctor's ratings field
    await prisma.user.update({
      where: { id: doctorId },
      data: { ratings: newAvg },
    });

    return res.status(201).json({
      message: 'Review created',
      review: createdReview,
      doctorAverageRating: newAvg,
      reviewCount: ratingAgg._count ? ratingAgg._count.id : undefined,
    });
  } catch (err) {
    console.error('createReview error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
// pagination is the process of divinding content such as a document or search result , into seperate pages to make it 
// easier to navigate and read.
// to get all review  for a doctor (with optional pagination )
export const getDoctorReviews = async (req, res) => {
  try {
    const { doctorId } = req.params;
    //  to get optional query params for pagination
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const perPage = Math.min(50, Math.max(5, parseInt(req.query.perPage || '10', 10)));
    const skip = (page - 1) * perPage;

    if (!doctorId) {
      return res.status(400).json({ error: 'doctorId is required' });
    }

    // code for fetch reviews + patient info (and appointment info if needed)
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { doctorId: Number(doctorId) },
        orderBy: { createdAt: 'desc' },
        skip,
        take: perPage,
        include: {
          patient: { select: { id: true, name: true, profilePicture_: true } },
          appointment: { select: { id: true, scheduledAt: true } }, // optional
        },
      }),
      prisma.review.count({ where: { doctorId: Number(doctorId) } }),
    ]);

    // it is Also used as  optionally include the stored averageRating from doctor
    const doctor = await prisma.user.findUnique({
      where: { id: doctorId },
      select: { id: true, ratings: true },
    });

    return res.json({
      doctor: doctor ? { id: doctor.id, ratings: doctor.ratings } : null,
      meta: {
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
      },
      reviews,
    });
  } catch (err) {
    console.error('getDoctorReviews error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// // 1. Function to create a review
// export const createReview = async (req, res) => {
//     const { appointmentId, rating, comment } = req.body;
//     const patientId = req.user.id;

//     // 1. Check if appointment exists and is COMPLETED
//     // 2. Check if the logged-in user was the patient for this appointment
//     // 3. Create the review in the database
//     // 4. Recalculate and update the doctor's average rating
// };

// // 2. Function to get reviews for a doctor
// export const getDoctorReviews = async (req, res) => {
//     const { doctorId } = req.params;
//     // Fetch all reviews for the given doctorId
// };