import prisma from './src/utils/prisma-clients.js';
import bcrypt from 'bcrypt';

async function seedDoctors() {
  try {
    console.log('Seeding realistic Nepal-based doctors...');

    // Realistic Nepali doctors with authentic information
    const doctors = [
      // Cardiology
      {
        name: 'Dr. Ramesh Khanal',
        email: 'ramesh.khanal@healthnepal.com',
        password: 'DoctorPass123!',
        specialty: 'Cardiology',
        experience: 15,
        fees: 2000,
        bio: 'Chief Cardiologist with extensive experience in interventional cardiology and cardiac rehabilitation. Specialized training from AIIMS Delhi.',
        degree: 'MBBS (IOM), MD Cardiology (TUTH)',
        nmcNumber: 'NMC-22001',
        institute: 'Tribhuvan University Teaching Hospital',
        city: 'Kathmandu'
      },
      {
        name: 'Dr. Sunita Thapa',
        email: 'sunita.thapa@healthnepal.com',
        password: 'DoctorPass123!',
        specialty: 'Cardiology',
        experience: 12,
        fees: 1800,
        bio: 'Experienced cardiologist with expertise in women\'s heart health and non-invasive cardiac procedures.',
        degree: 'MBBS (KUMMC), MD Cardiology (TUTH)',
        nmcNumber: 'NMC-22002',
        institute: 'Kathmandu Medical College',
        city: 'Kathmandu'
      },
      // Endocrinology
      {
        name: 'Dr. Ashok Adhikari',
        email: 'ashok.adhikari@healthnepal.com',
        password: 'DoctorPass123!',
        specialty: 'Endocrinology',
        experience: 13,
        fees: 1800,
        bio: 'Diabetes and endocrine disorder specialist. Expert in insulin management and thyroid diseases. Over 13 years of clinical practice.',
        degree: 'MBBS (IOM), MD Internal Medicine, DM Endocrinology',
        nmcNumber: 'NMC-22003',
        institute: 'Patan Academy of Health Sciences',
        city: 'Lalitpur'
      },
      {
        name: 'Dr. Priya Mishra',
        email: 'priya.mishra@healthnepal.com',
        password: 'DoctorPass123!',
        specialty: 'Endocrinology',
        experience: 10,
        fees: 1600,
        bio: 'Thyroid specialist and metabolic disease expert. Completed fellowship in endocrinology from Bangkok.',
        degree: 'MBBS (DMC), MD Endocrinology (TUTH)',
        nmcNumber: 'NMC-22004',
        institute: 'Kathmandu Medical College',
        city: 'Kathmandu'
      },
      // Gynecology
      {
        name: 'Dr. Anita Sharma',
        email: 'anita.sharma@healthnepal.com',
        password: 'DoctorPass123!',
        specialty: 'Gynecology',
        experience: 16,
        fees: 1900,
        bio: 'Senior Gynecologist and maternal care specialist. Expert in high-risk pregnancies and women\'s reproductive health.',
        degree: 'MBBS (IOM), MD Obstetrics & Gynecology (TUTH)',
        nmcNumber: 'NMC-22005',
        institute: 'Tribhuvan University Teaching Hospital',
        city: 'Kathmandu'
      },
      {
        name: 'Dr. Meena Paudel',
        email: 'meena.paudel@healthnepal.com',
        password: 'DoctorPass123!',
        specialty: 'Gynecology',
        experience: 11,
        fees: 1700,
        bio: 'Women\'s health specialist. Experienced in family planning, infertility treatment, and laparoscopic surgery.',
        degree: 'MBBS (KUMMC), MD OB-GYN (PAHS)',
        nmcNumber: 'NMC-22006',
        institute: 'Patan Academy of Health Sciences',
        city: 'Lalitpur'
      },
      {
        name: 'Dr. Neha Gurung',
        email: 'neha.gurung@healthnepal.com',
        password: 'DoctorPass123!',
        specialty: 'Gynecology',
        experience: 9,
        fees: 1500,
        bio: 'Gynecological endoscopy and infertility specialist. Graduated from prestigious medical college in Kathmandu.',
        degree: 'MBBS (MMIHS), MS OB-GYN (BPKIHS)',
        nmcNumber: 'NMC-22007',
        institute: 'Bhaktapur Hospital',
        city: 'Bhaktapur'
      },
      // Pulmonology
      {
        name: 'Dr. Deepak Sharma',
        email: 'deepak.sharma@healthnepal.com',
        password: 'DoctorPass123!',
        specialty: 'Pulmonology',
        experience: 14,
        fees: 1750,
        bio: 'Respiratory specialist with expertise in asthma, COPD, and tuberculosis management. Trained at AIIMS New Delhi.',
        degree: 'MBBS (IOM), MD Chest & TB (TUTH)',
        nmcNumber: 'NMC-22008',
        institute: 'National TB Center, Kathmandu',
        city: 'Kathmandu'
      },
      {
        name: 'Dr. Rajendra Koirala',
        email: 'rajendra.koirala@healthnepal.com',
        password: 'DoctorPass123!',
        specialty: 'Pulmonology',
        experience: 11,
        fees: 1600,
        bio: 'Chest disease specialist focusing on TB management and respiratory rehabilitation programs.',
        degree: 'MBBS (KUMMC), MD Chest Diseases (PAHS)',
        nmcNumber: 'NMC-22009',
        institute: 'Patan Academy of Health Sciences',
        city: 'Lalitpur'
      },
      // Rheumatology
      {
        name: 'Dr. Roshan Thapa',
        email: 'roshan.thapa@healthnepal.com',
        password: 'DoctorPass123!',
        specialty: 'Rheumatology',
        experience: 12,
        fees: 1700,
        bio: 'Joint disease specialist. Expert in rheumatoid arthritis, lupus, and other autoimmune diseases. Compassionate patient care.',
        degree: 'MBBS (DMC), MD Internal Medicine, DM Rheumatology',
        nmcNumber: 'NMC-22010',
        institute: 'Kathmandu Medical College',
        city: 'Kathmandu'
      },
      {
        name: 'Dr. Sushmita Joshi',
        email: 'sushmita.joshi@healthnepal.com',
        password: 'DoctorPass123!',
        specialty: 'Rheumatology',
        experience: 9,
        fees: 1500,
        bio: 'Arthritis and musculoskeletal disorder specialist. Provides comprehensive joint care and rehabilitation services.',
        degree: 'MBBS (IOM), MD Rheumatology (TUTH)',
        nmcNumber: 'NMC-22011',
        institute: 'Tribhuvan University Teaching Hospital',
        city: 'Kathmandu'
      },
      // Neurology
      {
        name: 'Dr. Bhoj Raj Singh',
        email: 'bhoj.singh@healthnepal.com',
        password: 'DoctorPass123!',
        specialty: 'Neurology',
        experience: 13,
        fees: 1900,
        bio: 'Neurologist specializing in migraines, epilepsy, and stroke management. Advanced certification in neurology.',
        degree: 'MBBS (IOM), MD Neurology (TUTH)',
        nmcNumber: 'NMC-22012',
        institute: 'Tribhuvan University Teaching Hospital',
        city: 'Kathmandu'
      },
      {
        name: 'Dr. Kalpana Rai',
        email: 'kalpana.rai@healthnepal.com',
        password: 'DoctorPass123!',
        specialty: 'Neurology',
        experience: 10,
        fees: 1700,
        bio: 'Headache and neurological disorder specialist. Experienced in migraine management and pain relief therapy.',
        degree: 'MBBS (KUMMC), MD Neurology (PAHS)',
        nmcNumber: 'NMC-22013',
        institute: 'Patan Academy of Health Sciences',
        city: 'Lalitpur'
      },
      // Gastroenterology
      {
        name: 'Dr. Anil Maharjan',
        email: 'anil.maharjan@healthnepal.com',
        password: 'DoctorPass123!',
        specialty: 'Gastroenterology',
        experience: 15,
        fees: 1850,
        bio: 'Senior gastroenterologist with expertise in endoscopy and digestive disease management. 15+ years experience.',
        degree: 'MBBS (IOM), MD Internal Medicine, DM Gastroenterology',
        nmcNumber: 'NMC-22014',
        institute: 'Tribhuvan University Teaching Hospital',
        city: 'Kathmandu'
      },
      {
        name: 'Dr. Shiva Adhikari',
        email: 'shiva.adhikari@healthnepal.com',
        password: 'DoctorPass123!',
        specialty: 'Gastroenterology',
        experience: 11,
        fees: 1650,
        bio: 'GI specialist focusing on liver diseases and digestive disorders. Expert in hepatology and endoscopic procedures.',
        degree: 'MBBS (DMC), MD Gastroenterology (TUTH)',
        nmcNumber: 'NMC-22015',
        institute: 'Kathmandu Medical College',
        city: 'Kathmandu'
      },
      // Hematology
      {
        name: 'Dr. Naresh Panta',
        email: 'naresh.panta@healthnepal.com',
        password: 'DoctorPass123!',
        specialty: 'Hematology',
        experience: 12,
        fees: 1800,
        bio: 'Blood disorder specialist and hemato-oncologist. Experience in anemia, leukemia, and lymphoma management.',
        degree: 'MBBS (IOM), MD Pathology, DM Hematology',
        nmcNumber: 'NMC-22016',
        institute: 'Tribhuvan University Teaching Hospital',
        city: 'Kathmandu'
      },
      // Infectious Disease
      {
        name: 'Dr. Sanjay Gupta',
        email: 'sanjay.gupta@healthnepal.com',
        password: 'DoctorPass123!',
        specialty: 'Infectious Disease',
        experience: 14,
        fees: 1900,
        bio: 'Infectious disease specialist with expertise in dengue, typhoid, TB, and other communicable diseases. WHO trained.',
        degree: 'MBBS (DMC), MD Internal Medicine, DM Infectious Diseases',
        nmcNumber: 'NMC-22017',
        institute: 'Kathmandu Medical College',
        city: 'Kathmandu'
      },
      {
        name: 'Dr. Pramod Lamichhane',
        email: 'pramod.lamichhane@healthnepal.com',
        password: 'DoctorPass123!',
        specialty: 'Infectious Disease',
        experience: 10,
        fees: 1700,
        bio: 'Communicable disease expert. Specialized in tropical infections and public health. CDC trained professional.',
        degree: 'MBBS (IOM), MD Infectious Diseases (TUTH)',
        nmcNumber: 'NMC-22018',
        institute: 'Epidemiology & Disease Control Division',
        city: 'Kathmandu'
      },
      // General Medicine
      {
        name: 'Dr. Ramchandra Mishra',
        email: 'ramchandra.mishra@healthnepal.com',
        password: 'DoctorPass123!',
        specialty: 'General Medicine',
        experience: 20,
        fees: 1200,
        bio: 'Senior general physician with 20 years of experience. Expert in comprehensive healthcare and patient management.',
        degree: 'MBBS (IOM), MD Internal Medicine (TUTH)',
        nmcNumber: 'NMC-22019',
        institute: 'Tribhuvan University Teaching Hospital',
        city: 'Kathmandu'
      },
      {
        name: 'Dr. Harendra Singh',
        email: 'harendra.singh@healthnepal.com',
        password: 'DoctorPass123!',
        specialty: 'General Medicine',
        experience: 16,
        fees: 1100,
        bio: 'Experienced general practitioner providing holistic healthcare. Expertise in chronic disease management.',
        degree: 'MBBS (KUMMC), MD Internal Medicine (PAHS)',
        nmcNumber: 'NMC-22020',
        institute: 'Patan Academy of Health Sciences',
        city: 'Lalitpur'
      },
      {
        name: 'Dr. Kavita Pandey',
        email: 'kavita.pandey@healthnepal.com',
        password: 'DoctorPass123!',
        specialty: 'General Medicine',
        experience: 12,
        fees: 1000,
        bio: 'General physician with focus on preventive medicine and lifestyle management. Patient-friendly approach.',
        degree: 'MBBS (DMC), MD Internal Medicine (KUMMC)',
        nmcNumber: 'NMC-22021',
        institute: 'Kathmandu Medical College',
        city: 'Kathmandu'
      },
      {
        name: 'Dr. Manoj Basnet',
        email: 'manoj.basnet@healthnepal.com',
        password: 'DoctorPass123!',
        specialty: 'General Medicine',
        experience: 8,
        fees: 900,
        bio: 'Compassionate general practitioner dedicated to patient education and wellness. Modern medical practice.',
        degree: 'MBBS (MMIHS), MD Internal Medicine (BPKIHS)',
        nmcNumber: 'NMC-22022',
        institute: 'Bhaktapur Hospital',
        city: 'Bhaktapur'
      }
    ];

    for (const doctorData of doctors) {
      // Check if doctor already exists
      const existing = await prisma.user.findUnique({
        where: { email: doctorData.email }
      });

      if (existing) {
        console.log(`Doctor ${doctorData.name} already exists, skipping...`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(doctorData.password, 10);

      // Create doctor user
      const doctor = await prisma.user.create({
        data: {
          name: doctorData.name,
          email: doctorData.email,
          password: hashedPassword,
          role: 'DOCTOR',
          phoneNumber: [],
          doctorProfile: {
            create: {
              specialty: doctorData.specialty,
              experience: doctorData.experience,
              fees: doctorData.fees,
              bio: doctorData.bio,
              degree: doctorData.degree,
              nmcNumber: doctorData.nmcNumber,
              institute: doctorData.institute,
              city: doctorData.city,
              status: 'APPROVED',
              ratings: 4.5
            }
          }
        }
      });

      // Create availability - add all 7 days of the week
      const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
      for (const day of days) {
        await prisma.doctorAvailability.create({
          data: {
            doctorId: doctor.id,
            day: day,
            startTime: '09:00',
            endTime: '17:00',
            isActive: true
          }
        });
      }

      console.log(`✓ Created doctor: ${doctorData.name} (${doctorData.specialty}) - ${doctorData.city}`);
    }

    console.log('\n✅ Doctor seeding completed successfully!');
    const totalDoctors = await prisma.user.count({ where: { role: 'DOCTOR' } });
    console.log(`Total doctors in database: ${totalDoctors}`);
    
    // Show summary by specialty
    const doctors_by_specialty = await prisma.doctorProfile.groupBy({
      by: ['specialty'],
      _count: true
    });
    
    console.log('\nDoctors by specialty:');
    doctors_by_specialty.forEach(spec => {
      console.log(`  ${spec.specialty}: ${spec._count} doctors`);
    });

  } catch (error) {
    console.error('❌ Error seeding doctors:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDoctors();