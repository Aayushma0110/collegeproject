import prisma from './src/utils/prisma-clients.js';

async function seedAppointments() {
  try {
    console.log('Seeding test appointments...');

    // Get all doctors and patients
    const doctors = await prisma.user.findMany({
      where: { role: 'DOCTOR' },
      take: 5
    });

    const patients = await prisma.user.findMany({
      where: { role: 'PATIENT' },
      take: 5
    });

    if (doctors.length === 0 || patients.length === 0) {
      console.warn('⚠️ Not enough doctors or patients to create appointments. Please seed doctors and patients first.');
      return;
    }

    // Create test appointments
    const appointments = [];
    const now = new Date();

    for (let i = 0; i < 10; i++) {
      const doctorIndex = i % doctors.length;
      const patientIndex = Math.floor(i / doctors.length) % patients.length;
      
      // Create appointments for the next 7 days with different times
      const appointmentDate = new Date(now);
      appointmentDate.setDate(appointmentDate.getDate() + (i % 7) + 1);
      
      const hour = 9 + (i % 6); // 9 AM to 2 PM
      const startTime = `${String(hour).padStart(2, '0')}:00`;
      const endTime = `${String(hour + 1).padStart(2, '0')}:00`;

      appointments.push({
        doctorId: doctors[doctorIndex].id,
        patientId: patients[patientIndex].id,
        date: appointmentDate,
        startTime: startTime,
        endTime: endTime,
        mode: i % 2 === 0 ? 'IN_PERSON' : 'ONLINE',
        status: i % 3 === 0 ? 'PENDING' : i % 3 === 1 ? 'CONFIRMED' : 'COMPLETED'
      });
    }

    // Create appointments in database
    for (const apt of appointments) {
      try {
        const created = await prisma.appointment.create({
          data: apt,
          include: {
            doctor: { select: { id: true, name: true } },
            patient: { select: { id: true, name: true } }
          }
        });
        console.log(`✅ Created appointment: ${created.patient.name} → ${created.doctor.name} on ${created.date.toLocaleDateString()}`);
      } catch (error) {
        console.error(`❌ Error creating appointment:`, error.message);
      }
    }

    console.log(`\n✅ Seeding complete! Created ${appointments.length} test appointments.`);
  } catch (error) {
    console.error('Error seeding appointments:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedAppointments();
