import prisma from './src/utils/prisma-clients.js';

// Map of disease names to their primary medical specialty
const diseaseSpecialtyMap = {
  'Hypertension': 'Cardiology',
  'Diabetes': 'Endocrinology',
  'Asthma': 'Pulmonology',
  'Arthritis': 'Rheumatology',
  'Migraine': 'Neurology',
  'Gastritis': 'Gastroenterology',
  'Pneumonia': 'Pulmonology',
  'Tuberculosis': 'Pulmonology',
  'Thyroid Disorder': 'Endocrinology',
  'Anemia': 'Hematology',
  'Dengue Fever': 'Infectious Disease',
  'Typhoid': 'Infectious Disease',
  'Common Cold': 'General Medicine'
};

const diseasesData = [
  {
    name: 'Hypertension',
    symptoms: [
      'Headache',
      'Chest pain',
      'Dizziness',
      'Shortness of breath',
      'Nosebleeds',
      'Fatigue'
    ]
  },
  {
    name: 'Diabetes',
    symptoms: [
      'Increased thirst',
      'Frequent urination',
      'Extreme hunger',
      'Unexplained weight loss',
      'Fatigue',
      'Blurred vision',
      'Slow-healing sores',
      'Frequent infections'
    ]
  },
  {
    name: 'Asthma',
    symptoms: [
      'Shortness of breath',
      'Chest tightness',
      'Wheezing',
      'Coughing',
      'Difficulty breathing',
      'Rapid breathing'
    ]
  },
  {
    name: 'Arthritis',
    symptoms: [
      'Joint pain',
      'Joint stiffness',
      'Swelling',
      'Redness',
      'Decreased range of motion',
      'Warmth around joints'
    ]
  },
  {
    name: 'Migraine',
    symptoms: [
      'Severe headache',
      'Nausea',
      'Vomiting',
      'Sensitivity to light',
      'Sensitivity to sound',
      'Visual disturbances',
      'Aura'
    ]
  },
  {
    name: 'Gastritis',
    symptoms: [
      'Abdominal pain',
      'Nausea',
      'Vomiting',
      'Indigestion',
      'Loss of appetite',
      'Bloating',
      'Black stools'
    ]
  },
  {
    name: 'Pneumonia',
    symptoms: [
      'Chest pain',
      'Cough with phlegm',
      'Fever',
      'Chills',
      'Shortness of breath',
      'Fatigue',
      'Confusion (in older adults)'
    ]
  },
  {
    name: 'Tuberculosis',
    symptoms: [
      'Persistent cough',
      'Coughing up blood',
      'Chest pain',
      'Weight loss',
      'Fatigue',
      'Fever',
      'Night sweats',
      'Loss of appetite'
    ]
  },
  {
    name: 'Thyroid Disorder',
    symptoms: [
      'Fatigue',
      'Weight changes',
      'Mood changes',
      'Hair loss',
      'Dry skin',
      'Sensitivity to temperature',
      'Irregular heartbeat'
    ]
  },
  {
    name: 'Anemia',
    symptoms: [
      'Fatigue',
      'Weakness',
      'Pale skin',
      'Shortness of breath',
      'Dizziness',
      'Cold hands and feet',
      'Irregular heartbeat'
    ]
  },
  {
    name: 'Dengue Fever',
    symptoms: [
      'High fever',
      'Severe headache',
      'Pain behind eyes',
      'Joint pain',
      'Muscle pain',
      'Rash',
      'Nausea',
      'Vomiting',
      'Bleeding gums'
    ]
  },
  {
    name: 'Typhoid',
    symptoms: [
      'Prolonged fever',
      'Weakness',
      'Abdominal pain',
      'Headache',
      'Loss of appetite',
      'Rash',
      'Constipation or diarrhea'
    ]
  },
  {
    name: 'Common Cold',
    symptoms: [
      'Runny nose',
      'Sneezing',
      'Sore throat',
      'Cough',
      'Congestion',
      'Mild headache',
      'Low-grade fever'
    ]
  },
  {
    name: 'Influenza',
    symptoms: [
      'High fever',
      'Body aches',
      'Chills',
      'Fatigue',
      'Cough',
      'Sore throat',
      'Headache',
      'Congestion'
    ]
  },
  {
    name: 'COVID-19',
    symptoms: [
      'Fever',
      'Dry cough',
      'Fatigue',
      'Loss of taste or smell',
      'Shortness of breath',
      'Sore throat',
      'Body aches',
      'Headache'
    ]
  }
];

async function seedDiseases() {
  console.log('Starting disease seeding...');

  try {
    // Clear existing data (in correct order due to foreign keys)
    console.log('Clearing existing data...');
    await prisma.diseaseSymptom.deleteMany({});
    await prisma.patientSymptom.deleteMany({});
    await prisma.symptom.deleteMany({});
    await prisma.disease.deleteMany({});

    // Create diseases and symptoms
    for (const diseaseData of diseasesData) {
      console.log(`Creating disease: ${diseaseData.name}...`);
      
      // Get specialty from map or use default
      const specialty = diseaseSpecialtyMap[diseaseData.name] || 'General Medicine';
      
      // First create the disease
      const disease = await prisma.disease.create({
        data: {
          name: diseaseData.name,
          specialty: specialty
        }
      });

      // Then create/link symptoms
      for (const symptomName of diseaseData.symptoms) {
        // Check if symptom exists, if not create it
        let symptom = await prisma.symptom.findUnique({
          where: { name: symptomName }
        });

        if (!symptom) {
          symptom = await prisma.symptom.create({
            data: { name: symptomName }
          });
        }

        // Link disease to symptom via DiseaseSymptom
        await prisma.diseaseSymptom.create({
          data: {
            diseaseId: disease.id,
            symptomId: symptom.id
          }
        });
      }

      console.log(`✓ Created ${diseaseData.name} (${specialty}) with ${diseaseData.symptoms.length} symptoms`);
    }

    console.log('\n✅ Disease seeding completed successfully!');
    console.log(`Total diseases created: ${diseasesData.length}`);

    // Show summary
    const totalSymptoms = await prisma.symptom.count();
    const totalDiseases = await prisma.disease.count();
    const totalMappings = await prisma.diseaseSymptom.count();
    console.log(`Total symptoms created: ${totalSymptoms}`);
    console.log(`Total disease-symptom mappings: ${totalMappings}`);

  } catch (error) {
    console.error('❌ Error seeding diseases:', error);
    throw error;
  }
}

// Run the seed function
seedDiseases()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
