import prisma from '../utils/prisma-clients.js';

/**
 * Recommend doctors based on patient's diseases and symptoms
 * Scoring Formula: Specialty Match (50) + Doctor Rating (30) + Availability (20)
 */
export const recommendDoctors = async (req, res) => {
  try {
    const { diseaseIds, symptomIds } = req.body;

    if (!diseaseIds && !symptomIds) {
      return res.status(400).json({ message: "Please provide diseases or symptoms." });
    }

    // Allow either diseases or symptoms (or both)
    if ((!diseaseIds || diseaseIds.length === 0) && (!symptomIds || symptomIds.length === 0)) {
      return res.status(400).json({ message: 'Please provide at least one disease or symptom' });
    }

    // Fetch the diseases to get their specialties
    const diseases = await prisma.disease.findMany({
      where: { id: { in: diseaseIds || [] } }
    });

    // If only symptoms provided, find related diseases
    let allDiseases = [...diseases];
    if (symptomIds && symptomIds.length > 0) {
      const symptomsWithDiseases = await prisma.diseaseSymptom.findMany({
        where: { symptomId: { in: symptomIds } },
        include: { disease: true }
      });
      const diseasesFromSymptoms = symptomsWithDiseases.map(ds => ds.disease);
      // Merge and deduplicate
      const diseaseMap = new Map();
      [...allDiseases, ...diseasesFromSymptoms].forEach(d => diseaseMap.set(d.id, d));
      allDiseases = Array.from(diseaseMap.values());
    }

    console.log('Selected Diseases:', allDiseases.map(d => ({ id: d.id, name: d.name, specialty: d.specialty })));

    // Get all approved doctors with their profiles and availability
    const doctors = await prisma.user.findMany({
      where: {
        role: 'DOCTOR',
        doctorProfile: {
          status: 'APPROVED',
        },
      },
      include: {
        doctorProfile: true,
        availabilities: {
          where: {
            isActive: true,
          },
        },
      },
    });

    console.log(`Fetched ${doctors.length} approved doctors`);

    if (doctors.length === 0) {
      return res.json([]);
    }

    // Score and filter doctors based on specialty match
    const scoredDoctors = doctors
      .map((doctor) => {
        // Count how many selected diseases match doctor's specialty
        const matchedDiseases = allDiseases.filter(disease => 
          disease.specialty && 
          doctor.doctorProfile.specialty && 
          disease.specialty.toLowerCase() === doctor.doctorProfile.specialty.toLowerCase()
        );

        // Calculate score
        const score =
          matchedDiseases.length * 50 + // Specialty Match (50 points per match)
          (doctor.doctorProfile.ratings || 0) * 30 + // Doctor Rating (scaled 0-5, so up to 150 points)
          (doctor.availabilities.length > 0 ? 20 : 0); // Availability bonus

        const nextAvailableSlot = doctor.availabilities.length > 0 
          ? `${doctor.availabilities[0].day} ${doctor.availabilities[0].startTime}` 
          : null;

        console.log(`Doctor: ${doctor.name}, Specialty: ${doctor.doctorProfile.specialty}, Matched: ${matchedDiseases.length}, Score: ${score}`);

        return {
          id: doctor.id,
          name: doctor.name,
          specialty: doctor.doctorProfile.specialty || 'General Medicine',
          experience: doctor.doctorProfile.experience || 0,
          fees: doctor.doctorProfile.fees || 0,
          ratings: doctor.doctorProfile.ratings || 0,
          score,
          nextAvailable: nextAvailableSlot,
          matchReasons: generateRecommendationReason(
            matchedDiseases,
            doctor.doctorProfile.ratings || 0,
            nextAvailableSlot
          ),
        };
      })
      .sort((a, b) => b.score - a.score); // Sort by highest score first

    console.log(`Recommended ${scoredDoctors.length} doctors`);
    console.log('Final recommendations:', scoredDoctors.map(d => ({ name: d.name, score: d.score, specialty: d.specialty })));

    res.json(scoredDoctors);
  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({ message: 'Error generating recommendations', error: error.message });
  }
};

/**
 * Generate human-readable recommendation reason
 */
function generateRecommendationReason(matchedDiseases, rating, nextSlot) {
  const reasons = [];

  if (matchedDiseases && matchedDiseases.length > 0) {
    const diseaseNames = matchedDiseases.map(d => d.name).join(', ');
    reasons.push(`Specializes in ${diseaseNames}`);
  }

  if (rating >= 4.5) {
    reasons.push('Highly rated');
  } else if (rating >= 4.0) {
    reasons.push('Well rated');
  }

  if (nextSlot) {
    reasons.push(`Available: ${nextSlot}`);
  }

  return reasons.join(' • ') || 'Verified doctor';
}
