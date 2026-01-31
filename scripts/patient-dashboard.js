// Check if user is a patient, otherwise redirect
function checkPatientRole() {
  const userData = JSON.parse(localStorage.getItem("userData") || '{}')
  const role = (userData.role || "PATIENT").toUpperCase()
  
  if (role !== "PATIENT") {
    alert("Access denied. Patient dashboard is only for patients.")
    window.location.href = "login.html"
  }
}

// Check role on page load
checkPatientRole()

// Get initial section from URL parameter
const urlParams = new URLSearchParams(window.location.search);
const initialSection = urlParams.get('section') || 'dashboard';

// Navigation
document.querySelectorAll(".nav-item[data-section]").forEach((item) => {
  item.addEventListener("click", function (e) {
    e.preventDefault()
    const section = this.dataset.section
    showSection(section)
  })
})

const API_URL = "http://localhost:5050/api"

// Load recommended doctors for dashboard
async function loadRecommendedDoctors() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/doctors?limit=3&recommended=true`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });

    if (response.ok) {
      const doctors = await response.json();
      displayRecommendedDoctors(doctors.slice(0, 3)); // Show top 3
    } else {
      // Fallback to static data if API fails
      loadRecommendedDoctorsFallback();
    }
  } catch (error) {
    console.error('Error loading recommended doctors:', error);
    loadRecommendedDoctorsFallback();
  }
}

function displayRecommendedDoctors(doctors) {
  const container = document.getElementById('recommendedDoctors');
  if (!container) return;

  container.innerHTML = doctors.map(doctor => `
    <div class="recommended-doctor-card">
      <div class="doctor-avatar">
        <span>${doctor.name ? doctor.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'DR'}</span>
      </div>
      <div class="doctor-info">
        <h4>${doctor.name || 'Doctor'}</h4>
        <p>${doctor.doctorProfile?.specialization || 'General Medicine'} • ${doctor.ratings ? doctor.ratings.toFixed(1) : '4.5'} ⭐</p>
        <p class="specialization">${doctor.doctorProfile?.experience || '5'}+ years experience</p>
      </div>
      <button class="btn btn-outline btn-sm" onclick="bookDoctor(${doctor.id})">Book Now</button>
    </div>
  `).join('');
}

function loadRecommendedDoctorsFallback() {
  const container = document.getElementById('recommendedDoctors');
  if (!container) return;

  container.innerHTML = `
    <div class="recommended-doctor-card">
      <div class="doctor-avatar">
        <span>SJ</span>
      </div>
      <div class="doctor-info">
        <h4>Dr. Sarah Johnson</h4>
        <p>Cardiologist • 4.8 ⭐</p>
        <p class="specialization">8+ years experience</p>
      </div>
      <button class="btn btn-outline btn-sm" onclick="bookDoctor(1)">Book Now</button>
    </div>
    <div class="recommended-doctor-card">
      <div class="doctor-avatar">
        <span>MC</span>
      </div>
      <div class="doctor-info">
        <h4>Dr. Michael Chen</h4>
        <p>Internal Medicine • 4.9 ⭐</p>
        <p class="specialization">12+ years experience</p>
      </div>
      <button class="btn btn-outline btn-sm" onclick="bookDoctor(2)">Book Now</button>
    </div>
    <div class="recommended-doctor-card">
      <div class="doctor-avatar">
        <span>PS</span>
      </div>
      <div class="doctor-info">
        <h4>Dr. Priya Sharma</h4>
        <p>Pediatrician • 4.7 ⭐</p>
        <p class="specialization">6+ years experience</p>
      </div>
      <button class="btn btn-outline btn-sm" onclick="bookDoctor(3)">Book Now</button>
    </div>
  `;
}

function bookDoctor(doctorId) {
  // Store doctor ID and redirect to problem selection for booking
  sessionStorage.setItem('selectedDoctorId', doctorId);
  window.location.href = 'problem-selection.html';
}

/**
 * Load appointments for the patient
 */
async function loadAppointments() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }

    console.log('Fetching appointments from:', `${API_URL}/appointments`);

    const response = await fetch(`${API_URL}/appointments`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Appointments response status:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch appointments`);
    }

    const appointments = await response.json();
    console.log('Appointments loaded:', appointments);

    displayAppointments(appointments);
  } catch (error) {
    console.error('Error loading appointments:', error);
    displayAppointmentsError(error.message);
  }
}

/**
 * Display appointments in the table
 */
function displayAppointments(appointments) {
  const tbody = document.querySelector('#appointmentsTable tbody');
  if (!tbody) {
    console.error('Appointments table not found');
    return;
  }

  if (!appointments || appointments.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 2rem; color: #999;">
          No appointments yet. <a href="#find-doctors" onclick="showSection('find-doctors')">Find doctors</a> to book an appointment.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = appointments.map(appt => {
    const doctorName = appt.doctor?.name || 'Unknown Doctor';
    const doctorSpecialty = appt.doctor?.doctorProfile?.specialty || 'General Medicine';
    const appointmentDate = new Date(appt.scheduledAt || appt.date);
    const dateStr = appointmentDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
    const timeStr = appointmentDate.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
    const mode = appt.mode || 'IN_PERSON';
    const status = appt.status || 'PENDING';
    const statusClass = status.toLowerCase();

    return `
      <tr>
        <td><strong>${doctorName}</strong></td>
        <td>${doctorSpecialty}</td>
        <td>${dateStr} at ${timeStr}</td>
        <td>${mode === 'IN_PERSON' ? '🏥 In-Person' : '💻 Online'}</td>
        <td>
          <span class="status-badge status-${statusClass}">
            ${status === 'PENDING' ? '⏳ Pending' : status === 'CONFIRMED' ? '✅ Confirmed' : status === 'COMPLETED' ? '✔️ Completed' : '❌ ' + status}
          </span>
        </td>
        <td>
          <button class="btn btn-sm btn-outline" onclick="viewAppointmentDetails(${appt.id})">View</button>
          ${status === 'PENDING' ? `<button class="btn btn-sm btn-danger" onclick="cancelAppointment(${appt.id})">Cancel</button>` : ''}
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Display error message in appointments table
 */
function displayAppointmentsError(errorMsg) {
  const tbody = document.querySelector('#appointmentsTable tbody');
  if (!tbody) return;

  tbody.innerHTML = `
    <tr>
      <td colspan="6" style="text-align: center; padding: 2rem; color: #e74c3c;">
        Failed to load appointments: ${errorMsg}
      </td>
    </tr>
  `;
}

/**
 * Filter appointments by status
 */
function filterAppointments(status) {
  const rows = document.querySelectorAll('#appointmentsTable tbody tr');
  rows.forEach(row => {
    if (status === 'all') {
      row.style.display = '';
    } else {
      const statusBadge = row.querySelector('.status-badge');
      if (statusBadge && statusBadge.textContent.includes(status.charAt(0).toUpperCase() + status.slice(1))) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    }
  });
}

/**
 * Cancel an appointment
 */
async function cancelAppointment(appointmentId) {
  if (!confirm('Are you sure you want to cancel this appointment?')) {
    return;
  }

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/appointments/${appointmentId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: 'CANCELLED' })
    });

    if (!response.ok) {
      throw new Error('Failed to cancel appointment');
    }

    alert('Appointment cancelled successfully');
    loadAppointments(); // Reload the list
  } catch (error) {
    alert('Error cancelling appointment: ' + error.message);
  }
}

/**
 * View appointment details
 */
function viewAppointmentDetails(appointmentId) {
  alert('Appointment details view coming soon!');
  // TODO: Implement detailed view modal
}

function showSection(section) {
  // Update active nav item
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.remove("active")
  })
  document.querySelector(`[data-section="${section}"]`).classList.add("active")

  // Show section
  document.querySelectorAll(".content-section").forEach((sec) => {
    sec.classList.remove("active")
  })
  document.getElementById(`${section}-section`).classList.add("active")

  // Update header
  const titles = {
    dashboard: { title: "Dashboard", subtitle: "Welcome back, Patient" },
    "find-doctors": { title: "Find Doctors", subtitle: "Search for healthcare professionals" },
    appointments: { title: "My Appointments", subtitle: "View and manage your appointments" },
    "medical-records": { title: "Medical Records", subtitle: "Access your health history" },
    profile: { title: "Profile", subtitle: "Manage your account settings" },
  }

  const header = titles[section] || { title: "Dashboard", subtitle: "Welcome back" }
  document.getElementById("sectionTitle").textContent = header.title
  document.getElementById("sectionSubtitle").innerHTML = header.subtitle

  // Load appointments when viewing appointments section
  if (section === "appointments") {
    loadAppointments();
  }
}

// Load doctors
async function loadDoctors() {
  const grid = document.getElementById("doctorsGrid")
  grid.innerHTML = '<div class="loading">Loading doctors...</div>'

  try {
    const token = localStorage.getItem('token');
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const res = await fetch(`${API_URL}/doctors`, { headers })
    const doctors = res.ok ? await res.json() : []

    if (!res.ok || !Array.isArray(doctors) || doctors.length === 0) {
      // fallback to demo list if API returns nothing
      return loadDoctorsFallback()
    }

    grid.innerHTML = doctors
      .map(
        (doctor) => `
    <div class="doctor-card">
      <div class="doctor-header">
        <div class="doctor-avatar">
          <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Ccircle cx='32' cy='32' r='32' fill='%234f46e5'/%3E%3Ctext fill='white' font-size='24' font-family='Arial' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3E${doctor.name ? doctor.name.charAt(0).toUpperCase() : 'D'}%3C/text%3E%3C/svg%3E" alt="${doctor.name}">
        </div>
        <div class="doctor-info">
          <h4>${doctor.name}</h4>
          <p>${doctor.specialty || doctor.specialization || ''}</p>
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.25rem;">
            <span class="rating">★ ${doctor.rating || '4.8'}</span>
            <span style="color: var(--text-tertiary); font-size: 0.875rem;">(${doctor.reviews || 0} reviews)</span>
          </div>
        </div>
      </div>
      <div class="doctor-meta">
        <span>💼 ${doctor.experience || ''}</span>
        <span>💰 $${doctor.fees || doctor.fee || ''}</span>
      </div>
      <div style="margin-bottom: 1rem;">
        <button onclick="viewDoctorAvailability(${doctor.id})" style="padding: 0.5rem 1rem; background: #e8f5e9; color: #2e7d32; border: 1px solid #4caf50; border-radius: 4px; cursor: pointer; font-size: 0.875rem; font-weight: 600;">📅 View Available Slots</button>
      </div>
      <div class="doctor-actions">
        <button class="btn btn-outline" onclick="viewDoctorProfile(${doctor.id})">View Profile</button>
        <button class="btn btn-primary" onclick="bookAppointment(${doctor.id})">Book Now</button>
      </div>
    </div>
  `,
      )
      .join("")
  } catch (err) {
    console.error(err)
    loadDoctorsFallback()
  }
}

function loadDoctorsFallback() {
  // keep demo data if API unavailable
  const doctors = [
    { id: 1, name: "Dr. Sarah Johnson", specialization: "Cardiology", experience: "15 years", rating: 4.9, reviews: 234, fee: 100, availability: "Available Today" },
    { id: 2, name: "Dr. Michael Chen", specialization: "General Practice", experience: "10 years", rating: 4.8, reviews: 189, fee: 75, availability: "Available Tomorrow" },
    { id: 3, name: "Dr. Emily Rodriguez", specialization: "Dentistry", experience: "12 years", rating: 4.9, reviews: 256, fee: 90, availability: "Available Today" },
  ]

  const grid = document.getElementById("doctorsGrid")
  grid.innerHTML = doctors
    .map(
      (doctor) => `
    <div class="doctor-card">
      <div class="doctor-header">
        <div class="doctor-avatar">
          <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Ccircle cx='32' cy='32' r='32' fill='%234f46e5'/%3E%3Ctext fill='white' font-size='24' font-family='Arial' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3E${doctor.name ? doctor.name.charAt(0).toUpperCase() : 'D'}%3C/text%3E%3C/svg%3E" alt="${doctor.name}">
        </div>
        <div class="doctor-info">
          <h4>${doctor.name}</h4>
          <p>${doctor.specialization}</p>
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.25rem;">
            <span class="rating">★ ${doctor.rating}</span>
            <span style="color: var(--text-tertiary); font-size: 0.875rem;">(${doctor.reviews} reviews)</span>
          </div>
        </div>
      </div>
      <div class="doctor-meta">
        <span>💼 ${doctor.experience}</span>
        <span>💰 $${doctor.fee}</span>
      </div>
      <p style="margin-bottom: 1rem; color: var(--text-secondary); font-size: 0.875rem;">${doctor.availability}</p>
      <div class="doctor-actions">
        <button class="btn btn-outline" onclick="viewDoctorProfile(${doctor.id})">View Profile</button>
        <button class="btn btn-primary" onclick="bookAppointment(${doctor.id})">Book Now</button>
      </div>
    </div>
  `,
    )
    .join("")
}

// Load appointments from backend
async function loadAppointments() {
  const tbody = document.querySelector("#appointmentsTable tbody")
  tbody.innerHTML = '<tr><td colspan="6">Loading appointments...</td></tr>'
  const token = localStorage.getItem("token")

  try {
    const res = await fetch(`${API_URL}/appointments`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    const appointments = res.ok ? await res.json() : []
    
    // Map the API data to include doctor and patient names
    const items = Array.isArray(appointments) && appointments.length ? appointments : [];
    
    if (items.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="padding: 20px; text-align: center;">No appointments found. Book your first appointment!</td></tr>';
      return;
    }

  tbody.innerHTML = items
    .map(
      (apt) => {
        const isCompleted = (apt.status || '').toUpperCase() === 'COMPLETED';
        
        // Get doctor and patient info
        const doctorName = apt.doctor?.name || apt.doctorName || `Doctor ID: ${apt.doctorId}`;
        const specialty = apt.doctor?.specialty || apt.specialization || 'N/A';
        const dateTime = apt.scheduledAt ? new Date(apt.scheduledAt).toLocaleString() : apt.dateTime || 'N/A';
        const mode = apt.mode || apt.type || 'N/A';
        const status = apt.status || 'PENDING';
        
        return `
    <tr>
      <td><strong>${doctorName}</strong></td>
      <td>${specialty}</td>
      <td>${dateTime}</td>
      <td><span style="padding: 4px 8px; background: #e3f2fd; border-radius: 4px; font-size: 0.875rem;">${mode}</span></td>
      <td><span class="badge badge-${status.toLowerCase()}">${status}</span></td>
      <td>
        <button class="btn btn-primary" style="padding: 0.375rem 0.75rem; font-size: 0.8rem;" onclick="openReviewModal(${apt.id}, ${apt.doctorId}, '${doctorName.replace(/'/g, "\\'")}')">Leave Review</button>
        ${!isCompleted ? `<button class="btn btn-outline" style="padding: 0.375rem 0.75rem; font-size: 0.8rem; margin-left: 0.5rem;" onclick="testCompleteAppointment(${apt.id})">Mark Complete</button>` : ''}
      </td>
    </tr>`;
      }
    )
    .join("")

  // Load upcoming appointments for dashboard
  const upcoming = items.filter((a) => (a.status || '').toLowerCase() === 'confirmed' || (a.status || '').toLowerCase() === 'pending').slice(0, 3)
  const upcomingList = document.getElementById("upcomingAppointments")
  if (upcomingList) {
    upcomingList.innerHTML = upcoming
      .map(
        (apt) => `
      <div class="appointment-item">
        <div class="appointment-info">
          <h4>${apt.doctorName || apt.doctor || ''}</h4>
          <p>${apt.scheduledAt ? new Date(apt.scheduledAt).toLocaleString() : apt.dateTime} • ${apt.mode || apt.type || ''}</p>
        </div>
        <span class="badge badge-${(apt.status || '').toLowerCase()}">${apt.status}</span>
      </div>
    `,
      )
      .join("")
  }
  } catch (err) {
    console.error(err)
    const items = [
      { id: 1, doctor: "Dr. Sarah Johnson", specialization: "Cardiology", dateTime: "Jan 6, 2026 - 10:00 AM", type: "In-Person", status: "confirmed", payment: "Paid" },
      { id: 2, doctor: "Dr. Michael Chen", specialization: "General Practice", dateTime: "Jan 8, 2026 - 2:30 PM", type: "Online", status: "pending", payment: "Pending" },
    ]
    tbody.innerHTML = items
      .map(
        (apt) => `
    <tr>
      <td>${apt.doctor}</td>
      <td>${apt.specialization}</td>
      <td>${apt.dateTime}</td>
      <td>${apt.type}</td>
      <td>${apt.status}</td>
      <td>${apt.payment}</td>
    </tr>`,
      )
      .join("")
  }
}

function loadMedicalRecords() {
  const list = document.getElementById("recordsList")
  list.innerHTML = '<div class="loading">Loading your medical records...</div>'
  
  try {
    const token = localStorage.getItem("token")
    const userData = JSON.parse(localStorage.getItem("userData") || '{}')
    
    if (!token || userData.role !== 'PATIENT') {
      list.innerHTML = '<p style="text-align: center; color: #666;">Please login as a patient to view medical records</p>'
      return
    }
    
    // Fetch patient's medical records from the backend
    fetch(`${API_URL}/patients/${userData.id}/records`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch records')
      }
      return response.json()
    })
    .then(records => {
      if (!Array.isArray(records) || records.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: #666; padding: 1rem;">No medical records found. Your doctor will add records after consultations.</p>'
        return
      }

      list.innerHTML = records
        .map(
          (record) => `
        <div class="record-item">
          <div class="record-header">
            <div>
              <h4>${record.title || record.name || 'Medical Record'}</h4>
              <p>${new Date(record.createdAt || record.date).toLocaleDateString()} • ${record.type || 'Medical Document'}</p>
            </div>
            <button class="btn btn-outline" onclick="viewRecord(${record.id})">View</button>
          </div>
        </div>`,
        )
        .join("")
    })
    .catch(error => {
      console.error('Error loading medical records:', error)
      list.innerHTML = '<p style="text-align: center; color: #666; padding: 1rem;">No medical records found</p>'
    })
  } catch (error) {
    console.error('Error:', error)
    list.innerHTML = '<p style="text-align: center; color: #666; padding: 1rem;">Could not load medical records</p>'
  }
}

// Patients section - Load patients with role 'PATIENT'
const token = localStorage.getItem("token")

async function loadPatients() {
  const grid = document.getElementById("patientsGrid")
  grid.innerHTML = "<div class='loading'>Loading patients...</div>"

  const patients = [
    { id: 1, name: "Jane Smith", age: 30, gender: "Female", lastVisit: "Dec 28, 2025", totalVisits: 5 },
    { id: 2, name: "John Doe", age: 45, gender: "Male", lastVisit: "Dec 20, 2025", totalVisits: 3 },
  ]

  grid.innerHTML = patients
    .map(
      (patient) => `
      <div class="patient-card">
        <h4>${patient.name}</h4>
        <p>Age: ${patient.age}</p>
        <p>Gender: ${patient.gender}</p>
        <p>Last Visit: ${patient.lastVisit}</p>
        <p>Total Visits: ${patient.totalVisits}</p>
      </div>`,
    )
    .join("")
}

// Search and filter functions
function searchDoctors() {
  loadDoctors()
}

function filterAppointments(status) {
  loadAppointments()
}

function viewDoctorProfile(doctorId) {
  
  // Fetch doctor details from API
  fetchDoctorProfile(doctorId);
}

let currentProfileDoctor = null;

async function fetchDoctorProfile(doctorId) {
  try {
    const token = localStorage.getItem('token');
    const headers = {};
    
    // Add token if available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}/doctors/${doctorId}/profile`, {
      headers: headers
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        // Try getting doctor from the list instead
        const listResponse = await fetch(`${API_URL}/doctors`);
        if (listResponse.ok) {
          const doctors = await listResponse.json();
          const doctor = doctors.find(d => d.id === parseInt(doctorId));
          if (doctor) {
            displayDoctorProfile(doctor);
            return;
          }
        }
      }
      throw new Error('Failed to fetch doctor details');
    }
    
    const doctor = await response.json();
    displayDoctorProfile(doctor);
    
  } catch (error) {
    console.error('Error fetching doctor profile:', error);
    alert('Failed to load doctor profile. Please try again.');
  }
}

function displayDoctorProfile(doctor) {
  currentProfileDoctor = doctor;
  
  // Get profile data (could be nested in different formats)
  const profile = doctor.profile || doctor.doctorProfile || {};
  
  console.log('Displaying doctor profile:', doctor);
  console.log('Profile data:', profile);
  
  // Doctor name and initial
  const name = doctor.name || 'N/A';
  document.getElementById('profileDoctorName').textContent = name;
  document.getElementById('profileDoctorInitial').textContent = name.charAt(0).toUpperCase();
  
  // Specialty (not in schema, using general field or first expertise)
  const specialty = profile.specialization || doctor.specialty || doctor.specialization || 
    (profile.expertise && profile.expertise.length > 0 ? profile.expertise[0].name : 'General Medicine');
  document.getElementById('profileDoctorSpecialty').textContent = specialty;
  
  // Rating and reviews
  document.getElementById('profileDoctorRating').textContent = doctor.ratings || doctor.rating || '4.8';
  document.getElementById('profileDoctorReviews').textContent = 
    (doctor.reviews && doctor.reviews.length) || doctor.reviewCount || '0';
  
  // Status badge
  const statusEl = document.getElementById('profileDoctorStatus');
  const status = doctor.status || 'APPROVED';
  statusEl.textContent = status;
  statusEl.style.background = status === 'APPROVED' ? '#e8f5e9' : '#fff3e0';
  statusEl.style.color = status === 'APPROVED' ? '#2e7d32' : '#e65100';
  
  // Experience
  document.getElementById('profileDoctorExperience').textContent = 
    `${profile.experience || doctor.experience || '0'} years`;
  
  // Fees
  document.getElementById('profileDoctorFee').textContent = 
    profile.fees || profile.consultationFee || doctor.fees || doctor.fee || '500';
  
  // Education
  document.getElementById('profileDoctorEducation').textContent = 
    profile.education || 'Not specified';
  
  // Certifications
  const certifications = profile.certifications || '';
  if (certifications && certifications.trim()) {
    document.getElementById('profileDoctorCertifications').textContent = certifications;
    document.getElementById('profileCertificationsSection').style.display = 'block';
  } else {
    document.getElementById('profileCertificationsSection').style.display = 'none';
  }
  
  // Clinic
  const clinic = profile.clinicName || '';
  if (clinic && clinic.trim()) {
    document.getElementById('profileDoctorClinic').textContent = clinic;
    document.getElementById('profileClinicSection').style.display = 'block';
  } else {
    document.getElementById('profileClinicSection').style.display = 'none';
  }
  
  // City
  document.getElementById('profileDoctorCity').textContent = profile.city || 'Not specified';
  
  // Languages
  const languages = profile.languages || [];
  const languagesEl = document.getElementById('profileDoctorLanguages');
  if (languages && languages.length > 0) {
    languagesEl.innerHTML = languages.map(lang => 
      `<span style="padding: 4px 12px; background: #e0e7ff; color: #4c51bf; border-radius: 12px; font-size: 0.875rem;">${lang}</span>`
    ).join('');
    document.getElementById('profileLanguagesSection').style.display = 'block';
  } else {
    document.getElementById('profileLanguagesSection').style.display = 'none';
  }
  
  // Expertise (Disease array)
  const expertise = profile.expertise || [];
  const expertiseEl = document.getElementById('profileDoctorExpertise');
  if (expertise && expertise.length > 0) {
    expertiseEl.innerHTML = expertise.map(exp => {
      const name = exp.name || exp.disease?.name || exp;
      return `<span style="padding: 4px 12px; background: #dcfce7; color: #16a34a; border-radius: 12px; font-size: 0.875rem;">${name}</span>`;
    }).join('');
    document.getElementById('profileExpertiseSection').style.display = 'block';
  } else {
    document.getElementById('profileExpertiseSection').style.display = 'none';
  }
  
  // Consultation Modes
  const modes = profile.consultationModes || [];
  const modesEl = document.getElementById('profileDoctorModes');
  if (modes && modes.length > 0) {
    modesEl.innerHTML = modes.map(mode => 
      `<span style="padding: 4px 12px; background: #fef3c7; color: #d97706; border-radius: 12px; font-size: 0.875rem;">${mode.replace('_', ' ')}</span>`
    ).join('');
    document.getElementById('profileModesSection').style.display = 'block';
  } else {
    document.getElementById('profileModesSection').style.display = 'none';
  }
  
  // Bio
  const bio = profile.bio || '';
  if (bio && bio.trim()) {
    document.getElementById('profileDoctorBio').textContent = bio;
    document.getElementById('profileBioSection').style.display = 'block';
  } else {
    document.getElementById('profileBioSection').style.display = 'none';
  }
  
  // Contact info
  document.getElementById('profileDoctorEmail').textContent = doctor.email || 'N/A';
  const phone = doctor.phoneNumber && doctor.phoneNumber.length > 0 ? doctor.phoneNumber[0] : 'Not provided';
  document.getElementById('profileDoctorPhone').textContent = phone;
  
  // Show modal
  const modal = document.getElementById('doctorProfileModal');
  if (modal) {
    modal.style.display = 'flex';
  } else {
    console.error('Modal element not found!');
  }
}

function closeDoctorProfileModal() {
  document.getElementById('doctorProfileModal').style.display = 'none';
  currentProfileDoctor = null;
}

function bookFromProfile() {
  if (currentProfileDoctor) {
    closeDoctorProfileModal();
    bookAppointment(currentProfileDoctor.id);
  }
}

// Appointment Booking Functions
let currentBookingData = { doctorId: null, doctorName: '' };

function bookAppointment(doctorId) {
  // Find doctor from currently loaded doctors
  const doctorCard = document.querySelector(`[onclick*="bookAppointment(${doctorId})"]`);
  
  let doctorName = `Doctor ID: ${doctorId}`;
  let doctorData = { doctorId };
  
  // Try to get doctor info from the card
  if (doctorCard && doctorCard.closest('.doctor-card')) {
    const card = doctorCard.closest('.doctor-card');
    const header = card.querySelector('.doctor-header');
    if (header) {
      const nameElement = header.querySelector('h4');
      if (nameElement) {
        doctorName = nameElement.textContent;
        doctorData.doctorName = doctorName;
      }
    }
  }
  
  currentBookingData = doctorData;
  
  const modal = document.getElementById('bookingModal');
  if (modal) {
    document.getElementById('bookingDoctorName').textContent = doctorName;
    
    // Set minimum datetime to now
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    document.getElementById('appointmentDateTime').min = now.toISOString().slice(0, 16);
    document.getElementById('appointmentDateTime').value = '';
    document.getElementById('appointmentMode').value = 'IN_PERSON';
    document.getElementById('appointmentReason').value = '';
    
    modal.style.display = 'flex';
  }
}

function closeBookingModal() {
  const modal = document.getElementById('bookingModal');
  if (modal) {
    modal.style.display = 'none';
  }
  currentBookingData = { doctorId: null, doctorName: '' };
}

async function confirmBooking() {
  const dateTime = document.getElementById('appointmentDateTime').value;
  const mode = document.getElementById('appointmentMode').value;
  const reason = document.getElementById('appointmentReason').value.trim();
  
  if (!dateTime) {
    alert('Please select date and time for the appointment');
    return;
  }
  
  if (!currentBookingData.doctorId) {
    alert('Invalid doctor selection');
    return;
  }
  
  try {
    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    if (!token) {
      alert('Please login to book an appointment');
      window.location.href = 'login.html';
      return;
    }
    
    // Check if user is a PATIENT
    if (userData.role !== 'PATIENT') {
      alert(`You are logged in as ${userData.role}. Please logout and login as a PATIENT to book appointments.`);
      return;
    }
    
    // Convert to ISO format for backend
    const scheduledAt = new Date(dateTime).toISOString();
    
    const response = await fetch(`${API_URL}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        doctorId: parseInt(currentBookingData.doctorId),
        scheduledAt,
        mode,
        reason
      })
    });
    
    console.log('Response status:', response.status);
    
    const data = await response.json();
    console.log('Response data:', data);
    
    if (!response.ok) {
      if (response.status === 401) {
        alert('Your session has expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        window.location.href = 'login.html';
        return;
      }
      if (response.status === 403) {
        alert('Access denied. You must be logged in as a PATIENT to book appointments.\n\nPlease logout and login with a patient account.');
        return;
      }
      alert(data.message || data.error || 'Failed to book appointment');
      return;
    }
    
    alert('Appointment booked successfully! You will receive a confirmation.');
    closeBookingModal();
    loadAppointments(); // Reload appointments to show the new one
    showSection('appointments'); // Navigate to appointments section
  } catch (error) {
    console.error('Error booking appointment:', error);
    alert('Failed to book appointment. Please try again.');
  }
}

function viewRecord(recordId) {
  alert("Medical record will be shown here")
}

// Logout function
function patientLogout() {
  localStorage.removeItem("token")
  localStorage.removeItem("userData")
  window.location.href = "login.html"
}

// View Doctor Availability with Slots
async function viewDoctorAvailability(doctorId) {
  try {
    const token = localStorage.getItem('token');
    
    // Fetch slots for next 7 days
    const allSlots = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      const response = await fetch(`${API_URL}/doctors/${doctorId}/slots?date=${dateStr}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      if (response.ok) {
        const daySlots = await response.json();
        allSlots.push(...daySlots);
      }
    }
    
    console.log('Doctor slots:', allSlots);
    
    // Create modal
    const modal = document.createElement('div');
    modal.id = 'availabilityModal';
    modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:1000;display:flex;align-items:center;justify-content:center;overflow-y:auto;';
    
    const availableSlots = Array.isArray(allSlots) ? allSlots.filter(s => !s.isBooked) : [];
    const groupedByDate = {};
    
    availableSlots.forEach(slot => {
      const date = new Date(slot.startDateTime || slot.startTime).toLocaleDateString();
      if (!groupedByDate[date]) groupedByDate[date] = [];
      groupedByDate[date].push(slot);
    });
    
    const dates = Object.keys(groupedByDate).sort();
    
    modal.innerHTML = `
      <div style="background:white;padding:2rem;border-radius:12px;max-width:700px;width:90%;max-height:90vh;overflow-y:auto;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;">
          <h2 style="margin:0;">Available Time Slots</h2>
          <button onclick="closeAvailabilityModal()" style="background:none;border:none;font-size:28px;cursor:pointer;color:#666;">&times;</button>
        </div>
        
        ${availableSlots.length === 0 
          ? '<p style="text-align:center;padding:2rem;color:#999;">No available slots at the moment. Please check back later.</p>'
          : `
            <div style="margin-bottom:1rem;padding:1rem;background:#e3f2fd;border-radius:8px;">
              <p style="margin:0;color:#1976d2;font-weight:600;">📅 ${availableSlots.length} slots available across ${dates.length} days</p>
            </div>
            
            ${dates.map(date => `
              <div style="margin-bottom:1.5rem;">
                <h3 style="color:#2d3748;font-size:1.1rem;margin-bottom:0.75rem;padding-bottom:0.5rem;border-bottom:2px solid #e2e8f0;">
                  ${new Date(groupedByDate[date][0].startDateTime || groupedByDate[date][0].startTime).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </h3>
                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:0.75rem;">
                  ${groupedByDate[date].map(slot => {
                    const startTime = new Date(slot.startDateTime || slot.startTime);
                    const endTime = new Date(slot.endDateTime || slot.endTime);
                    return `
                      <button onclick="bookSlot(${slot.slotId || slot.id}, ${doctorId})" style="padding:0.75rem;background:#f0fdf4;border:2px solid #86efac;border-radius:8px;cursor:pointer;transition:all 0.2s;font-size:0.9rem;font-weight:600;color:#166534;" onmouseover="this.style.background='#dcfce7';this.style.borderColor='#4ade80'" onmouseout="this.style.background='#f0fdf4';this.style.borderColor='#86efac'">
                        ${slot.startTime || startTime.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                      </button>
                    `;
                  }).join('')}
                </div>
              </div>
            `).join('')}
          `
        }
        
        <div style="margin-top:1.5rem;padding-top:1rem;border-top:1px solid #e2e8f0;">
          <button onclick="closeAvailabilityModal()" style="padding:0.75rem 1.5rem;background:#e5e7eb;color:#374151;border:none;border-radius:6px;cursor:pointer;font-weight:600;">Close</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
  } catch (error) {
    console.error('Error loading availability:', error);
    alert('Failed to load doctor availability');
  }
}

function closeAvailabilityModal() {
  const modal = document.getElementById('availabilityModal');
  if (modal) modal.remove();
}

function bookSlot(slotId, doctorId) {
  closeAvailabilityModal();
  // Redirect to slot booking page with pre-selected slot
  sessionStorage.setItem('selectedSlotId', slotId);
  sessionStorage.setItem('selectedDoctorId', doctorId);
  window.location.href = `slot-booking.html?doctorId=${doctorId}&slotId=${slotId}`;
}

// Review Modal Functions
let currentReviewData = { appointmentId: null, doctorId: null, doctorName: '' };

// Test function to mark appointment as complete
async function testCompleteAppointment(appointmentId) {
  if (!confirm('Mark this appointment as COMPLETED? (This is for testing the review feature)')) {
    return;
  }
  
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/appointments/${appointmentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: 'COMPLETED' })
    });
    
    if (!response.ok) {
      const data = await response.json();
      alert(data.message || 'Failed to update appointment');
      return;
    }
    
    alert('Appointment marked as COMPLETED! Reload the page to see the Review button.');
    loadAppointments();
  } catch (error) {
    console.error('Error updating appointment:', error);
    alert('Failed to update appointment status.');
  }
}

function openReviewModal(appointmentId, doctorId, doctorName) {
  currentReviewData = { appointmentId, doctorId, doctorName };
  const modal = document.getElementById('reviewModal');
  if (modal) {
    document.getElementById('reviewDoctorName').textContent = doctorName;
    document.getElementById('reviewRating').value = '5';
    document.getElementById('reviewComment').value = '';
    modal.style.display = 'flex';
  }
}

function closeReviewModal() {
  const modal = document.getElementById('reviewModal');
  if (modal) {
    modal.style.display = 'none';
  }
  currentReviewData = { appointmentId: null, doctorId: null, doctorName: '' };
}

async function submitReview() {
  const rating = parseInt(document.getElementById('reviewRating').value);
  const comment = document.getElementById('reviewComment').value.trim();
  
  if (!currentReviewData.appointmentId) {
    alert('Invalid appointment data');
    return;
  }
  
  if (!comment) {
    alert('Please enter a comment');
    return;
  }
  
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        appointmentId: currentReviewData.appointmentId,
        rating,
        comment
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      alert(data.error || 'Failed to submit review');
      return;
    }
    
    alert('Review submitted successfully! Thank you for your feedback.');
    closeReviewModal();
    loadAppointments(); // Reload appointments to update UI
  } catch (error) {
    console.error('Error submitting review:', error);
    alert('Failed to submit review. Please try again.');
  }
}

// Profile form submission
document.getElementById("profileForm")?.addEventListener("submit", (e) => {
  e.preventDefault()
  alert("Profile updated successfully!")
})

// Doctor Profile Modal Functions
let selectedDoctorId = null;

function viewDoctorProfile(doctorId) {
  selectedDoctorId = doctorId;
  const modal = document.getElementById("doctorProfileModal");
  const modalBody = document.getElementById("doctorProfileModalBody");
  
  modal.style.display = "flex";
  modalBody.innerHTML = '<div style="text-align: center; padding: 2rem;"><p>Loading doctor profile...</p></div>';
  
  const token = localStorage.getItem('token');
  fetch(`${API_URL}/doctors/${doctorId}/profile`, {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
  })
  .then(res => res.json())
  .then(doctor => {
    const profile = doctor.doctorProfile || {};
    const expertise = profile.expertise || [];
    const languages = profile.languages || [];
    const modes = profile.consultationModes || [];
    
    modalBody.innerHTML = `
      <div style="display: grid; gap: 2rem;">
        <!-- Doctor Header -->
        <div style="display: flex; align-items: center; gap: 1.5rem; padding-bottom: 1.5rem; border-bottom: 2px solid #e2e8f0;">
          <div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem; font-weight: bold;">
            ${doctor.name ? doctor.name.charAt(0).toUpperCase() : 'D'}
          </div>
          <div style="flex: 1;">
            <h3 style="margin: 0 0 0.5rem 0; font-size: 1.5rem; color: #1e293b;">${doctor.name || 'N/A'}</h3>
            <p style="margin: 0; color: #64748b; font-size: 1rem;">${profile.education || 'Medical Professional'}</p>
            <div style="display: flex; align-items: center; gap: 1rem; margin-top: 0.5rem;">
              <span style="display: flex; align-items: center; gap: 0.25rem; color: #f59e0b; font-weight: 600;">
                ⭐ ${doctor.ratings || '0.0'}
              </span>
              <span style="color: #64748b;">•</span>
              <span style="color: #64748b;">${profile.experience || '0'} years exp</span>
              <span style="color: #64748b;">•</span>
              <span style="color: #0066cc; font-weight: 600;">₹${profile.fees || 'N/A'}</span>
            </div>
          </div>
        </div>

        <!-- About Section -->
        ${profile.bio ? `
        <div>
          <h4 style="margin: 0 0 0.75rem 0; color: #1e293b; font-size: 1.1rem;">About</h4>
          <p style="margin: 0; color: #64748b; line-height: 1.6;">${profile.bio}</p>
        </div>
        ` : ''}

        <!-- Expertise -->
        ${expertise.length > 0 ? `
        <div>
          <h4 style="margin: 0 0 0.75rem 0; color: #1e293b; font-size: 1.1rem;">Expertise & Specializations</h4>
          <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
            ${expertise.map(exp => `
              <span style="padding: 0.5rem 1rem; background: #eff6ff; color: #0066cc; border-radius: 20px; font-size: 0.875rem; font-weight: 500;">
                ${exp.name}
              </span>
            `).join('')}
          </div>
        </div>
        ` : ''}

        <!-- Details Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem;">
          ${profile.certifications ? `
          <div style="padding: 1rem; background: #f8fafc; border-radius: 8px;">
            <h5 style="margin: 0 0 0.5rem 0; color: #64748b; font-size: 0.875rem; font-weight: 600; text-transform: uppercase;">Certifications</h5>
            <p style="margin: 0; color: #1e293b; font-weight: 500;">${profile.certifications}</p>
          </div>
          ` : ''}
          
          ${profile.city ? `
          <div style="padding: 1rem; background: #f8fafc; border-radius: 8px;">
            <h5 style="margin: 0 0 0.5rem 0; color: #64748b; font-size: 0.875rem; font-weight: 600; text-transform: uppercase;">Location</h5>
            <p style="margin: 0; color: #1e293b; font-weight: 500;">${profile.city}</p>
          </div>
          ` : ''}
          
          ${profile.clinicName ? `
          <div style="padding: 1rem; background: #f8fafc; border-radius: 8px;">
            <h5 style="margin: 0 0 0.5rem 0; color: #64748b; font-size: 0.875rem; font-weight: 600; text-transform: uppercase;">Clinic</h5>
            <p style="margin: 0; color: #1e293b; font-weight: 500;">${profile.clinicName}</p>
          </div>
          ` : ''}
          
          ${languages.length > 0 ? `
          <div style="padding: 1rem; background: #f8fafc; border-radius: 8px;">
            <h5 style="margin: 0 0 0.5rem 0; color: #64748b; font-size: 0.875rem; font-weight: 600; text-transform: uppercase;">Languages</h5>
            <p style="margin: 0; color: #1e293b; font-weight: 500;">${languages.join(', ')}</p>
          </div>
          ` : ''}
          
          ${modes.length > 0 ? `
          <div style="padding: 1rem; background: #f8fafc; border-radius: 8px;">
            <h5 style="margin: 0 0 0.5rem 0; color: #64748b; font-size: 0.875rem; font-weight: 600; text-transform: uppercase;">Consultation Modes</h5>
            <p style="margin: 0; color: #1e293b; font-weight: 500;">${modes.join(', ')}</p>
          </div>
          ` : ''}
        </div>

        <!-- Contact Info -->
        ${doctor.email || (doctor.phoneNumber && doctor.phoneNumber.length > 0) ? `
        <div style="padding: 1.5rem; background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px;">
          <h4 style="margin: 0 0 1rem 0; color: #166534; font-size: 1.1rem;">Contact Information</h4>
          <div style="display: grid; gap: 0.75rem;">
            ${doctor.email ? `
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <span style="color: #166534;">📧</span>
              <span style="color: #166534; font-weight: 500;">${doctor.email}</span>
            </div>
            ` : ''}
            ${doctor.phoneNumber && doctor.phoneNumber.length > 0 ? `
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <span style="color: #166534;">📞</span>
              <span style="color: #166534; font-weight: 500;">${doctor.phoneNumber.join(', ')}</span>
            </div>
            ` : ''}
          </div>
        </div>
        ` : ''}
      </div>
    `;
  })
  .catch(err => {
    console.error('Error loading doctor profile:', err);
    modalBody.innerHTML = '<div style="text-align: center; padding: 2rem; color: #ef4444;"><p>Failed to load doctor profile</p></div>';
  });
}

function closeDoctorProfileModal() {
  document.getElementById("doctorProfileModal").style.display = "none";
  selectedDoctorId = null;
}

function bookFromProfile() {
  if (selectedDoctorId) {
    closeDoctorProfileModal();
    bookAppointment(selectedDoctorId);
  }
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  const userData = JSON.parse(localStorage.getItem("userData") || '{}')
  if (userData.name) {
    document.getElementById("userName").textContent = userData.name
  }
  
  loadRecommendedDoctors()
  loadDoctors()
  loadAppointments()
  loadMedicalRecords()
  loadPatients()
  loadDoctorsForBooking()

  // Show initial section from URL parameter
  showSection(initialSection)
})

// Make functions globally available
window.bookDoctor = bookDoctor;

// ==================== APPOINTMENT BOOKING SYSTEM ====================

let selectedDoctorForBooking = null;
let selectedSlotForBooking = null;
let selectedDateForBooking = null;

// Load doctors for booking
async function loadDoctorsForBooking() {
  try {
    const token = localStorage.getItem('token');
    console.log('Loading doctors for booking. Token:', token ? 'Present' : 'Missing');
    
    const response = await fetch(`${API_URL}/public/doctors`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });

    console.log('Doctors API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Doctors API error response:', errorText);
      throw new Error(`API returned ${response.status}`);
    }

    const doctors = await response.json();
    console.log('Doctors loaded successfully:', doctors);
    
    // Doctors from /public/doctors endpoint are already filtered by APPROVED status
    const doctorList = Array.isArray(doctors) ? doctors : [];
    console.log('Doctors to display:', doctorList);

    displayDoctorsForBooking(doctorList);
  } catch (error) {
    console.error('Error loading doctors:', error);
    document.getElementById('bookingDoctorsGrid').innerHTML = 
      `<div style="grid-column: 1/-1; text-align: center; color: red;">
        <p><strong>Failed to load doctors</strong></p>
        <p style="font-size: 0.9rem; color: #666;">Error: ${error.message}</p>
        <button class="btn btn-primary" onclick="loadDoctorsForBooking()" style="margin-top: 1rem;">Retry</button>
      </div>`;
  }
}


// Filter doctors by specialty
function filterDoctorsForBooking() {
  const specialty = document.getElementById('bookingSpecialty').value;
  const cards = document.querySelectorAll('[data-doctor-card]');
  
  cards.forEach(card => {
    if (!specialty || card.dataset.specialty === specialty) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

// Display doctors for booking
function displayDoctorsForBooking(doctors) {
  const container = document.getElementById('bookingDoctorsGrid');
  
  if (!doctors || doctors.length === 0) {
    container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #666;">No approved doctors found. Please check back later.</div>';
    return;
  }

  container.innerHTML = doctors.map(doctor => `
    <div data-doctor-card data-specialty="${doctor.specialty || doctor.specialization || ''}" 
         onclick="selectDoctorForBooking(${doctor.id}, '${doctor.name}', '${doctor.specialty || doctor.specialization || 'N/A'}', ${doctor.fees || doctor.fee || 0})"
         style="background: white; border: 2px solid #ddd; border-radius: 8px; padding: 1.5rem; cursor: pointer; transition: all 0.3s; text-align: center;">
      <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">👨‍⚕️</div>
      <h4 style="margin: 0 0 0.5rem 0;">${doctor.name || 'Unknown'}</h4>
      <p style="margin: 0 0 0.5rem 0; color: #667eea; font-weight: 600;">${doctor.specialty || doctor.specialization || 'General Practice'}</p>
      <p style="margin: 0 0 1rem 0; color: #666; font-size: 0.9rem;">Experience: ${doctor.experience || 'N/A'} years</p>
      <p style="margin: 0 0 1rem 0; color: #e74c3c; font-weight: 600;">₨${doctor.fees || doctor.fee || 'Contact'}</p>
      <button class="btn btn-primary" style="width: 100%;">Select</button>
    </div>
  `).join('');
}


// Select doctor and show calendar
async function selectDoctorForBooking(doctorId, doctorName, specialty, fees) {
  selectedDoctorForBooking = { id: doctorId, name: doctorName, specialty, fees };
  document.getElementById('appointmentBookingContainer').style.display = 'block';
  document.getElementById('selectedDoctorInfo').textContent = `Dr. ${doctorName} - ${specialty}`;
  
  // Load slots for this doctor
  await loadSlotsForDoctor(doctorId);
  
  // Scroll to booking form
  document.getElementById('appointmentBookingContainer').scrollIntoView({ behavior: 'smooth' });
}

// Load slots for selected doctor
async function loadSlotsForDoctor(doctorId) {
  try {
    const token = localStorage.getItem('token');
    console.log('Loading slots for doctor:', doctorId);
    
    const response = await fetch(`${API_URL}/slots/doctor/${doctorId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });

    console.log('Slots API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Slots API error:', errorText);
      throw new Error(`Failed to load slots: ${response.status}`);
    }

    const slots = await response.json();
    console.log('Slots loaded:', slots);
    
    if (!Array.isArray(slots)) {
      console.error('Slots response is not an array:', slots);
      throw new Error('Invalid slots data format');
    }

    // Group slots by date
    const slotsByDate = {};
    slots.forEach(slot => {
      const date = new Date(slot.date).toISOString().split('T')[0];
      if (!slotsByDate[date]) slotsByDate[date] = [];
      slotsByDate[date].push(slot);
    });

    console.log('Slots by date:', slotsByDate);

    // Display calendar
    displayCalendar(slotsByDate);
  } catch (error) {
    console.error('Error loading slots:', error);
    document.getElementById('doctorCalendar').innerHTML = 
      `<div style="color: red;">
        <p><strong>Failed to load availability</strong></p>
        <p style="font-size: 0.9rem;">Error: ${error.message}</p>
        <button class="btn btn-primary" onclick="loadSlotsForDoctor(${selectedDoctorForBooking.id})" style="margin-top: 1rem;">Retry</button>
      </div>`;
  }
}

// Display interactive calendar
function displayCalendar(slotsByDate) {
  const container = document.getElementById('doctorCalendar');
  const today = new Date();
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  let html = '<div style="margin-bottom: 1rem;">';
  html += `<div style="font-weight: 600; margin-bottom: 0.5rem;">${today.toLocaleString('default', { month: 'long', year: 'numeric' })}</div>`;
  
  // Create calendar grid
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();
  
  html += '<div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.25rem; margin-bottom: 1rem;">';
  
  // Day headers
  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  days.forEach(day => {
    html += `<div style="text-align: center; font-weight: 600; font-size: 0.75rem; padding: 0.25rem;">${day}</div>`;
  });
  
  // Empty cells before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    html += '<div></div>';
  }
  
  // Days of month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateObj = new Date(today.getFullYear(), today.getMonth(), day);
    const dateStr = dateObj.toISOString().split('T')[0];
    const hasSlots = slotsByDate[dateStr] && slotsByDate[dateStr].length > 0;
    const isToday = dateObj.toDateString() === today.toDateString();
    
    const bgColor = isToday ? '#667eea' : (hasSlots ? '#e8f4f8' : '#f5f5f5');
    const textColor = isToday ? 'white' : '#333';
    const cursor = hasSlots ? 'pointer' : 'default';
    const opacity = hasSlots ? '1' : '0.6';
    
    html += `
      <div onclick="${hasSlots ? `loadSlotsForDate('${dateStr}')` : ''}" 
           style="text-align: center; padding: 0.4rem; background: ${bgColor}; color: ${textColor}; border-radius: 4px; font-size: 0.8rem; cursor: ${cursor}; opacity: ${opacity};">
        ${day}
      </div>
    `;
  }
  
  html += '</div>';
  html += '</div>';
  
  container.innerHTML = html;
}

// Load slots for selected date
async function loadSlotsForDate(dateStr) {
  selectedDateForBooking = dateStr;
  
  try {
    const token = localStorage.getItem('token');
    console.log('Loading slots for date:', dateStr, 'Doctor:', selectedDoctorForBooking.id);
    
    const response = await fetch(`${API_URL}/slots/doctor/${selectedDoctorForBooking.id}?date=${dateStr}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });

    console.log('Date-specific slots API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Date slots API error:', errorText);
      throw new Error(`Failed to load slots: ${response.status}`);
    }

    const slots = await response.json();
    console.log('Slots for date:', slots);
    
    displaySlotsForDate(slots, dateStr);
  } catch (error) {
    console.error('Error loading slots for date:', error);
    document.getElementById('slotsContainer').innerHTML = 
      `<div style="grid-column: 1/-1; text-align: center; color: red; padding: 2rem;">
        <p><strong>Failed to load slots</strong></p>
        <p style="font-size: 0.9rem;">Error: ${error.message}</p>
      </div>`;
  }
}


// Display available and booked slots
function displaySlotsForDate(slots, dateStr) {
  const date = new Date(dateStr);
  const displayDate = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  document.getElementById('selectedDateDisplay').textContent = `📅 ${displayDate}`;
  
  const container = document.getElementById('slotsContainer');
  
  if (!slots || slots.length === 0) {
    container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #666; padding: 2rem;">No slots available for this date</div>';
    return;
  }

  // Sort slots by time
  const sortedSlots = [...slots].sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  container.innerHTML = sortedSlots.map(slot => {
    if (!slot.startTime || !slot.endTime) {
      console.warn('Slot missing time data:', slot);
      return '';
    }

    const startTime = new Date(slot.startTime);
    const endTime = new Date(slot.endTime);
    const timeStr = startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const duration = slot.duration || Math.round((endTime - startTime) / (1000 * 60));
    
    if (slot.isBooked) {
      // Booked slot - disabled
      return `
        <div style="padding: 1rem; background: #ffe0e0; border: 2px solid #e74c3c; border-radius: 6px; text-align: center; opacity: 0.6; cursor: not-allowed;">
          <div style="font-weight: 600; color: #666;">🔴 ${timeStr}</div>
          <div style="font-size: 0.75rem; color: #999; margin-top: 0.25rem;">Booked</div>
          <div style="font-size: 0.7rem; color: #999;">${duration} min</div>
        </div>
      `;
    } else {
      // Available slot - clickable
      return `
        <div onclick="selectSlotForBooking(${slot.id}, '${timeStr}')"
             style="padding: 1rem; background: #e8f5e9; border: 2px solid #27ae60; border-radius: 6px; text-align: center; cursor: pointer; transition: all 0.3s;">
          <div style="font-weight: 600; color: #27ae60;">🟢 ${timeStr}</div>
          <div style="font-size: 0.75rem; color: #666; margin-top: 0.25rem;">Available</div>
          <div style="font-size: 0.7rem; color: #666;">${duration} min</div>
        </div>
      `;
    }
  }).filter(html => html).join('');
}


// Select slot for booking
function selectSlotForBooking(slotId, timeStr) {
  selectedSlotForBooking = slotId;
  document.getElementById('selectedSlotInfo').textContent = `${timeStr} on ${selectedDateForBooking}`;
  
  // Highlight selected slot
  document.querySelectorAll('#slotsContainer > div').forEach(el => {
    el.style.border = '2px solid #27ae60';
    el.style.background = '#e8f5e9';
  });
}

// Confirm and book appointment
async function confirmAppointmentBooking() {
  if (!selectedDoctorForBooking || !selectedSlotForBooking) {
    alert('Please select a doctor and time slot');
    return;
  }

  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const mode = document.querySelector('input[name="appointmentMode"]:checked').value;

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/slots/book`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        slotId: selectedSlotForBooking,
        patientId: userData.id,
        doctorId: selectedDoctorForBooking.id,
        mode
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to book appointment');
    }

    const result = await response.json();
    alert(`✅ Appointment booked successfully!\n\nDoctor: Dr. ${selectedDoctorForBooking.name}\nTime: ${document.getElementById('selectedSlotInfo').textContent}\nMode: ${mode}`);
    
    resetBookingForm();
    loadAppointments(); // Refresh appointments list
    showSection('appointments'); // Go to appointments section
  } catch (error) {
    console.error('Error booking appointment:', error);
    alert(`❌ Error: ${error.message}`);
  }
}

// Reset booking form
function resetBookingForm() {
  selectedDoctorForBooking = null;
  selectedSlotForBooking = null;
  selectedDateForBooking = null;
  
  document.getElementById('appointmentBookingContainer').style.display = 'none';
  document.getElementById('selectedDoctorInfo').textContent = 'Select a doctor';
  document.getElementById('selectedSlotInfo').textContent = 'Select a slot';
  document.getElementById('slotsContainer').innerHTML = '';
  document.getElementById('selectedDateDisplay').textContent = '';
}
