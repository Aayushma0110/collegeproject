// Notification Service for sending appointment reminders
import { sendEmail } from '../config/email.config.js';

/**
 * Send appointment confirmation notification
 */
export const sendAppointmentConfirmation = async (appointment, patient, doctor) => {
  try {
    const appointmentTime = new Date(appointment.slot?.startTime || appointment.scheduledAt);
    
    const subject = '✅ Appointment Confirmed - MediConnect';
    const message = `
Dear ${patient.name},

Your appointment has been confirmed!

📅 Date: ${appointmentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
🕐 Time: ${appointmentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
👨‍⚕️ Doctor: Dr. ${doctor.name}
📍 Mode: ${appointment.mode || 'IN_PERSON'}
💰 Fee: ₹${doctor.doctorProfile?.fees || 500}

Appointment ID: #${appointment.id}

Please arrive 10 minutes before your scheduled time.

If you need to reschedule or cancel, please contact us at least 24 hours in advance.

Best regards,
MediConnect Team
    `;

    // HTML version for better formatting
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #27ae60;">✅ Appointment Confirmed</h2>
        <p>Dear <strong>${patient.name}</strong>,</p>
        <p>Your appointment has been confirmed!</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 10px 0;"><strong>📅 Date:</strong> ${appointmentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p style="margin: 10px 0;"><strong>🕐 Time:</strong> ${appointmentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
          <p style="margin: 10px 0;"><strong>👨‍⚕️ Doctor:</strong> Dr. ${doctor.name}</p>
          <p style="margin: 10px 0;"><strong>📍 Mode:</strong> ${appointment.mode || 'IN_PERSON'}</p>
          <p style="margin: 10px 0;"><strong>💰 Fee:</strong> ₹${doctor.doctorProfile?.fees || 500}</p>
          <p style="margin: 10px 0;"><strong>Appointment ID:</strong> #${appointment.id}</p>
        </div>
        
        <p>Please arrive 10 minutes before your scheduled time.</p>
        <p>If you need to reschedule or cancel, please contact us at least 24 hours in advance.</p>
        
        <p style="color: #666; margin-top: 30px;">Best regards,<br><strong>MediConnect Team</strong></p>
      </div>
    `;

    // Send email
    const result = await sendEmail({
      to: patient.email,
      subject,
      text: message,
      html
    });

    console.log('📧 Confirmation email:', result.success ? 'Sent ✅' : 'Failed ❌');
    
    return result;
  } catch (error) {
    console.error('Error sending appointment confirmation:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send appointment reminder (24 hours before)
 */
export const sendAppointmentReminder = async (appointment, patient, doctor) => {
  try {
    const appointmentTime = new Date(appointment.slot?.startTime || appointment.scheduledAt);
    
    const subject = '⏰ Appointment Reminder - Tomorrow - MediConnect';
    const message = `
Dear ${patient.name},

This is a friendly reminder about your upcoming appointment tomorrow!

📅 Date: ${appointmentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
🕐 Time: ${appointmentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
👨‍⚕️ Doctor: Dr. ${doctor.name}
📍 Mode: ${appointment.mode || 'IN_PERSON'}

Appointment ID: #${appointment.id}

Please remember to:
- Arrive 10 minutes early
- Bring any relevant medical records
- Bring your ID and insurance card

If you need to reschedule, please contact us immediately.

Best regards,
MediConnect Team
    `;

    // HTML version
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f39c12;">⏰ Appointment Reminder</h2>
        <p>Dear <strong>${patient.name}</strong>,</p>
        <p>This is a friendly reminder about your upcoming appointment <strong>tomorrow</strong>!</p>
        
        <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f39c12;">
          <p style="margin: 10px 0;"><strong>📅 Date:</strong> ${appointmentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p style="margin: 10px 0;"><strong>🕐 Time:</strong> ${appointmentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
          <p style="margin: 10px 0;"><strong>👨‍⚕️ Doctor:</strong> Dr. ${doctor.name}</p>
          <p style="margin: 10px 0;"><strong>📍 Mode:</strong> ${appointment.mode || 'IN_PERSON'}</p>
          <p style="margin: 10px 0;"><strong>Appointment ID:</strong> #${appointment.id}</p>
        </div>
        
        <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #27ae60; margin-top: 0;">Please remember to:</h3>
          <ul style="color: #333;">
            <li>Arrive 10 minutes early</li>
            <li>Bring any relevant medical records</li>
            <li>Bring your ID and insurance card</li>
          </ul>
        </div>
        
        <p>If you need to reschedule, please contact us immediately.</p>
        
        <p style="color: #666; margin-top: 30px;">Best regards,<br><strong>MediConnect Team</strong></p>
      </div>
    `;

    // Send email
    const result = await sendEmail({
      to: patient.email,
      subject,
      text: message,
      html
    });

    console.log('📧 Reminder email:', result.success ? 'Sent ✅' : 'Failed ❌');
    
    return result;
  } catch (error) {
    console.error('Error sending appointment reminder:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send appointment cancellation notification
 */
export const sendAppointmentCancellation = async (appointment, patient, doctor) => {
  try {
    const appointmentTime = new Date(appointment.slot?.startTime || appointment.scheduledAt);
    
    const subject = '❌ Appointment Cancelled - MediConnect';
    const message = `
Dear ${patient.name},

Your appointment has been cancelled.

📅 Date: ${appointmentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
🕐 Time: ${appointmentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
👨‍⚕️ Doctor: Dr. ${doctor.name}

Appointment ID: #${appointment.id}

If you did not request this cancellation or need to rebook, please contact us immediately.

Best regards,
MediConnect Team
    `;

    // HTML version
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e74c3c;">❌ Appointment Cancelled</h2>
        <p>Dear <strong>${patient.name}</strong>,</p>
        <p>Your appointment has been cancelled.</p>
        
        <div style="background: #fee; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #e74c3c;">
          <p style="margin: 10px 0;"><strong>📅 Date:</strong> ${appointmentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p style="margin: 10px 0;"><strong>🕐 Time:</strong> ${appointmentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
          <p style="margin: 10px 0;"><strong>👨‍⚕️ Doctor:</strong> Dr. ${doctor.name}</p>
          <p style="margin: 10px 0;"><strong>Appointment ID:</strong> #${appointment.id}</p>
        </div>
        
        <p>If you did not request this cancellation or need to rebook, please contact us immediately.</p>
        
        <p style="color: #666; margin-top: 30px;">Best regards,<br><strong>MediConnect Team</strong></p>
      </div>
    `;

    // Send email
    const result = await sendEmail({
      to: patient.email,
      subject,
      text: message,
      html
    });

    console.log('📧 Cancellation email:', result.success ? 'Sent ✅' : 'Failed ❌');
    
    return result;
  } catch (error) {
    console.error('Error sending appointment cancellation:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Check and send reminders for upcoming appointments
 * This should be called by a cron job every hour
 */
export const sendUpcomingReminders = async (prisma) => {
  try {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setHours(tomorrow.getHours() + 24);
    tomorrow.setMinutes(0, 0, 0);
    
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setHours(dayAfterTomorrow.getHours() + 24);
    
    // Find appointments scheduled for tomorrow
    const upcomingAppointments = await prisma.appointment.findMany({
      where: {
        status: 'CONFIRMED',
        slot: {
          startTime: {
            gte: tomorrow,
            lt: dayAfterTomorrow
          }
        }
      },
      include: {
        patient: true,
        doctor: {
          include: {
            doctorProfile: true
          }
        },
        slot: true
      }
    });

    console.log(`📬 Sending reminders for ${upcomingAppointments.length} appointments`);

    const results = [];
    for (const appointment of upcomingAppointments) {
      const result = await sendAppointmentReminder(
        appointment,
        appointment.patient,
        appointment.doctor
      );
      results.push(result);
    }

    return { success: true, sent: results.length, results };
  } catch (error) {
    console.error('Error sending upcoming reminders:', error);
    return { success: false, error: error.message };
  }
};
