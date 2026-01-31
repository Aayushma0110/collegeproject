import prisma from "../utils/prisma-clients.js";
import { sendEmail } from "../config/email.config.js";
import { sendAppointmentApprovedEmail, sendAppointmentCancelledEmail } from "../services/reminder.service.js";

// CREATE Appointment
export const createAppointment = async (req, res) => {
  try {
    const { doctorId, scheduledAt, date, startTime, endTime, mode, reason, notes } = req.body;

    // Support both old format (date, startTime, endTime) and new format (scheduledAt)
    let appointmentDate, startTimeStr, endTimeStr;

    if (scheduledAt) {
      // New format: scheduledAt is ISO datetime string
      const scheduledDateTime = new Date(scheduledAt);
      if (isNaN(scheduledDateTime)) {
        return res.status(400).json({ message: "Invalid scheduledAt format" });
      }
      appointmentDate = scheduledDateTime;
      startTimeStr = scheduledDateTime.toISOString().slice(11, 16); // HH:MM format
      endTimeStr = new Date(scheduledDateTime.getTime() + 30 * 60000).toISOString().slice(11, 16); // 30 min default
    } else if (date && startTime && endTime) {
      // Old format: separate date, startTime, endTime
      appointmentDate = new Date(date);
      startTimeStr = startTime;
      endTimeStr = endTime;
    } else {
      return res.status(400).json({ message: "Please provide either scheduledAt or (date, startTime, endTime)" });
    }

    if (!doctorId) {
      return res.status(400).json({ message: "doctorId is required" });
    }

    const doctorIdInt = Number(doctorId);
    if (isNaN(doctorIdInt)) {
      return res.status(400).json({ message: "doctorId must be a number" });
    }

    if (isNaN(appointmentDate)) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    // Ensure doctor user exists and is a DOCTOR
    const doctorUser = await prisma.user.findUnique({ where: { id: doctorIdInt } });
    if (!doctorUser || doctorUser.role !== "DOCTOR") {
      return res.status(404).json({ message: "Doctor user not found" });
    }

    // Ensure doctor profile exists and is APPROVED
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: doctorIdInt },
      select: { status: true }
    });
    if (!doctorProfile || doctorProfile.status !== "APPROVED") {
      return res.status(403).json({ message: "Doctor is not approved or does not exist" });
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId: req.user.id,
        doctorId: doctorIdInt,
        date: appointmentDate,
        startTime: startTimeStr,
        endTime: endTimeStr,
        mode: mode || "IN_PERSON",
        status: "PENDING"
      },
      include: {
        doctor: { select: { id: true, name: true, email: true } },
        patient: { select: { id: true, name: true, email: true } }
      }
    });

    // Create a reminder for the patient (1 day before appointment)
    const reminderDateTime = new Date(appointmentDate);
    reminderDateTime.setDate(reminderDateTime.getDate() - 1); // 1 day before
    reminderDateTime.setHours(10, 0, 0, 0); // 10:00 AM

    try {
      const reminder = await prisma.reminder.create({
        data: {
          userId: req.user.id,
          appointmentId: appointment.id,
          remindAt: reminderDateTime,
          type: "EMAIL"
        }
      });
      console.log('✅ Reminder created:', reminder);
    } catch (reminderError) {
      console.error('⚠️  Failed to create reminder:', reminderError);
    }

    // Send confirmation email to patient
    const appointmentDateStr = appointmentDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #007bff; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
          <h1 style="margin: 0;">Appointment Confirmed</h1>
        </div>
        
        <div style="padding: 20px; background-color: #f8f9fa; border: 1px solid #dee2e6;">
          <p style="font-size: 16px; color: #333;">Hello ${appointment.patient.name},</p>
          
          <p style="font-size: 15px; color: #555;">Your appointment has been successfully booked. Here are the details:</p>
          
          <div style="background-color: white; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;">
            <p style="margin: 10px 0;"><strong>Doctor:</strong> Dr. ${appointment.doctor.name}</p>
            <p style="margin: 10px 0;"><strong>Date:</strong> ${appointmentDateStr}</p>
            <p style="margin: 10px 0;"><strong>Time:</strong> ${startTimeStr} - ${endTimeStr}</p>
            <p style="margin: 10px 0;"><strong>Mode:</strong> ${mode === 'ONLINE' ? 'Online Consultation' : 'In-Person Visit'}</p>
            <p style="margin: 10px 0;"><strong>Status:</strong> <span style="color: #ff9800; font-weight: bold;">Pending Confirmation</span></p>
          </div>
          
          <p style="font-size: 14px; color: #666;">You will receive a reminder 1 day before your appointment.</p>
          
          <p style="font-size: 14px; color: #666;">If you need to reschedule or cancel, please visit your dashboard.</p>
          
          <hr style="border: none; border-top: 1px solid #dee2e6; margin: 20px 0;">
          
          <p style="font-size: 12px; color: #999; text-align: center;">This is an automated message from MediConnect. Please do not reply to this email.</p>
        </div>
      </div>
    `;

    try {
      await sendEmail({
        to: appointment.patient.email,
        subject: `Appointment Confirmation - Dr. ${appointment.doctor.name}`,
        html: emailHtml
      });
      console.log('✅ Confirmation email sent to:', appointment.patient.email);
    } catch (emailError) {
      console.error('⚠️  Failed to send confirmation email:', emailError);
    }

    res.status(201).json({ message: "Appointment created successfully", appointment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// GET All Appointments (for a patient or admin)
export const getAppointments = async (req, res) => {
  try {
    const user = req.user;

    let appointments;
    if (user.role === "ADMIN") {
      // Admin can see all appointments
      appointments = await prisma.appointment.findMany({
        include: {
          doctor: { select: { id: true, name: true } },
          patient: { select: { id: true, name: true, email: true } },
          slot: true,
          payment: true
        },
        orderBy: { date: "asc" },
      });
    } else if (user.role === "DOCTOR") {
      // Doctor can see only their own appointments
      appointments = await prisma.appointment.findMany({
        where: { doctorId: user.id },
        include: {
          doctor: { select: { id: true, name: true } },
          patient: { select: { id: true, name: true, email: true } },
          slot: true,
          payment: true
        },
        orderBy: { date: "asc" },
      });
    } else {
      // Patient can see only their own appointments
      appointments = await prisma.appointment.findMany({
        where: { patientId: user.id },
        include: {
          doctor: { select: { id: true, name: true } },
          slot: true,
          payment: true
        },
        orderBy: { date: "asc" },
      });
    }

    res.status(200).json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// GET Single Appointment
export const getAppointmentById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const user = req.user;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            doctorProfile: { select: { specialty: true } }
          }
        },
        patient: { select: { id: true, name: true, email: true } },
      },
    });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Only patient or admin can view
    if (user.role !== "ADMIN" && appointment.patientId !== user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// UPDATE Appointment (e.g., reschedule)
export const updateAppointment = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { date, startTime, endTime, status } = req.body;
    const user = req.user;

    const appointment = await prisma.appointment.findUnique({ where: { id } });
    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });

    // Only patient, doctor of this appointment, or admin can update
    if (user.role !== "ADMIN" && appointment.patientId !== user.id && appointment.doctorId !== user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const updateData = {};
    
    if (date) {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate)) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      updateData.date = parsedDate;
    }
    
    if (startTime) updateData.startTime = startTime;
    if (endTime) updateData.endTime = endTime;
    if (status) updateData.status = status;

    // Check doctor availability if rescheduling
    if (date && startTime) {
      const conflict = await prisma.appointment.findFirst({
        where: { 
          doctorId: appointment.doctorId, 
          date: updateData.date,
          startTime: startTime,
          id: { not: id }
        },
      });
      if (conflict) {
        return res
          .status(400)
          .json({ message: "Doctor already booked at this time" });
      }
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: updateData,
    });

    res
      .status(200)
      .json({
        message: "Appointment updated successfully",
        appointment: updated,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// GET Appointments by Patient ID (Admin or the same patient)
export const getAppointmentsByPatientId = async (req, res) => {
  try {
    const patientId = parseInt(req.params.id);
    if (isNaN(patientId)) {
      return res.status(400).json({ message: "Invalid patient id" });
    }

    const user = req.user;
    if (user.role !== "ADMIN" && user.id !== patientId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const appointments = await prisma.appointment.findMany({
      where: { patientId },
      include: {
        doctor: { select: { id: true, name: true } },
        patient: { select: { id: true, name: true, email: true } },
      },
      orderBy: { date: "asc" },
    });

    res.status(200).json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// GET Appointments by Doctor ID (Admin or the same doctor)
export const getAppointmentsByDoctorId = async (req, res) => {
  try {
    const doctorId = parseInt(req.params.id);
    if (isNaN(doctorId)) {
      return res.status(400).json({ message: "Invalid doctor id" });
    }

    const user = req.user;
    if (user.role !== "ADMIN" && user.id !== doctorId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const appointments = await prisma.appointment.findMany({
      where: { doctorId },
      include: {
        doctor: { select: { id: true, name: true } },
        patient: { select: { id: true, name: true, email: true } },
      },
      orderBy: { date: "asc" },
    });

    res.status(200).json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// DELETE Appointment
export const deleteAppointment = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const user = req.user;

    const appointment = await prisma.appointment.findUnique({ where: { id } });
    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });

    // Only patient who booked or admin can delete
    if (user.role !== "ADMIN" && appointment.patientId !== user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    await prisma.appointment.delete({ where: { id } });

    // Send cancellation email
    try {
      await sendAppointmentCancelledEmail(id);
    } catch (error) {
      console.error('Failed to send cancellation email:', error);
    }

    res.status(200).json({ message: "Appointment deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// APPROVE/CONFIRM Appointment (by doctor)
export const approveAppointment = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const user = req.user;

    const appointment = await prisma.appointment.findUnique({ where: { id } });
    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });

    // Only doctor or admin can approve
    if (user.role !== "ADMIN" && appointment.doctorId !== user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status: "CONFIRMED" },
      include: {
        doctor: { select: { id: true, name: true } },
        patient: { select: { id: true, name: true } }
      }
    });

    // Send approval email
    try {
      await sendAppointmentApprovedEmail(id);
    } catch (error) {
      console.error('Failed to send approval email:', error);
    }

    res.status(200).json({ message: "Appointment confirmed", appointment: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
