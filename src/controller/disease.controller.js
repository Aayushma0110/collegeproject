import prisma from '../utils/prisma-clients.js';

/**
 * Fetch all diseases from the database
 */
export const getDiseases = async (req, res) => {
  try {
    const diseases = await prisma.disease.findMany({
      include: {
        symptoms: {
          include: {
            symptom: true
          }
        }
      }
    });
    res.json(diseases);
  } catch (error) {
    console.error('Error fetching diseases:', error);
    res.status(500).json({ message: 'Failed to fetch diseases' });
  }
};

/**
 * Fetch all symptoms from the database
 */
export const getSymptoms = async (req, res) => {
  try {
    const symptoms = await prisma.symptom.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(symptoms);
  } catch (error) {
    console.error('Error fetching symptoms:', error);
    res.status(500).json({ message: 'Failed to fetch symptoms' });
  }
};

/**
 * Get diseases and symptoms grouped for problem selection
 */
export const getDiseasesWithSymptoms = async (req, res) => {
  try {
    const diseases = await prisma.disease.findMany({
      include: {
        symptoms: {
          include: {
            symptom: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    console.log(`Retrieved ${diseases.length} diseases from database`);

    const formattedDiseases = diseases.map(disease => ({
      id: disease.id,
      name: disease.name,
      specialty: disease.specialty,
      symptoms: disease.symptoms.map(ds => ({
        id: ds.symptom.id,
        name: ds.symptom.name
      }))
    }));

    console.log('Formatted diseases:', formattedDiseases);

    res.json(formattedDiseases);
  } catch (error) {
    console.error('Error fetching diseases with symptoms:', error);
    res.status(500).json({ message: 'Failed to fetch diseases with symptoms' });
  }
};