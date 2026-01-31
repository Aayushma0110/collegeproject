/**
 * Smart Appointment Booking Algorithms
 * Provides intelligent slot recommendations and auto-scheduling
 */

import prisma from './prisma-clients.js';

/**
 * Algorithm 1: Smart Slot Recommendation
 * Scores slots based on multiple factors:
 * - Doctor availability
 * - Doctor ratings
 * - Wait time
 * - Patient preferences
 * - Distance/Location
 */
export const getSmartSlotRecommendations = async ({
  expertiseId,
  patientId,
  preferredDate,
  preferredTimeRange, // { start: '09:00', end: '12:00' }
  urgency = 'NORMAL', // URGENT, NORMAL, FLEXIBLE
  maxResults = 10,
}) => {
  try {
    // Get all available doctors with the expertise
    const whereClause = {
      role: 'DOCTOR',
      status: 'APPROVED',
    };

    // Only add doctorProfile filter if expertiseId is provided
    if (expertiseId) {
      whereClause.doctorProfile = {
        is: {
          expertise: {
            some: {
              id: parseInt(expertiseId),
            },
          },
        },
      };
    }

    const doctors = await prisma.user.findMany({
      where: whereClause,
      include: {
        doctorProfile: {
          include: {
            expertise: true,
          },
        },
        timeSlots: {
          where: {
            isBooked: false,
            startTime: {
              gte: urgency === 'URGENT' ? new Date() : preferredDate || new Date(),
            },
          },
          orderBy: {
            startTime: 'asc',
          },
          take: 20, // Get first 20 available slots per doctor
        },
      },
    });

    // Score and rank slots
    const rankedSlots = [];

    for (const doctor of doctors) {
      for (const slot of doctor.timeSlots) {
        const score = calculateSlotScore({
          doctor,
          slot,
          preferredTimeRange,
          urgency,
        });

        rankedSlots.push({
          slotId: slot.id,
          doctorId: doctor.id,
          doctorName: doctor.name,
          doctorRating: doctor.ratings || 0,
          expertise: doctor.doctorProfile?.expertise?.name,
          fees: doctor.doctorProfile?.fees || 0,
          experience: doctor.doctorProfile?.experience || 0,
          city: doctor.doctorProfile?.city,
          startTime: slot.startTime,
          endTime: slot.endTime,
          score: score,
          recommendationReason: getRecommendationReason(score, doctor, slot),
        });
      }
    }

    // Sort by score (highest first) and return top results
    return rankedSlots
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults);
  } catch (error) {
    console.error('Smart slot recommendation error:', error);
    throw error;
  }
};

/**
 * Calculate slot score based on multiple factors
 */
function calculateSlotScore({ doctor, slot, preferredTimeRange, urgency }) {
  let score = 100; // Base score

  // Factor 1: Doctor Rating (0-40 points)
  const ratingScore = (doctor.ratings || 0) * 8; // 5-star = 40 points
  score += ratingScore;

  // Factor 2: Experience (0-20 points)
  const experienceYears = doctor.doctorProfile?.experience || 0;
  const experienceScore = Math.min(experienceYears * 2, 20);
  score += experienceScore;

  // Factor 3: Time Preference Match (0-30 points)
  if (preferredTimeRange) {
    const slotHour = new Date(slot.startTime).getHours();
    const [startHour] = preferredTimeRange.start.split(':').map(Number);
    const [endHour] = preferredTimeRange.end.split(':').map(Number);

    if (slotHour >= startHour && slotHour <= endHour) {
      score += 30; // Perfect time match
    } else {
      const hoursDiff = Math.min(
        Math.abs(slotHour - startHour),
        Math.abs(slotHour - endHour)
      );
      score += Math.max(0, 30 - hoursDiff * 5); // Penalty for time difference
    }
  }

  // Factor 4: Urgency (immediate slots get bonus for urgent cases)
  if (urgency === 'URGENT') {
    const hoursUntilSlot = (new Date(slot.startTime) - new Date()) / (1000 * 60 * 60);
    if (hoursUntilSlot < 4) {
      score += 40; // High bonus for slots within 4 hours
    } else if (hoursUntilSlot < 24) {
      score += 20; // Medium bonus for slots within 24 hours
    }
  }

  // Factor 5: Fees (lower fees get slight bonus)
  const fees = doctor.doctorProfile?.fees || 1000;
  const feeScore = Math.max(0, 10 - fees / 100); // Max 10 points for low fees
  score += feeScore;

  return Math.round(score);
}

/**
 * Generate human-readable recommendation reason
 */
function getRecommendationReason(score, doctor, slot) {
  const reasons = [];

  if (doctor.ratings >= 4.5) reasons.push('Highly rated doctor');
  if ((doctor.doctorProfile?.experience || 0) >= 10) reasons.push('Experienced specialist');
  
  const hoursUntilSlot = (new Date(slot.startTime) - new Date()) / (1000 * 60 * 60);
  if (hoursUntilSlot < 4) reasons.push('Available soon');
  if (hoursUntilSlot < 24) reasons.push('Same-day appointment');

  if ((doctor.doctorProfile?.fees || 0) < 500) reasons.push('Affordable');

  if (reasons.length === 0) reasons.push('Available slot');

  return reasons.join(', ');
}

/**
 * Algorithm 2: Auto-Schedule Appointment
 * Automatically finds and books the best available slot
 */
export const autoScheduleAppointment = async ({
  patientId,
  expertiseId,
  urgency = 'NORMAL',
  preferredDate,
  preferredTimeRange,
  problems,
}) => {
  try {
    // Get smart recommendations
    const recommendations = await getSmartSlotRecommendations({
      expertiseId,
      patientId,
      preferredDate,
      preferredTimeRange,
      urgency,
      maxResults: 5,
    });

    if (recommendations.length === 0) {
      throw new Error('No available slots found matching your criteria');
    }

    // Select the best slot (highest score)
    const bestSlot = recommendations[0];

    // Create problem record if provided
    let problemId = null;
    if (problems && (problems.diseases || problems.symptoms)) {
      const problemDescription = {
        diseases: problems.diseases || [],
        symptoms: problems.symptoms || [],
      };

      const problem = await prisma.problem.create({
        data: {
          name: problems.diseases ? problems.diseases.join(', ') : 'General consultation',
          description: JSON.stringify(problemDescription),
        },
      });

      problemId = problem.id;
    }

    // Book the appointment
    const appointment = await prisma.$transaction(async (tx) => {
      // Check slot is still available and lock it
      const slot = await tx.timeSlot.findUnique({
        where: { id: bestSlot.slotId },
      });

      if (!slot || slot.isBooked) {
        throw new Error('Selected slot is no longer available');
      }

      await tx.timeSlot.update({
        where: { id: bestSlot.slotId },
        data: { isBooked: true },
      });

      // Create appointment
      return await tx.appointment.create({
        data: {
          doctorId: bestSlot.doctorId,
          patientId,
          slotId: bestSlot.slotId,
          problemId,
          status: urgency === 'URGENT' ? 'CONFIRMED' : 'CONFIRMED',
        },
        include: {
          doctor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          patient: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          slot: true,
          problem: true,
        },
      });
    });

    return {
      appointment,
      recommendation: bestSlot,
      alternativeSlots: recommendations.slice(1), // Other options
    };
  } catch (error) {
    console.error('Auto-schedule error:', error);
    throw error;
  }
};

/**
 * Algorithm 3: Load Balancing
 * Distributes appointments evenly across doctors
 */
export const getBalancedDoctorSlots = async ({ expertiseId, date }) => {
  try {
    const whereClause = {
      role: 'DOCTOR',
      status: 'APPROVED',
    };

    // Only add doctorProfile filter if expertiseId is provided
    if (expertiseId) {
      whereClause.doctorProfile = {
        is: {
          expertise: {
            some: {
              id: parseInt(expertiseId),
            },
          },
        },
      };
    }

    const doctors = await prisma.user.findMany({
      where: whereClause,
      include: {
        timeSlots: {
          where: {
            isBooked: false,
            startTime: {
              gte: date || new Date(),
              lt: date
                ? new Date(new Date(date).setDate(new Date(date).getDate() + 1))
                : undefined,
            },
          },
        },
        appointments: {
          where: {
            status: { in: ['CONFIRMED', 'PENDING'] },
          },
        },
      },
    });

    // Calculate load for each doctor
    const doctorLoads = doctors.map((doctor) => ({
      doctorId: doctor.id,
      doctorName: doctor.name,
      availableSlots: doctor.timeSlots.length,
      bookedAppointments: doctor.appointments.length,
      load: doctor.appointments.length / (doctor.timeSlots.length || 1), // Lower is better
      slots: doctor.timeSlots,
    }));

    // Sort by load (ascending - least busy first)
    return doctorLoads.sort((a, b) => a.load - b.load);
  } catch (error) {
    console.error('Load balancing error:', error);
    throw error;
  }
};

/**
 * Algorithm 4: Find Next Available Slot
 * Quickly finds the nearest available slot for a doctor or expertise
 */
export const findNextAvailableSlot = async ({ doctorId, expertiseId }) => {
  try {
    const where = {
      isBooked: false,
      startTime: { gte: new Date() },
    };

    if (doctorId) {
      where.doctorId = parseInt(doctorId);
    } else if (expertiseId) {
      where.doctor = {
        doctorProfile: {
          is: {
            expertise: {
              some: {
                id: parseInt(expertiseId),
              },
            },
          },
        },
      };
    }

    const nextSlot = await prisma.timeSlot.findFirst({
      where,
      orderBy: { startTime: 'asc' },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            ratings: true,
          },
        },
      },
    });

    return nextSlot;
  } catch (error) {
    console.error('Find next slot error:', error);
    throw error;
  }
};

/**
 * Algorithm 5: Conflict Resolution
 * Finds alternative slots if preferred slot is booked
 */
export const findAlternativeSlots = async ({
  originalSlotId,
  count = 5,
  sameDayOnly = false,
}) => {
  try {
    const originalSlot = await prisma.timeSlot.findUnique({
      where: { id: parseInt(originalSlotId) },
      include: {
        doctor: true,
      },
    });

    if (!originalSlot) {
      throw new Error('Original slot not found');
    }

    const slotDate = new Date(originalSlot.startTime);
    const whereConditions = {
      doctorId: originalSlot.doctorId,
      isBooked: false,
      id: { not: originalSlot.id },
      startTime: { gte: new Date() },
    };

    if (sameDayOnly) {
      const dayStart = new Date(slotDate.setHours(0, 0, 0, 0));
      const dayEnd = new Date(slotDate.setHours(23, 59, 59, 999));
      whereConditions.startTime.gte = dayStart;
      whereConditions.startTime.lte = dayEnd;
    }

    const alternatives = await prisma.timeSlot.findMany({
      where: whereConditions,
      orderBy: { startTime: 'asc' },
      take: count,
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return alternatives;
  } catch (error) {
    console.error('Find alternatives error:', error);
    throw error;
  }
};

/**
 * Algorithm 6: Smart Rescheduling
 * Intelligently reschedules cancelled appointments
 */
export const suggestRescheduleOptions = async ({ appointmentId, maxOptions = 5 }) => {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: parseInt(appointmentId) },
      include: {
        slot: true,
        doctor: true,
      },
    });

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    // Find slots from the same doctor
    const sameDoctorSlots = await prisma.timeSlot.findMany({
      where: {
        doctorId: appointment.doctorId,
        isBooked: false,
        startTime: { gte: new Date() },
      },
      orderBy: { startTime: 'asc' },
      take: maxOptions,
    });

    // If not enough, find slots from doctors with same expertise
    let alternativeDoctorSlots = [];
    if (sameDoctorSlots.length < maxOptions) {
      const doctorProfile = await prisma.doctorProfile.findUnique({
        where: { userId: appointment.doctorId },
        include: {
          expertise: true,
        },
      });

      if (doctorProfile?.expertise && doctorProfile.expertise.length > 0) {
        // Get the first expertise ID from the doctor's expertise array
        const expertiseIds = doctorProfile.expertise.map(exp => exp.id);
        
        alternativeDoctorSlots = await prisma.timeSlot.findMany({
          where: {
            doctorId: { not: appointment.doctorId },
            isBooked: false,
            startTime: { gte: new Date() },
            doctor: {
              doctorProfile: {
                is: {
                  expertise: {
                    some: {
                      id: { in: expertiseIds },
                    },
                  },
                },
              },
            },
          },
          include: {
            doctor: {
              select: {
                id: true,
                name: true,
                ratings: true,
              },
            },
          },
          orderBy: { startTime: 'asc' },
          take: maxOptions - sameDoctorSlots.length,
        });
      }
    }

    return {
      sameDoctorSlots: sameDoctorSlots.map((slot) => ({
        ...slot,
        preference: 'SAME_DOCTOR',
      })),
      alternativeDoctorSlots: alternativeDoctorSlots.map((slot) => ({
        ...slot,
        preference: 'ALTERNATIVE_DOCTOR',
      })),
    };
  } catch (error) {
    console.error('Suggest reschedule error:', error);
    throw error;
  }
};
