import prisma from "../utils/prisma-clients.js";
import { sendEmail } from "../config/email.config.js";

/**
 * Send reminder emails to patients for upcoming appointments
 */
export const sendAppointmentReminders = async () => {
  try {
    console.log('🔔 Checking for reminders to send...');

    // Find all reminders that are due and not yet sent
    const dueReminders = await prisma.reminder.findMany({
      where: {
        isSent: false,
        remindAt: {
          lte: new Date() // remindAt is in the past or now
        }
      },
      include: {
        appointment: {
          include: {
            doctor: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            patient: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    });

    console.log(`Found ${dueReminders.length} reminders to send`);

    for (const reminder of dueReminders) {
      try {
        const { appointment, user } = reminder;
        const appointmentDateStr = appointment.date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #ff9800; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
              <h1 style="margin: 0;">📅 Appointment Reminder</h1>
            </div>
            
            <div style="padding: 20px; background-color: #f8f9fa; border: 1px solid #dee2e6;">
              <p style="font-size: 16px; color: #333;">Hello ${user.name},</p>
              
              <p style="font-size: 15px; color: #555;">This is a reminder about your upcoming appointment:</p>
              
              <div style="background-color: white; padding: 15px; border-left: 4px solid #ff9800; margin: 20px 0;">
                <p style="margin: 10px 0;"><strong>Doctor:</strong> Dr. ${appointment.doctor.name}</p>
                <p style="margin: 10px 0;"><strong>Date:</strong> ${appointmentDateStr}</p>
                <p style="margin: 10px 0;"><strong>Time:</strong> ${appointment.startTime}</p>
                <p style="margin: 10px 0;"><strong>Mode:</strong> ${appointment.mode === 'ONLINE' ? 'Online Consultation' : 'In-Person Visit'}</p>
              </div>
              
              <p style="font-size: 14px; color: #666;">
                <strong>📍 Location:</strong> ${appointment.mode === 'ONLINE' ? 'Consultation link will be provided via email' : 'Hospital/Clinic address'}
              </p>
              
              <p style="font-size: 14px; color: #666; margin-top: 15px;">
                If you cannot attend or need to reschedule, please visit your dashboard to cancel or update your appointment.
              </p>
              
              <hr style="border: none; border-top: 1px solid #dee2e6; margin: 20px 0;">
              
              <p style="font-size: 12px; color: #999; text-align: center;">This is an automated reminder from MediConnect. Please do not reply to this email.</p>
            </div>
          </div>
        `;

        await sendEmail({
          to: user.email,
          subject: `Reminder: Your appointment with Dr. ${appointment.doctor.name} tomorrow`,
          html: emailHtml
        });

        // Mark reminder as sent
        await prisma.reminder.update({
          where: { id: reminder.id },
          data: { isSent: true }
        });

        console.log(`✅ Reminder email sent to ${user.email} for appointment with Dr. ${appointment.doctor.name}`);
      } catch (error) {
        console.error(`❌ Failed to send reminder for appointment ${reminder.appointmentId}:`, error);
      }
    }

    if (dueReminders.length === 0) {
      console.log('✅ No reminders to send at this time');
    }
  } catch (error) {
    console.error('❌ Error in sendAppointmentReminders:', error);
  }
};

/**
 * Send email reminder to patient when appointment is approved by doctor
 */
export const sendAppointmentApprovedEmail = async (appointmentId) => {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        doctor: {
          select: {
            name: true,
            email: true
          }
        },
        patient: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!appointment) {
      console.error('Appointment not found:', appointmentId);
      return;
    }

    const appointmentDateStr = appointment.date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #28a745; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
          <h1 style="margin: 0;">✅ Appointment Approved</h1>
        </div>
        
        <div style="padding: 20px; background-color: #f8f9fa; border: 1px solid #dee2e6;">
          <p style="font-size: 16px; color: #333;">Hello ${appointment.patient.name},</p>
          
          <p style="font-size: 15px; color: #555;">Great news! Your appointment has been approved by the doctor.</p>
          
          <div style="background-color: white; padding: 15px; border-left: 4px solid #28a745; margin: 20px 0;">
            <p style="margin: 10px 0;"><strong>Doctor:</strong> Dr. ${appointment.doctor.name}</p>
            <p style="margin: 10px 0;"><strong>Date:</strong> ${appointmentDateStr}</p>
            <p style="margin: 10px 0;"><strong>Time:</strong> ${appointment.startTime}</p>
            <p style="margin: 10px 0;"><strong>Mode:</strong> ${appointment.mode === 'ONLINE' ? 'Online Consultation' : 'In-Person Visit'}</p>
            <p style="margin: 10px 0;"><strong>Status:</strong> <span style="color: #28a745; font-weight: bold;">✅ Confirmed</span></p>
          </div>
          
          <p style="font-size: 14px; color: #666;">You will receive a reminder notification 1 day before your appointment.</p>
          
          <hr style="border: none; border-top: 1px solid #dee2e6; margin: 20px 0;">
          
          <p style="font-size: 12px; color: #999; text-align: center;">This is an automated message from MediConnect. Please do not reply to this email.</p>
        </div>
      </div>
    `;

    await sendEmail({
      to: appointment.patient.email,
      subject: `Appointment Approved - Dr. ${appointment.doctor.name}`,
      html: emailHtml
    });

    console.log('✅ Appointment approved email sent to:', appointment.patient.email);
  } catch (error) {
    console.error('❌ Error sending appointment approved email:', error);
  }
};

/**
 * Send cancellation email to patient
 */
export const sendAppointmentCancelledEmail = async (appointmentId) => {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        doctor: {
          select: {
            name: true,
            email: true
          }
        },
        patient: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!appointment) {
      console.error('Appointment not found:', appointmentId);
      return;
    }

    const appointmentDateStr = appointment.date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #dc3545; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
          <h1 style="margin: 0;">❌ Appointment Cancelled</h1>
        </div>
        
        <div style="padding: 20px; background-color: #f8f9fa; border: 1px solid #dee2e6;">
          <p style="font-size: 16px; color: #333;">Hello ${appointment.patient.name},</p>
          
          <p style="font-size: 15px; color: #555;">Your appointment has been cancelled.</p>
          
          <div style="background-color: white; padding: 15px; border-left: 4px solid #dc3545; margin: 20px 0;">
            <p style="margin: 10px 0;"><strong>Doctor:</strong> Dr. ${appointment.doctor.name}</p>
            <p style="margin: 10px 0;"><strong>Date:</strong> ${appointmentDateStr}</p>
            <p style="margin: 10px 0;"><strong>Time:</strong> ${appointment.startTime}</p>
          </div>
          
          <p style="font-size: 14px; color: #666;">If you would like to reschedule, please visit your dashboard and book a new appointment.</p>
          
          <hr style="border: none; border-top: 1px solid #dee2e6; margin: 20px 0;">
          
          <p style="font-size: 12px; color: #999; text-align: center;">This is an automated message from MediConnect. Please do not reply to this email.</p>
        </div>
      </div>
    `;

    await sendEmail({
      to: appointment.patient.email,
      subject: `Appointment Cancelled - Dr. ${appointment.doctor.name}`,
      html: emailHtml
    });

    console.log('✅ Appointment cancelled email sent to:', appointment.patient.email);
  } catch (error) {
    console.error('❌ Error sending appointment cancelled email:', error);
  }
};
