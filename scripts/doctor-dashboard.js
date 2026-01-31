// Check if user is a doctor, otherwise redirect
function checkDoctorRole() {
  const userData = JSON.parse(localStorage.getItem("userData") || '{}')
  const role = (userData.role || "DOCTOR").toUpperCase()
  
  if (role !== "DOCTOR") {
    alert("Access denied. Doctor dashboard is only for doctors.")
    window.location.href = "login.html"
  }
}

// Check role on page load
checkDoctorRole()

// Navigation
document.querySelectorAll(".nav-item[data-section]").forEach((item) => {
  item.addEventListener("click", function (e) {
    e.preventDefault()
    const section = this.dataset.section
    showSection(section)
  })
})

const API_URL = "http://localhost:5050/api"

function showSection(section) {
  document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("active"))
  document.querySelector(`[data-section="${section}"]`).classList.add("active")

  document.querySelectorAll(".content-section").forEach((sec) => sec.classList.remove("active"))
  document.getElementById(`${section}-section`).classList.add("active")

  const titles = {
    dashboard: { title: "Dashboard", subtitle: "Manage your practice, Dr. Smith" },
    appointments: { title: "Appointments", subtitle: "View and manage appointments" },
    availability: { title: "Availability", subtitle: "Set your working hours" },
    patients: { title: "Patients", subtitle: "View patient records" },
    profile: { title: "Profile", subtitle: "Update your information" },
  }

  const header = titles[section]
  document.getElementById("sectionTitle").textContent = header.title
  document.getElementById("sectionSubtitle").innerHTML = header.subtitle
}

// Load doctor appointments from backend
async function loadDoctorAppointments() {
  const table = document.querySelector("#appointmentsTable tbody");
  if (!table) {
    console.error("Appointments table not found");
    return;
  }
  
  table.innerHTML = "<tr><td colspan='4'>Loading appointments...</td></tr>";
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${API_URL}/appointments`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    
    if (!res.ok) {
      throw new Error('Failed to load appointments');
    }
    
    const appointments = await res.json();
    console.log('Doctor appointments (full data):', appointments);
    
    const items = Array.isArray(appointments) && appointments.length ? appointments : [];

    if (items.length === 0) {
      table.innerHTML = "<tr><td colspan='4' style='text-align: center; padding: 20px;'>No appointments found</td></tr>";
      return;
    }

    table.innerHTML = items
      .map(
        (apt) => {
          const patientName = apt.patient?.name || apt.patientName || `Patient #${apt.patientId}`;
          
          // Get date/time from appointment date and startTime
          let dateTimeStr = 'N/A';
          if (apt.date && apt.startTime) {
            const appointmentDate = new Date(apt.date);
            const datePart = appointmentDate.toLocaleDateString();
            dateTimeStr = `${datePart} ${apt.startTime}`;
          } else if (apt.slot && apt.slot.startTime) {
            dateTimeStr = new Date(apt.slot.startTime).toLocaleString();
          }
          
          console.log(`Appointment ${apt.id}:`, {
            patient: apt.patient,
            patientId: apt.patientId,
            doctorId: apt.doctorId,
            status: apt.status,
            slot: apt.slot,
            dateTime: dateTimeStr
          });
          
          return `
        <tr>
          <td>${patientName}</td>
          <td>${dateTimeStr}</td>
          <td><span class="badge badge-${(apt.status || '').toLowerCase()}">${apt.status || 'N/A'}</span></td>
          <td style="white-space: nowrap;">
            ${apt.status === 'CONFIRMED' ? `
              <button class="btn btn-primary action-complete" data-id="${apt.id}" data-name="${patientName.replace(/"/g, '&quot;')}" style="padding: 0.375rem 0.75rem; font-size: 0.8rem;">Complete</button>
            ` : apt.status === 'PENDING' ? `
              <button class="btn btn-success action-confirm" data-id="${apt.id}" style="padding: 0.375rem 0.75rem; font-size: 0.8rem; margin-right: 0.25rem;">Confirm</button>
              <button class="btn btn-outline action-reject" data-id="${apt.id}" style="padding: 0.375rem 0.75rem; font-size: 0.8rem;">Reject</button>
            ` : apt.status === 'COMPLETED' ? `
              <button class="btn btn-outline action-view" data-id="${apt.id}" style="padding: 0.375rem 0.75rem; font-size: 0.8rem;">View</button>
            ` : apt.status === 'CANCELLED' || apt.status === 'REJECTED' ? `
              <span style="color: #999; font-size: 0.85rem;">${apt.status}</span>
            ` : `
              <button class="btn btn-success action-confirm" data-id="${apt.id}" style="padding: 0.375rem 0.75rem; font-size: 0.8rem;">Confirm</button>
            `}
          </td>
        </tr>`;
        }
      )
      .join("");

    // populate pending list only (removed today's appointments section)
    const pending = items.filter((a) => (a.status || '').toLowerCase() === 'pending')
    const pendingList = document.getElementById("pendingRequests")
    if (pendingList) {
      pendingList.innerHTML = pending
        .map(
          (apt) => `
      <div class="request-item">
        <div class="request-header">
          <div>
            <h4>${apt.patient?.name || apt.patientName || ''}</h4>
            <p style="color: var(--text-secondary); font-size: 0.875rem; margin-top: 0.25rem;">
              ${apt.date && apt.startTime ? `${new Date(apt.date).toLocaleDateString()} ${apt.startTime}` : 'N/A'} • ${apt.mode || apt.type || 'IN_PERSON'}
            </p>
          </div>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-success" style="padding: 0.5rem 1rem;" onclick="acceptAppointment(${apt.id})">Accept</button>
            <button class="btn btn-outline" style="padding: 0.5rem 1rem;" onclick="declineAppointment(${apt.id})">Decline</button>
          </div>
        </div>
      </div>
    `,
        )
        .join("")
    }
    
    // Add event delegation for action buttons
    setupAppointmentActionHandlers();
    
    // Refresh recent appointments section
    loadRecentAppointments();
    
  } catch (err) {
    console.error(err);
    if (table) {
      table.innerHTML = "<tr><td colspan='4' style='text-align: center; padding: 20px;'>Error loading appointments. Please try again.</td></tr>";
    }
  }
}

// Load patients from doctor's appointments
async function loadPatients() {
  const tbody = document.querySelector("#patientsTable tbody");
  tbody.innerHTML = "<tr><td colspan='6'>Loading patients...</td></tr>";
  const token = localStorage.getItem("token");

  try {
    // Get all appointments for the doctor
    const res = await fetch(`${API_URL}/appointments`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    
    if (!res.ok) {
      throw new Error('Failed to load patients');
    }
    
    const appointments = await res.json();
    
    // Extract unique patients from appointments
    const patientsMap = new Map();
    appointments.forEach(apt => {
      if (apt.patient && apt.patientId) {
        if (!patientsMap.has(apt.patientId)) {
          patientsMap.set(apt.patientId, {
            id: apt.patientId,
            name: apt.patient.name || 'Unknown',
            email: apt.patient.email || 'N/A',
            gender: apt.patient.gender || 'N/A',
            age: apt.patient.age || 'N/A',
            lastVisit: apt.scheduledAt ? new Date(apt.scheduledAt).toLocaleDateString() : 'N/A',
            totalVisits: 1,
            status: apt.status
          });
        } else {
          const patient = patientsMap.get(apt.patientId);
          patient.totalVisits++;
          // Update last visit if more recent
          if (apt.scheduledAt && new Date(apt.scheduledAt) > new Date(patient.lastVisit)) {
            patient.lastVisit = new Date(apt.scheduledAt).toLocaleDateString();
          }
        }
      }
    });
    
    const items = Array.from(patientsMap.values());

    if (items.length === 0) {
      tbody.innerHTML = "<tr><td colspan='6' style='text-align: center; padding: 20px;'>No patients found</td></tr>";
      return;
    }

  tbody.innerHTML = items
    .map(
      (patient) => `
      <tr>
        <td>${patient.name}</td>
        <td>${patient.age}</td>
        <td>${patient.gender}</td>
        <td>${patient.lastVisit}</td>
        <td>${patient.totalVisits}</td>
        <td>
          <button class="btn btn-outline" style="padding: 0.375rem 0.75rem; font-size: 0.8rem;" onclick="viewPatientRecord(${patient.id})">View</button>
        </td>
      </tr>`
    )
    .join("");
  } catch (err) {
    console.error('Error loading patients:', err);
    tbody.innerHTML = "<tr><td colspan='6' style='text-align: center; padding: 20px; color: red;'>Failed to load patients</td></tr>";
  }
}

// Fallback data
function getDoctorAppointmentsFallback() {
  return [
    { id: 1, patient: "John Smith", age: 45, dateTime: "Jan 6, 2026 - 10:00 AM", type: "In-Person", status: "confirmed", payment: "Paid" },
    { id: 2, patient: "Emma Wilson", age: 32, dateTime: "Jan 6, 2026 - 2:30 PM", type: "Online", status: "pending", payment: "Pending" },
  ]
}

function getPatientsFallback() {
  return [
    { id: 1, name: "John Smith", age: 45, gender: "Male", lastVisit: "Dec 28, 2025", totalVisits: 8 },
    { id: 2, name: "Emma Wilson", age: 32, gender: "Female", lastVisit: "Dec 20, 2025", totalVisits: 5 },
  ]
}

function acceptAppointment(id) {
  console.log("[v0] Accepting appointment:", id)
  alert("Appointment accepted!")
  loadDoctorAppointments()
}

function declineAppointment(id) {
  if (confirm("Are you sure you want to decline this appointment?")) {
    console.log("[v0] Declining appointment:", id)
    alert("Appointment declined.")
    loadDoctorAppointments()
  }
}

let currentAppointmentId = null;
let currentPatientName = '';

function openPrescriptionModal(appointmentId, patientName) {
  currentAppointmentId = appointmentId;
  currentPatientName = patientName || 'Patient';
  
  document.getElementById("prescriptionAppointmentId").value = appointmentId;
  document.getElementById("prescriptionModal").style.display = "flex";
  
  // Update modal title with patient name
  const modalHeader = document.querySelector("#prescriptionModal .modal-header h3");
  if (modalHeader) {
    modalHeader.textContent = `Generate Prescription for ${currentPatientName}`;
  }
}

function closePrescriptionModal() {
  document.getElementById("prescriptionModal").style.display = "none";
  document.getElementById("prescriptionForm").reset();
  currentAppointmentId = null;
  currentPatientName = '';
}

function viewPatientRecord(patientId) {
  alert("Opening patient medical record...")
}

function viewAppointmentDetails(id) {
  alert("Opening appointment details...")
}

function filterDoctorAppointments(status) {
  document.querySelectorAll(".tab").forEach((tab) => tab.classList.remove("active"))
  event.target.classList.add("active")
  loadDoctorAppointments()
}

function addLeaveDate() {
  const dateInput = document.getElementById("leaveDate")
  const date = dateInput.value
  if (!date) return

  const leaveDatesDiv = document.getElementById("leaveDates")
  const tag = document.createElement("div")
  tag.className = "leave-date-tag"
  tag.innerHTML = `
    <span>${date}</span>
    <button type="button" onclick="this.parentElement.remove()">×</button>
  `
  leaveDatesDiv.appendChild(tag)
  dateInput.value = ""
}

function doctorLogout() {
  localStorage.removeItem("userData")
  localStorage.removeItem("token")
  window.location.href = "login.html"
}

// Setup event delegation for appointment action buttons
function setupAppointmentActionHandlers() {
  const table = document.getElementById('doctorAppointmentsTable');
  if (!table) return;
  
  // Remove old listeners if any
  const oldHandler = table.onclick;
  table.onclick = null;
  
  // Add new click handler
  table.addEventListener('click', function(e) {
    const target = e.target;
    
    // Confirm button
    if (target.classList.contains('action-confirm')) {
      const appointmentId = parseInt(target.dataset.id);
      console.log('Confirm button clicked for appointment:', appointmentId);
      confirmAppointment(appointmentId);
    }
    
    // Reject button
    else if (target.classList.contains('action-reject')) {
      const appointmentId = parseInt(target.dataset.id);
      console.log('Reject button clicked for appointment:', appointmentId);
      rejectAppointment(appointmentId);
    }
    
    // Complete button
    else if (target.classList.contains('action-complete')) {
      const appointmentId = parseInt(target.dataset.id);
      const patientName = target.dataset.name;
      console.log('Complete button clicked for appointment:', appointmentId);
      openPrescriptionModal(appointmentId, patientName);
    }
    
    // View button
    else if (target.classList.contains('action-view')) {
      const appointmentId = parseInt(target.dataset.id);
      console.log('View button clicked for appointment:', appointmentId);
      viewAppointmentDetails(appointmentId);
    }
  });
}

// Confirm appointment function
async function confirmAppointment(appointmentId) {
  if (!confirm('Confirm this appointment?')) return;
  
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      alert('❌ Error: Not logged in. Please login again.');
      window.location.href = 'login.html';
      return;
    }
    
    console.log('Confirming appointment:', appointmentId);
    console.log('Token exists:', !!token);
    
    const response = await fetch(`${API_URL}/appointments/${appointmentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: 'CONFIRMED' })
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response:', errorData);
      throw new Error(errorData.message || 'Failed to confirm appointment');
    }
    
    const result = await response.json();
    console.log('Success:', result);
    
    alert('✅ Appointment confirmed successfully!');
    loadDoctorAppointments();
    loadRecentAppointments();
    
  } catch (error) {
    console.error('Error confirming appointment:', error);
    alert('❌ Error: ' + error.message);
  }
}

// Reject appointment function
async function rejectAppointment(appointmentId) {
  if (!confirm('Reject this appointment?')) return;
  
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      alert('❌ Error: Not logged in. Please login again.');
      window.location.href = 'login.html';
      return;
    }
    
    console.log('Rejecting appointment:', appointmentId);
    
    const response = await fetch(`${API_URL}/appointments/${appointmentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: 'REJECTED' })
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response:', errorData);
      throw new Error(errorData.message || 'Failed to reject appointment');
    }
    
    const result = await response.json();
    console.log('Success:', result);
    
    alert('✅ Appointment rejected');
    loadDoctorAppointments();
    loadRecentAppointments();
    
  } catch (error) {
    console.error('Error rejecting appointment:', error);
    alert('❌ Error: ' + error.message);
  }
}

// Form submissions
document.getElementById("availabilityForm").addEventListener("submit", (e) => {
  e.preventDefault()
  alert("Availability updated successfully!")
})

document.getElementById("doctorProfileForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const token = localStorage.getItem("token");
  if (!token) {
    alert('Please login to update profile');
    return;
  }
  
  // Get form data
  const formData = {
    education: document.getElementById("doctorEducation").value.trim(),
    certifications: document.getElementById("doctorCertifications").value.trim() || null,
    clinicName: document.getElementById("doctorClinic").value.trim() || null,
    languages: document.getElementById("doctorLanguages").value.split(',').map(l => l.trim()).filter(l => l),
    bio: document.getElementById("doctorBio").value.trim(),
    city: document.getElementById("doctorCity").value.trim(),
    experience: parseInt(document.getElementById("doctorExperience").value),
    fees: parseFloat(document.getElementById("doctorFees").value),
  };
  
  // Get consultation modes
  const modeCheckboxes = document.querySelectorAll('input[name="consultationMode"]:checked');
  formData.consultationModes = Array.from(modeCheckboxes).map(cb => cb.value);
  
  // Get expertise IDs
  const expertiseInput = document.getElementById("doctorExpertise").value.trim();
  if (expertiseInput) {
    formData.expertiseIds = expertiseInput.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
  }
  
  // Validate required fields
  if (!formData.education || !formData.bio || !formData.city) {
    alert('Please fill all required fields (marked with *)');
    return;
  }
  
  if (formData.consultationModes.length === 0) {
    alert('Please select at least one consultation mode');
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/doctors/me/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update profile');
    }
    
    const result = await response.json();
    console.log('Profile updated:', result);
    
    alert('✅ Profile updated successfully! Patients can now view your complete portfolio.');
    
    // Reload profile to show updated data
    loadDoctorProfile();
    
  } catch (error) {
    console.error('Update profile error:', error);
    alert('❌ Error updating profile: ' + error.message);
  }
});

// Load doctor profile data
async function loadDoctorProfile() {
  const token = localStorage.getItem("token");
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  
  // Set basic info
  document.getElementById("doctorProfileName").value = userData.name || '';
  document.getElementById("doctorProfileEmail").value = userData.email || '';
  
  if (!token) return;
  
  try {
    const response = await fetch(`${API_URL}/doctors/${userData.id}/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      console.log('No profile found yet');
      return;
    }
    
    const doctor = await response.json();
    const profile = doctor.profile || doctor.doctorProfile || {};
    
    console.log('Loaded profile:', profile);
    
    // Populate form with existing data
    if (profile.education) document.getElementById("doctorEducation").value = profile.education;
    if (profile.certifications) document.getElementById("doctorCertifications").value = profile.certifications;
    if (profile.clinicName) document.getElementById("doctorClinic").value = profile.clinicName;
    if (profile.city) document.getElementById("doctorCity").value = profile.city;
    if (profile.experience) document.getElementById("doctorExperience").value = profile.experience;
    if (profile.fees) document.getElementById("doctorFees").value = profile.fees;
    if (profile.bio) document.getElementById("doctorBio").value = profile.bio;
    if (profile.languages && profile.languages.length > 0) {
      document.getElementById("doctorLanguages").value = profile.languages.join(', ');
    }
    if (profile.expertise && profile.expertise.length > 0) {
      const ids = profile.expertise.map(e => e.id).join(', ');
      document.getElementById("doctorExpertise").value = ids;
    }
    
    // Set consultation modes
    if (profile.consultationModes && profile.consultationModes.length > 0) {
      document.querySelectorAll('input[name="consultationMode"]').forEach(cb => {
        cb.checked = profile.consultationModes.includes(cb.value);
      });
    }
    
  } catch (error) {
    console.error('Load profile error:', error);
  }
}

// Load profile when profile section is opened
document.addEventListener('DOMContentLoaded', () => {
  loadDoctorProfile();
});

document.getElementById("prescriptionForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const appointmentId = document.getElementById("prescriptionAppointmentId").value;
  const diagnosis = document.getElementById("diagnosis").value;
  const medications = document.getElementById("medications").value;
  const instructions = document.getElementById("instructions").value;
  
  if (!appointmentId) {
    alert('Appointment ID not found');
    return;
  }

  try {
    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    console.log('Current user:', userData);
    console.log('Completing appointment:', appointmentId);
    
    // Complete the appointment
    const response = await fetch(`${API_URL}/appointments/${appointmentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        status: 'COMPLETED',
        prescription: {
          diagnosis,
          medications,
          instructions
        }
      })
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Response data:', error);
      
      if (response.status === 403 && error.message.includes('Patient access only')) {
        throw new Error(`You must be logged in as a DOCTOR to complete appointments.\n\nCurrent role: ${userData.role || 'Unknown'}\n\nPlease logout and login as a doctor.`);
      }
      
      throw new Error(error.message || 'Failed to complete appointment');
    }

    alert(`Appointment completed successfully!\\n\\nPrescription saved for ${currentPatientName}`);
    closePrescriptionModal();
    loadDoctorAppointments();
    loadRecentAppointments();
  } catch (error) {
    console.error('Error completing appointment:', error);
    alert(`Failed to complete appointment: ${error.message}`);
  }
});

// Load recent appointments for dashboard display
async function loadRecentAppointments() {
  const container = document.getElementById("doctorRecentAppointments");
  if (!container) return;
  
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${API_URL}/appointments`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    
    if (!res.ok) {
      throw new Error('Failed to load recent appointments');
    }
    
    const appointments = await res.json();
    const items = Array.isArray(appointments) ? appointments.slice(0, 5) : [];

    if (items.length === 0) {
      container.innerHTML = "<p style='text-align: center; color: #666;'>No appointments yet</p>";
      return;
    }

    container.innerHTML = items
      .map((apt) => {
        const patientName = apt.patient?.name || apt.patientName || 'Unknown';
        let dateTimeStr = 'N/A';
        if (apt.slot && apt.slot.startTime) {
          dateTimeStr = new Date(apt.slot.startTime).toLocaleString();
        } else if (apt.scheduledAt) {
          dateTimeStr = new Date(apt.scheduledAt).toLocaleString();
        } else if (apt.dateTime) {
          dateTimeStr = apt.dateTime;
        }
        
        const statusColor = {
          'PENDING': '#ff9800',
          'CONFIRMED': '#4caf50',
          'COMPLETED': '#2196f3',
          'CANCELLED': '#f44336',
          'REJECTED': '#f44336'
        };
        
        return `
          <div style="padding: 1rem; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h4 style="margin: 0 0 0.25rem 0; color: #2c3e50;">${patientName}</h4>
              <p style="margin: 0; color: #666; font-size: 0.85rem;">${dateTimeStr}</p>
            </div>
            <span style="background: ${statusColor[apt.status] || '#95a5a6'}; color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: bold;">${apt.status || 'N/A'}</span>
          </div>
        `;
      })
      .join("");
  } catch (err) {
    console.error('Error loading recent appointments:', err);
    container.innerHTML = "<p style='text-align: center; color: #999;'>Failed to load appointments</p>";
  }
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  loadDoctorAppointments();
  loadPatients();
  loadRecentAppointments();
})
