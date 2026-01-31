import prisma from "../utils/prisma-clients.js";

export const createPatient = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phoneNumber = [],
      medicalHistory,
      dateOfBirth,
      gender,
      address,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email, and password are required" });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password,
        role: "PATIENT",
        phoneNumber,
        patientProfile: {
          create: {
            medicalHistory: medicalHistory ?? null,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
            gender: gender ?? null,
            address: address ?? null,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phoneNumber: true,
        patientProfile: true,
      },
    });

    res.status(201).json({ message: "Patient created", user });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ message: "Email already in use" });
    }
    res.status(500).json({ message: "Error creating patient", error: error.message });
  }
};

export const getPatients = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phoneNumber: true,
        patientProfile: true,
        doctorProfile: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const updatePatients = async (req, res) => {
  try {
    const { name, medicalHistory, specialty, fees, dateOfBirth, gender, address } = req.body;

    let userData = {};
    if (name) userData.name = name;

    // Update patient profile
    if (req.user.role === "PATIENT") {
      if (medicalHistory !== undefined || dateOfBirth !== undefined || gender !== undefined || address !== undefined) {
        const patientProfileData = {};
        if (medicalHistory !== undefined) patientProfileData.medicalHistory = medicalHistory;
        if (dateOfBirth !== undefined) patientProfileData.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
        if (gender !== undefined) patientProfileData.gender = gender;
        if (address !== undefined) patientProfileData.address = address;

        await prisma.patientProfile.update({
          where: { userId: req.user.id },
          data: patientProfileData
        });
      }
    }

    // Update doctor profile
    if (req.user.role === "DOCTOR") {
      if (specialty !== undefined || fees !== undefined) {
        const doctorProfileData = {};
        if (specialty !== undefined) doctorProfileData.specialty = specialty;
        if (fees !== undefined) doctorProfileData.fees = fees;

        await prisma.doctorProfile.update({
          where: { userId: req.user.id },
          data: doctorProfileData
        });
      }
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: userData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phoneNumber: true,
        patientProfile: true,
        doctorProfile: true
      }
    });

    res.json({ message: "Profile updated", user: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getPatientSymptoms = async (req, res) => {
  try {
    const { id } = req.params;

    const patientSymptoms = await prisma.patientSymptom.findMany({
      where: { patientId: Number(id) },
      include: {
        symptom: true
      }
    });

    const symptoms = patientSymptoms.map(ps => ps.symptom);
    res.json(symptoms);
  } catch (error) {
    res.status(500).json({ message: "Error fetching patient symptoms", error: error.message });
  }
};

export const addSymptomToPatient = async (req, res) => {
  try {
    const { id } = req.params;
    const { symptomId } = req.body;

    if (!symptomId) {
      return res.status(400).json({ message: "symptomId is required" });
    }

    // Verify symptom exists
    const symptom = await prisma.symptom.findUnique({
      where: { id: Number(symptomId) }
    });

    if (!symptom) {
      return res.status(404).json({ message: "Symptom not found" });
    }

    const patientSymptom = await prisma.patientSymptom.create({
      data: {
        patientId: Number(id),
        symptomId: Number(symptomId)
      },
      include: { symptom: true }
    });

    res.status(201).json({ message: "Symptom added to patient successfully", patientSymptom });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({ message: "Symptom already added to this patient" });
    }
    res.status(500).json({ message: "Error adding symptom to patient", error: error.message });
  }
};

export const removeSymptomFromPatient = async (req, res) => {
  try {
    const { id, symptomId } = req.params;

    await prisma.patientSymptom.deleteMany({
      where: {
        patientId: Number(id),
        symptomId: Number(symptomId)
      }
    });

    res.json({ message: "Symptom removed from patient successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error removing symptom from patient", error: error.message });
  }
};

export const addSymptomToCurrentPatient = async (req, res) => {
  try {
    const { symptomId } = req.body;

    if (!symptomId) {
      return res.status(400).json({ message: "symptomId is required" });
    }

    // Verify symptom exists
    const symptom = await prisma.symptom.findUnique({
      where: { id: Number(symptomId) }
    });

    if (!symptom) {
      return res.status(404).json({ message: "Symptom not found" });
    }

    const patientSymptom = await prisma.patientSymptom.create({
      data: {
        patientId: req.user.id,
        symptomId: Number(symptomId)
      },
      include: { symptom: true }
    });

    res.status(201).json({ message: "Symptom added successfully", patientSymptom });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({ message: "Symptom already added" });
    }
    res.status(500).json({ message: "Error adding symptom", error: error.message });
  }
};
