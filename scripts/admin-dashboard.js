// Navigation
const navItems = document.querySelectorAll(".nav-item[data-section]");
if (navItems.length > 0) {
  navItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault()
      const section = this.dataset.section
      showSection(section)
    })
  })
}

const API_URL = "http://localhost:5050/api"

// Show/Hide sections when clicking sidebar
function showAdminSection(sectionId) {
  // Hide all sections first
  const sections = document.querySelectorAll('.content-section');
  sections.forEach(section => section.classList.remove('active'));

  // Remove active class from all nav items
  const navItems = document.querySelectorAll('.admin-nav-item');
  navItems.forEach(item => item.classList.remove('active'));

  // Show the selected section
  const activeSection = document.getElementById(sectionId);
  if (activeSection) {
    activeSection.classList.add('active');
  }

  // Set the active nav item
  const navItem = event.target.closest('.admin-nav-item');
  if (navItem) {
    navItem.classList.add('active');
  }

  // Load data for the section
  if (sectionId === 'overview') {
    loadOverviewStats();
  } else if (sectionId === 'users') {
    loadUsers();
  } else if (sectionId === 'doctors') {
    loadDoctors();
  } else if (sectionId === 'appointments') {
    loadAdminAppointments();
  } else if (sectionId === 'slots') {
    loadDoctorsForSlotFilter();
    loadDoctorSlots();
  } else if (sectionId === 'reports') {
    loadPayments();
  }
}

function showSection(section) {
  const navItems = document.querySelectorAll(".nav-item");
  if (navItems.length > 0) {
    navItems.forEach((item) => item.classList.remove("active"));
    const activeNav = document.querySelector(`[data-section="${section}"]`);
    if (activeNav) activeNav.classList.add("active");
  }

  const contentSections = document.querySelectorAll(".content-section");
  if (contentSections.length > 0) {
    contentSections.forEach((sec) => sec.classList.remove("active"));
    const activeSection = document.getElementById(`${section}-section`);
    if (activeSection) activeSection.classList.add("active");
  }

  const titles = {
    dashboard: { title: "Admin Dashboard", subtitle: "System Overview & Management" },
    doctors: { title: "Doctor Management", subtitle: "Verify and manage doctors" },
    patients: { title: "Patient Management", subtitle: "View and manage patients" },
    appointments: { title: "Appointments", subtitle: "Monitor all bookings" },
    payments: { title: "Payments & Reports", subtitle: "Financial tracking" },
    reviews: { title: "Reviews", subtitle: "Patient feedback" },
  }

  const header = titles[section];
  const titleEl = document.getElementById("sectionTitle");
  const subtitleEl = document.getElementById("sectionSubtitle");
  if (titleEl && header) titleEl.textContent = header.title;
  if (subtitleEl && header) subtitleEl.textContent = header.subtitle;
}

// Load doctors
async function loadDoctors() {
  const tbody = document.querySelector("#doctorsTable tbody");
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="7">Loading doctors...</td></tr>'
  const token = localStorage.getItem("token")

  try {
    console.log("Fetching doctors from:", `${API_URL}/admin/doctors`);
    const res = await fetch(`${API_URL}/admin/doctors`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    
    console.log("Doctors API response status:", res.status);
    const doctors = res.ok ? await res.json() : []
    console.log("Doctors received:", doctors.length, doctors);

    const items = Array.isArray(doctors) && doctors.length ? doctors : getDoctorsFallback()
    console.log("Doctors to display:", items.length);

    tbody.innerHTML = items
      .map(
        (doctor) => `
    <tr>
      <td><strong>${doctor.name}</strong></td>
      <td>${doctor.email || ''}</td>
      <td>${doctor.specialty || doctor.specialization || ''}</td>
      <td>${doctor.experience || ''} years</td>
      <td>$${doctor.fees || doctor.fee || ''}</td>
      <td><span class="badge badge-${(doctor.status || '').toLowerCase()}">${doctor.status || ''}</span></td>
      <td>
        ${(doctor.status || '').toUpperCase() === 'PENDING'
          ? `
          <button class="btn btn-primary" style="padding: 0.375rem 0.75rem; font-size: 0.8rem;" onclick="openVerificationModal(${doctor.id})">Review</button>
        `
          : `
          <button class="btn btn-outline" style="padding: 0.375rem 0.75rem; font-size: 0.8rem;" onclick="viewDoctorDetails(${doctor.id})">View</button>
        `}
      </td>
    </tr>
  `,
      )
      .join("")

    const pending = items.filter((d) => (d.status || '').toUpperCase() === 'PENDING')
    const verificationList = document.getElementById("pendingVerifications")
    if (verificationList) {
      verificationList.innerHTML = pending
        .map(
          (doctor) => `
      <div class="verification-item">
        <div class="verification-header">
          <div>
            <h4>${doctor.name}</h4>
            <p style="color: var(--text-secondary); font-size: 0.875rem; margin-top: 0.25rem;">${doctor.specialty || ''} • ${doctor.experience || ''} years experience</p>
          </div>
          <button class="btn btn-primary" onclick="openVerificationModal(${doctor.id})">Review</button>
        </div>
      </div>
    `,
        )
        .join("")
    }
  } catch (err) {
    console.error(err)
    const items = getDoctorsFallback()
    const tbody = document.querySelector("#doctorsTable tbody")
    tbody.innerHTML = items
      .map(
        (doctor) => `
    <tr>
      <td><strong>${doctor.name}</strong></td>
      <td>${doctor.email}</td>
      <td>${doctor.specialty}</td>
      <td>${doctor.experience} years</td>
      <td>$${doctor.fees}</td>
      <td><span class="badge badge-${doctor.status.toLowerCase()}">${doctor.status}</span></td>
      <td>
        ${doctor.status === "PENDING"
          ? `
          <button class="btn btn-primary" style="padding: 0.375rem 0.75rem; font-size: 0.8rem;" onclick="openVerificationModal(${doctor.id})">Review</button>
        `
          : `
          <button class="btn btn-outline" style="padding: 0.375rem 0.75rem; font-size: 0.8rem;" onclick="viewDoctorDetails(${doctor.id})">View</button>
        `}
      </td>
    </tr>
  `,
      )
      .join("")
  }
}

function getDoctorsFallback() {
  return [
    { id: 1, name: "Dr. Sarah Johnson", email: "sarah.j@example.com", specialty: "Cardiology", experience: 15, fees: 100, status: "APPROVED" },
    { id: 2, name: "Dr. Michael Chen", email: "michael.c@example.com", specialty: "General Practice", experience: 10, fees: 75, status: "PENDING" },
  ]
}

// Load patients
async function loadAdminPatients() {
  const tbody = document.querySelector("#adminPatientsTable tbody");
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="7">Loading patients...</td></tr>'
  const token = localStorage.getItem("token")

  try {
    const res = await fetch(`${API_URL}/patients`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    const patients = res.ok ? await res.json() : []

    const items = Array.isArray(patients) && patients.length ? patients : getPatientsFallback()

    tbody.innerHTML = items
      .map(
        (patient) => `
    <tr>
      <td><strong>${patient.name}</strong></td>
      <td>${patient.email || ''}</td>
      <td>${patient.phone || ''}</td>
      <td>${patient.gender || ''}</td>
      <td>${patient.appointments || ''}</td>
      <td>${patient.joined || ''}</td>
      <td>
        <button class="btn btn-outline" style="padding: 0.375rem 0.75rem; font-size: 0.8rem;" onclick="viewPatientDetails(${patient.id})">View</button>
      </td>
    </tr>
  `,
      )
      .join("")
  } catch (err) {
    console.error(err)
    const items = getPatientsFallback()
    const tbody = document.querySelector("#adminPatientsTable tbody")
    tbody.innerHTML = items
      .map(
        (patient) => `
    <tr>
      <td><strong>${patient.name}</strong></td>
      <td>${patient.email}</td>
      <td>${patient.phone}</td>
      <td>${patient.gender}</td>
      <td>${patient.appointments}</td>
      <td>${patient.joined}</td>
      <td>
        <button class="btn btn-outline" style="padding: 0.375rem 0.75rem; font-size: 0.8rem;" onclick="viewPatientDetails(${patient.id})">View</button>
      </td>
    </tr>
  `,
      )
      .join("")
  }
}

function getPatientsFallback() {
  return [
    { id: 1, name: "John Smith", email: "john.s@example.com", phone: "+1234567890", gender: "Male", appointments: 8, joined: "Jan 2025" },
    { id: 2, name: "Emma Wilson", email: "emma.w@example.com", phone: "+1234567891", gender: "Female", appointments: 5, joined: "Feb 2025" },
  ]
}

// Load appointments
async function loadAdminAppointments() {
  const tbody = document.getElementById("appointments-table-body");
  if (!tbody) {
    console.error("Appointments table body not found!");
    return;
  }
  tbody.innerHTML = '<tr><td colspan="8">Loading appointments...</td></tr>'
  const token = localStorage.getItem("token")
  const userData = JSON.parse(localStorage.getItem("userData") || '{}');

  try {
    const url = `${API_URL}/appointments`;
    
    let res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Failed to fetch appointments:', res.status, errorText);
      throw new Error(`Failed to fetch appointments: ${res.status}`);
    }
    
    const appointments = await res.json()

    const items = Array.isArray(appointments) && appointments.length > 0 ? appointments : []

    if (items.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="padding: 20px; text-align: center;">No appointments found</td></tr>';
      return;
    }

    tbody.innerHTML = items
      .map(
        (apt) => {
          // Extract patient and doctor info from nested objects
          const patientName = apt.patient?.name || apt.patientName || `Patient #${apt.patientId}`;
          const doctorName = apt.doctor?.name || apt.doctorName || `Doctor #${apt.doctorId}`;
          
          return `
    <tr>
      <td>#${apt.id}</td>
      <td>${patientName}</td>
      <td>${doctorName}</td>
      <td>${apt.scheduledAt ? new Date(apt.scheduledAt).toLocaleString() : apt.dateTime || 'N/A'}</td>
      <td>${apt.mode || apt.type || 'N/A'}</td>
      <td><span class="badge badge-${(apt.status || '').toLowerCase()}">${apt.status || 'N/A'}</span></td>
      <td><span class="badge badge-${apt.payment === "SUCCESS" || apt.payment === "Paid" ? "completed" : "pending"}">${apt.payment || 'Pending'}</span></td>
      <td style="white-space: nowrap;">
        ${apt.status === 'PENDING' ? `
          <button class="btn" style="padding: 0.375rem 0.75rem; font-size: 0.8rem; margin-right: 0.25rem; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;" onclick="approveAppointment(${apt.id})">Approve</button>
          <button class="btn" style="padding: 0.375rem 0.75rem; font-size: 0.8rem; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;" onclick="rejectAppointment(${apt.id})">Reject</button>
        ` : apt.status === 'CONFIRMED' ? `
          <button class="btn" style="padding: 0.375rem 0.75rem; font-size: 0.8rem; margin-right: 0.25rem; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer;" onclick="completeAppointment(${apt.id})">Mark Complete</button>
          <button class="btn btn-outline" style="padding: 0.375rem 0.75rem; font-size: 0.8rem;" onclick="viewAppointmentDetails(${apt.id})">View</button>
        ` : `
          <button class="btn btn-outline" style="padding: 0.375rem 0.75rem; font-size: 0.8rem;" onclick="viewAppointmentDetails(${apt.id})">View</button>
        `}
      </td>
    </tr>
  `;
        }
      )
      .join("")

    const recentList = document.getElementById("recentAppointments")
    if (recentList) {
      recentList.innerHTML = items
        .slice(0, 5)
        .map(
          (apt) => `
      <tr>
        <td>${apt.patientName || apt.patient}</td>
        <td>${apt.doctorName || apt.doctor}</td>
        <td>${apt.scheduledAt ? (new Date(apt.scheduledAt)).toLocaleDateString() : (apt.dateTime || '').split(' - ')[0]}</td>
        <td><span class="badge badge-${(apt.status || '').toLowerCase()}">${apt.status || ''}</span></td>
      </tr>
    `,
        )
        .join("")
    }
  } catch (err) {
    console.error('Error in loadAdminAppointments:', err)
    tbody.innerHTML = '<tr><td colspan="8" style="padding: 20px; text-align: center; color: red;">Error loading appointments. Check console for details.</td></tr>';
  }
}

function getAdminAppointmentsFallback() {
  return [
    { id: 1, patient: "John Smith", doctor: "Dr. Sarah Johnson", dateTime: "Jan 6, 2026 - 10:00 AM", type: "In-Person", status: "confirmed", payment: "SUCCESS" },
    { id: 2, patient: "Emma Wilson", doctor: "Dr. Michael Chen", dateTime: "Jan 8, 2026 - 2:30 PM", type: "Online", status: "pending", payment: "PENDING" },
  ]
}

// Load payments
async function loadPayments() {
  const tbody = document.querySelector("#paymentsTable tbody");
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="8">Loading payments...</td></tr>'
  const token = localStorage.getItem("token")

  try {
    let res = await fetch(`${API_URL}/payments`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
    const payments = res.ok ? await res.json() : []

    const items = Array.isArray(payments) && payments.length ? payments : getPaymentsFallback()

    tbody.innerHTML = items
      .map(
        (payment) => `
    <tr>
      <td><strong>${payment.id}</strong></td>
      <td>#${payment.appointmentId || ''}</td>
      <td>${payment.patient || ''}</td>
      <td>${payment.doctor || ''}</td>
      <td>$${payment.amount || ''}</td>
      <td>${payment.method || ''}</td>
      <td><span class="badge badge-${(payment.status || '').toLowerCase() === 'success' ? 'completed' : 'pending'}">${payment.status || ''}</span></td>
      <td>${payment.date || ''}</td>
    </tr>
  `,
      )
      .join("")
  } catch (err) {
    console.error(err)
    const items = getPaymentsFallback()
    const tbody = document.querySelector("#paymentsTable tbody")
    tbody.innerHTML = items
      .map(
        (payment) => `
    <tr>
      <td><strong>${payment.id}</strong></td>
      <td>#${payment.appointmentId}</td>
      <td>${payment.patient}</td>
      <td>${payment.doctor}</td>
      <td>$${payment.amount}</td>
      <td>${payment.method}</td>
      <td><span class="badge badge-${payment.status === "SUCCESS" ? "completed" : "pending"}">${payment.status}</span></td>
      <td>${payment.date}</td>
    </tr>
  `,
      )
      .join("")
  }
}

function getPaymentsFallback() {
  return [
    { id: "TXN001", appointmentId: 1, patient: "John Smith", doctor: "Dr. Sarah Johnson", amount: 100, method: "ESEWA", status: "SUCCESS", date: "Jan 5, 2026" },
  ]
}

// Load reviews
async function loadReviews() {
  const list = document.getElementById("reviewsList");
  if (!list) return;
  list.innerHTML = '<div>Loading reviews...</div>'
  const token = localStorage.getItem("token")

  try {
    const res = await fetch(`${API_URL}/reviews`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
    const reviews = res.ok ? await res.json() : []

    const items = Array.isArray(reviews) && reviews.length ? reviews : getReviewsFallback()

    list.innerHTML = items
      .map(
        (review) => `
    <div class="review-item">
      <div class="review-header">
        <div>
          <h4>${review.patient}</h4>
          <p style="color: var(--text-secondary); font-size: 0.875rem;">for ${review.doctor}</p>
          <div class="rating" style="margin-top: 0.5rem;">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
        </div>
        <span style="color: var(--text-tertiary); font-size: 0.875rem;">${review.date}</span>
      </div>
      <p style="margin-top: 0.75rem; color: var(--text-secondary);">${review.comment}</p>
    </div>
  `,
      )
      .join("")
  } catch (err) {
    console.error(err)
    const items = getReviewsFallback()
    const list = document.getElementById("reviewsList")
    list.innerHTML = items
      .map(
        (review) => `
    <div class="review-item">
      <div class="review-header">
        <div>
          <h4>${review.patient}</h4>
          <p style="color: var(--text-secondary); font-size: 0.875rem;">for ${review.doctor}</p>
          <div class="rating" style="margin-top: 0.5rem;">${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}</div>
        </div>
        <span style="color: var(--text-tertiary); font-size: 0.875rem;">${review.date}</span>
      </div>
      <p style="margin-top: 0.75rem; color: var(--text-secondary);">${review.comment}</p>
    </div>
  `,
      )
      .join("")
  }
}

function getReviewsFallback() {
  return [
    { id: 1, patient: "John Smith", doctor: "Dr. Sarah Johnson", rating: 5, comment: "Excellent doctor, very professional and caring.", date: "Dec 29, 2025" },
  ]
}

let currentDoctorId = null

function openVerificationModal(doctorId) {
  currentDoctorId = doctorId
  const modal = document.getElementById("verificationModal")
  const modalBody = document.getElementById("verificationModalBody")
  const modalActions = document.getElementById("verificationModalActions")

  // Fetch doctor details and display
  const token = localStorage.getItem("token");
  fetch(`${API_URL}/doctors/${doctorId}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  .then(res => res.json())
  .then(doctor => {
    modalBody.innerHTML = `
      <div style="display: grid; gap: 1rem;">
        <div>
          <strong>Name:</strong> ${doctor.name || 'N/A'}
        </div>
        <div>
          <strong>Email:</strong> ${doctor.email || 'N/A'}
        </div>
        <div>
          <strong>Specialization:</strong> ${doctor.specialty || doctor.specialization || 'N/A'}
        </div>
        <div>
          <strong>Experience:</strong> ${doctor.experience || 'N/A'} years
        </div>
        <div>
          <strong>Fees:</strong> ₨${doctor.fees || doctor.fee || 'N/A'}
        </div>
        <div>
          <strong>Phone:</strong> ${doctor.phoneNumber && doctor.phoneNumber.length > 0 ? doctor.phoneNumber.join(', ') : 'N/A'}
        </div>
        <div style="margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 6px;">
          <strong>Status:</strong> <span class="badge badge-${(doctor.status || '').toLowerCase()}" style="padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.875rem;">${doctor.status || 'PENDING'}</span>
        </div>
      </div>
    `;

    // Show/hide action buttons based on doctor status
    if (doctor.status && doctor.status.toUpperCase() !== 'PENDING') {
      modalActions.style.display = 'none';
    } else {
      modalActions.style.display = 'flex';
    }
  })
  .catch(err => {
    console.error('Error fetching doctor details:', err);
    modalBody.innerHTML = '<p style="color: red;">Failed to load doctor details</p>';
    modalActions.style.display = 'none';
  });

  modal.style.display = "flex";
}


function closeVerificationModal() {
  const modal = document.getElementById("verificationModal");
  if (modal) {
    modal.style.display = "none";
  }
  currentDoctorId = null
}

async function approveDoctor() {
  if (!currentDoctorId) {
    alert("No doctor selected");
    return;
  }
  
  try {
    const token = localStorage.getItem("token");
    
    if (!token) {
      alert("You are not logged in. Please login as admin.");
      return;
    }
    
    console.log("Approving doctor ID:", currentDoctorId);
    console.log("API URL:", `${API_URL}/admin/doctors/${currentDoctorId}/verify`);
    
    const response = await fetch(`${API_URL}/admin/doctors/${currentDoctorId}/verify`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status: "APPROVED" })
    });
    
    const data = await response.json();
    console.log("Response:", response.status, data);
    
    if (!response.ok) {
      alert(data.message || `Failed to approve doctor. Status: ${response.status}`);
      return;
    }
    
    alert("Doctor approved successfully!");
    closeVerificationModal();
    loadDoctors();
  } catch (error) {
    console.error("Error approving doctor:", error);
    alert(`Failed to approve doctor: ${error.message}`);
  }
}

async function rejectDoctor() {
  if (!currentDoctorId) {
    alert("No doctor selected");
    return;
  }
  
  if (!confirm("Are you sure you want to reject this doctor?")) {
    return;
  }
  
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/admin/doctors/${currentDoctorId}/verify`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status: "REJECTED" })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      alert(data.message || "Failed to reject doctor");
      return;
    }
    
    alert("Doctor rejected.");
    closeVerificationModal();
    loadDoctors();
  } catch (error) {
    console.error("Error rejecting doctor:", error);
    alert("Failed to reject doctor. Please try again.");
  }
}

function filterDoctors(status) {
  document.querySelectorAll(".tab").forEach((tab) => tab.classList.remove("active"))
  event.target.classList.add("active")
  loadDoctors()
}

function filterAdminAppointments(status) {
  loadAdminAppointments()
}

function filterByDate(date) {
  loadAdminAppointments()
}

function viewDoctorDetails(id) {
  currentDoctorId = id;
  const modal = document.getElementById("verificationModal");
  const modalBody = document.getElementById("verificationModalBody");
  const modalActions = document.getElementById("verificationModalActions");

  // Fetch doctor details
  const token = localStorage.getItem("token");
  fetch(`${API_URL}/doctors/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  .then(res => res.json())
  .then(doctor => {
    // Fetch available slots
    return fetch(`${API_URL}/doctors/${id}/slots`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(slotsRes => slotsRes.json())
    .then(slots => ({ doctor, slots }))
    .catch(() => ({ doctor, slots: [] }));
  })
  .then(({ doctor, slots }) => {
    const availableSlots = Array.isArray(slots) ? slots.filter(s => !s.isBooked) : [];
    const bookedSlots = Array.isArray(slots) ? slots.filter(s => s.isBooked) : [];
    
    modalBody.innerHTML = `
      <div style="display: grid; gap: 1rem;">
        <div>
          <strong>Name:</strong> ${doctor.name || 'N/A'}
        </div>
        <div>
          <strong>Email:</strong> ${doctor.email || 'N/A'}
        </div>
        <div>
          <strong>Status:</strong> <span class="badge badge-${(doctor.status || '').toLowerCase()}" style="padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.875rem;">${doctor.status || 'N/A'}</span>
        </div>
        <div>
          <strong>Specialization:</strong> ${doctor.specialty || doctor.specialization || 'N/A'}
        </div>
        <div>
          <strong>Experience:</strong> ${doctor.experience || 'N/A'} years
        </div>
        <div>
          <strong>Fees:</strong> ₨${doctor.fees || doctor.fee || 'N/A'}
        </div>
        <div>
          <strong>Phone:</strong> ${doctor.phoneNumber && doctor.phoneNumber.length > 0 ? doctor.phoneNumber.join(', ') : 'N/A'}
        </div>
        <div>
          <strong>Rating:</strong> ${doctor.ratings || 'No ratings yet'}
        </div>
        
        <!-- Availability Section -->
        <div style="margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px;">
          <h4 style="margin: 0 0 0.75rem 0; color: #2d3748;">📅 Availability & Slots</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
            <div style="text-align: center; padding: 0.75rem; background: white; border-radius: 6px;">
              <div style="font-size: 1.5rem; font-weight: bold; color: #3498db;">${slots.length || 0}</div>
              <div style="font-size: 0.875rem; color: #666;">Total Slots</div>
            </div>
            <div style="text-align: center; padding: 0.75rem; background: white; border-radius: 6px;">
              <div style="font-size: 1.5rem; font-weight: bold; color: #2ecc71;">${availableSlots.length}</div>
              <div style="font-size: 0.875rem; color: #666;">Available</div>
            </div>
            <div style="text-align: center; padding: 0.75rem; background: white; border-radius: 6px;">
              <div style="font-size: 1.5rem; font-weight: bold; color: #e74c3c;">${bookedSlots.length}</div>
              <div style="font-size: 0.875rem; color: #666;">Booked</div>
            </div>
          </div>
          
          ${availableSlots.length > 0 ? `
            <div style="max-height: 200px; overflow-y: auto;">
              <strong style="display: block; margin-bottom: 0.5rem;">Next Available Slots:</strong>
              ${availableSlots.slice(0, 5).map(slot => {
                const startTime = new Date(slot.startTime);
                return `
                  <div style="padding: 0.5rem; margin-bottom: 0.5rem; background: white; border-left: 3px solid #2ecc71; border-radius: 4px;">
                    <span style="font-weight: 600;">${startTime.toLocaleDateString()}</span> - 
                    <span style="color: #666;">${startTime.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</span>
                  </div>
                `;
              }).join('')}
              ${availableSlots.length > 5 ? `<div style="text-align: center; margin-top: 0.5rem; color: #666; font-size: 0.875rem;">+${availableSlots.length - 5} more slots</div>` : ''}
            </div>
          ` : '<p style="color: #999; margin: 0;">No available slots</p>'}
        </div>
      </div>
    `;
    
    // Hide action buttons when viewing non-pending doctors
    if (doctor.status && doctor.status.toUpperCase() !== 'PENDING') {
      modalActions.style.display = 'none';
    } else {
      modalActions.style.display = 'flex';
    }
  })
  .catch(err => {
    console.error('Error fetching doctor details:', err);
    modalBody.innerHTML = '<p style="color: red;">Failed to load doctor details</p>';
    modalActions.style.display = 'none';
  });

  modal.style.display = "flex";
}

function viewPatientDetails(id) {
  alert("Opening patient details...")
}

function viewAppointmentDetails(id) {
  alert("Opening appointment details...")
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("userData");
  window.location.href = "login.html";
}

// Admin Dashboard JavaScript

const manageUsersBtn = document.getElementById('manage-users');
if (manageUsersBtn) {
  manageUsersBtn.addEventListener('click', async () => {
    try {
        // Show users section, hide others
        document.getElementById('users-section').style.display = 'block';
        document.getElementById('doctors-section').style.display = 'none';
        document.getElementById('appointments-section').style.display = 'none';
        document.getElementById('reports-section').style.display = 'none';
        
        const tbody = document.getElementById('users-table-body');
        tbody.innerHTML = '<tr><td colspan="7" style="padding: 20px; text-align: center;">Loading users...</td></tr>';
        
        const response = await fetch(`${API_URL}/users`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }
        
        const users = await response.json();
        console.log('Users:', users);
        
        if (!Array.isArray(users) || users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="padding: 20px; text-align: center;">No users found</td></tr>';
            return;
        }
        
        tbody.innerHTML = users.map(user => `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 12px;">${user.id}</td>
                <td style="padding: 12px;"><strong>${user.name}</strong></td>
                <td style="padding: 12px;">${user.email}</td>
                <td style="padding: 12px;">
                    <span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; 
                        background-color: ${user.role === 'ADMIN' ? '#ff6b6b' : user.role === 'DOCTOR' ? '#4ecdc4' : '#95e1d3'}; 
                        color: white;">
                        ${user.role || 'N/A'}
                    </span>
                </td>
                <td style="padding: 12px;">${user.phoneNumber && user.phoneNumber.length > 0 ? user.phoneNumber.join(', ') : 'N/A'}</td>
                <td style="padding: 12px;">
                    <span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;
                        background-color: ${user.status === 'APPROVED' ? '#51cf66' : user.status === 'PENDING' ? '#ffd43b' : '#ff6b6b'};
                        color: ${user.status === 'PENDING' ? '#000' : '#fff'};">
                        ${user.status || 'ACTIVE'}
                    </span>
                </td>
                <td style="padding: 12px;">${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
            </tr>
        `).join('');
        
        alert(`Loaded ${users.length} users successfully!`);
    } catch (error) {
        console.error('Error fetching users:', error);
        const tbody = document.getElementById('users-table-body');
        tbody.innerHTML = '<tr><td colspan="7" style="padding: 20px; text-align: center; color: red;">Failed to load users</td></tr>';
        alert('Failed to fetch users. Please check console for details.');
    }
  });
}

const manageDoctorsBtn = document.getElementById('manage-doctors');
if (manageDoctorsBtn) {
  manageDoctorsBtn.addEventListener('click', async () => {
    // Show doctors section, hide others
    document.getElementById('users-section').style.display = 'none';
    document.getElementById('doctors-section').style.display = 'block';
    document.getElementById('appointments-section').style.display = 'none';
    document.getElementById('reports-section').style.display = 'none';
    
    // Load doctors with approve functionality
    await loadDoctors();
  });
}

const viewAppointmentsBtn = document.getElementById('view-appointments');
if (viewAppointmentsBtn) {
  viewAppointmentsBtn.addEventListener('click', async () => {
    // Show appointments section
    document.getElementById('users-section').style.display = 'none';
    document.getElementById('doctors-section').style.display = 'none';
    document.getElementById('appointments-section').style.display = 'block';
    document.getElementById('reports-section').style.display = 'none';
    const slotsSection = document.getElementById('slots-section');
    if (slotsSection) slotsSection.style.display = 'none';
    
    // Call the proper function that includes approve/reject buttons
    await loadAdminAppointments();
  });
}

const generateReportsBtn = document.getElementById('generate-reports');
if (generateReportsBtn) {
  generateReportsBtn.addEventListener('click', async () => {
    try {
        // Show reports section
        document.getElementById('users-section').style.display = 'none';
        document.getElementById('appointments-section').style.display = 'none';
        document.getElementById('reports-section').style.display = 'block';
        document.getElementById('doctors-section').style.display = 'none';
        const slotsSection = document.getElementById('slots-section');
        if (slotsSection) slotsSection.style.display = 'none';
        
        const tbody = document.getElementById('reports-table-body');
        tbody.innerHTML = '<tr><td colspan="6" style="padding: 20px; text-align: center;">Loading payment reports...</td></tr>';
        
        const response = await fetch(`${API_URL}/admin/payments`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch payment reports');
        }
        
        const reports = await response.json();
        console.log('Reports:', reports);
        
        if (!Array.isArray(reports) || reports.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="padding: 20px; text-align: center;">No payment reports found</td></tr>';
            return;
        }
        
        tbody.innerHTML = reports.map(payment => `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 12px;">${payment.id}</td>
                <td style="padding: 12px;">${payment.appointmentId || 'N/A'}</td>
                <td style="padding: 12px;"><strong>$${payment.amount || 0}</strong></td>
                <td style="padding: 12px;">
                    <span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;
                        background-color: ${payment.status === 'SUCCESS' ? '#51cf66' : payment.status === 'PENDING' ? '#ffd43b' : '#ff6b6b'};
                        color: ${payment.status === 'PENDING' ? '#000' : '#fff'};">
                        ${payment.status || 'N/A'}
                    </span>
                </td>
                <td style="padding: 12px;">${payment.method || 'N/A'}</td>
                <td style="padding: 12px;">${payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : 'N/A'}</td>
            </tr>
        `).join('');
        
        alert(`Loaded ${reports.length} payment reports successfully!`);
    } catch (error) {
        console.error('Error generating reports:', error);
        const tbody = document.getElementById('reports-table-body');
        tbody.innerHTML = '<tr><td colspan="6" style="padding: 20px; text-align: center; color: red;">Failed to load payment reports</td></tr>';
        alert('Failed to generate reports. Please check console for details.');
    }
  });
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  
  // Check if user is logged in and is admin
  if (!userData || userData.role !== 'ADMIN') {
    // Redirect to login if not admin
    window.location.href = 'login.html';
    return;
  }
  
  if (userData && userData.name) {
    const adminNameEl = document.getElementById("adminName");
    if (adminNameEl) {
      adminNameEl.textContent = userData.name || "Admin";
    }
  }

  // Load overview stats first
  loadOverviewStats();
})

// Login function with role-based redirection
async function login(email, password) {
  try {
    const response = await fetch(`${API_URL}/users/login`, { // Updated endpoint path
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error("Invalid credentials");
    }

    const data = await response.json();

    // Store token and user data in localStorage
    localStorage.setItem("token", data.token);
    localStorage.setItem("userData", JSON.stringify(data.user));

    // Redirect based on role
    if (data.user.role === "ADMIN") {
      window.location.href = "admin-dashboard.html";
    } else if (data.user.role === "PATIENT") {
      window.location.href = "patient-dashboard.html";
    } else {
      alert("Unknown role. Please contact support.");
    }
  } catch (error) {
    console.error("Login failed:", error);
    alert("Login failed. Please check your credentials.");
  }
}

// Approve appointment
async function approveAppointment(appointmentId) {
  if (!confirm('Are you sure you want to approve this appointment?')) {
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
      body: JSON.stringify({ status: 'CONFIRMED' })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to approve appointment');
    }

    alert('Appointment approved successfully!');
    loadAdminAppointments(); // Reload the appointments list
  } catch (error) {
    console.error('Error approving appointment:', error);
    alert(`Failed to approve appointment: ${error.message}`);
  }
}

// Reject appointment
async function rejectAppointment(appointmentId) {
  if (!confirm('Are you sure you want to reject this appointment?')) {
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
      body: JSON.stringify({ status: 'REJECTED' })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to reject appointment');
    }

    alert('Appointment rejected successfully!');
    loadAdminAppointments(); // Reload the appointments list
  } catch (error) {
    console.error('Error rejecting appointment:', error);
    alert(`Failed to reject appointment: ${error.message}`);
  }
}

// Complete appointment
async function completeAppointment(appointmentId) {
  if (!confirm('Mark this appointment as completed?')) {
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
      const error = await response.json();
      throw new Error(error.message || 'Failed to complete appointment');
    }

    alert('Appointment marked as completed successfully!');
    loadAdminAppointments(); // Reload the appointments list
  } catch (error) {
    console.error('Error completing appointment:', error);
    alert(`Failed to complete appointment: ${error.message}`);
  }
}

// View appointment details
function viewAppointmentDetails(appointmentId) {
  alert(`Viewing details for appointment #${appointmentId}\n\nThis feature can be enhanced with a modal showing full appointment details.`);
}

// Logout function
function adminLogout() {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    window.location.href = 'login.html';
  }
}

// Load users from API
async function loadUsers() {
  const tbody = document.getElementById('users-table-body');
  if (!tbody) return;
  
  tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">Loading users...</td></tr>';
  const token = localStorage.getItem('token');

  try {
    const res = await fetch(`${API_URL}/users`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    
    const users = res.ok ? await res.json() : [];
    
    if (!Array.isArray(users) || users.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">No users found</td></tr>';
      return;
    }

    tbody.innerHTML = users.map(user => `
      <tr>
        <td>${user.id}</td>
        <td><strong>${user.name || user.fullName || 'N/A'}</strong></td>
        <td>${user.email || 'N/A'}</td>
        <td><span class="badge" style="background: ${user.role === 'ADMIN' ? '#667eea' : user.role === 'DOCTOR' ? '#4ecdc4' : '#95e1d3'}; color: white; padding: 0.25rem 0.75rem; border-radius: 12px;">${user.role || 'PATIENT'}</span></td>
        <td>${user.phoneNumber && Array.isArray(user.phoneNumber) ? user.phoneNumber.join(', ') : (user.phoneNumber || 'N/A')}</td>
        <td>${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Error loading users:', err);
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: red;">Error loading users</td></tr>';
  }
}

// Load overview stats
async function loadOverviewStats() {
  const token = localStorage.getItem('token');
  
  try {
    // Fetch all data in parallel
    const [usersRes, doctorsRes, appointmentsRes, paymentsRes] = await Promise.all([
      fetch(`${API_URL}/users`, { headers: token ? { Authorization: `Bearer ${token}` } : {} }),
      fetch(`${API_URL}/admin/doctors`, { headers: token ? { Authorization: `Bearer ${token}` } : {} }),
      fetch(`${API_URL}/appointments`, { headers: token ? { Authorization: `Bearer ${token}` } : {} }),
      fetch(`${API_URL}/admin/payments`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
    ]);

    const users = usersRes.ok ? await usersRes.json() : [];
    const doctors = doctorsRes.ok ? await doctorsRes.json() : [];
    const appointments = appointmentsRes.ok ? await appointmentsRes.json() : [];
    const payments = paymentsRes.ok ? await paymentsRes.json() : [];

    // Update stats
    const totalUsersEl = document.getElementById('totalUsers');
    const totalDoctorsEl = document.getElementById('totalDoctors');
    const totalAppointmentsEl = document.getElementById('totalAppointments');
    const totalRevenueEl = document.getElementById('totalRevenue');

    if (totalUsersEl) totalUsersEl.textContent = Array.isArray(users) ? users.length : 0;
    if (totalDoctorsEl) totalDoctorsEl.textContent = Array.isArray(doctors) ? doctors.length : 0;
    if (totalAppointmentsEl) totalAppointmentsEl.textContent = Array.isArray(appointments) ? appointments.length : 0;
    
    // Calculate total revenue
    if (Array.isArray(payments)) {
      const totalRevenue = payments.reduce((sum, payment) => {
        const amount = typeof payment.amount === 'number' ? payment.amount : parseFloat(payment.amount) || 0;
        return sum + amount;
      }, 0);
      if (totalRevenueEl) totalRevenueEl.textContent = `₨${totalRevenue.toLocaleString()}`;
    } else if (totalRevenueEl) {
      totalRevenueEl.textContent = '₨0';
    }
  } catch (err) {
    console.error('Error loading stats:', err);
  }
}

// ==================== APPOINTMENT SLOTS MANAGEMENT ====================

const manageSlotsBtn = document.getElementById('manage-slots');
if (manageSlotsBtn) {
  manageSlotsBtn.addEventListener('click', async () => {
    // Show slots section, hide others
    document.getElementById('users-section').style.display = 'none';
    document.getElementById('doctors-section').style.display = 'none';
    document.getElementById('appointments-section').style.display = 'none';
    document.getElementById('reports-section').style.display = 'none';
    document.getElementById('slots-section').style.display = 'block';
    
    // Load doctors for filter dropdown
    await loadDoctorsForFilter();
    
    // Load slots
    await loadSlots();
  });
}

async function loadDoctorsForFilter() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/admin/doctors`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!response.ok) throw new Error('Failed to load doctors');
    
    const doctors = await response.json();
    const select = document.getElementById('filterDoctor');
    
    // Clear existing options except "All Doctors"
    select.innerHTML = '<option value="">All Doctors</option>';
    
    // Add doctor options
    doctors.forEach(doctor => {
      const option = document.createElement('option');
      option.value = doctor.id;
      option.textContent = `Dr. ${doctor.name}`;
      select.appendChild(option);
    });
    
  } catch (error) {
    console.error('Error loading doctors for filter:', error);
  }
}

async function loadSlots() {
  try {
    const token = localStorage.getItem('token');
    const tbody = document.getElementById('slots-table-body');
    tbody.innerHTML = '<tr><td colspan="9" style="padding: 20px; text-align: center;">Loading slots...</td></tr>';
    
    // Get filter values
    const doctorId = document.getElementById('filterDoctor').value;
    const date = document.getElementById('filterDate').value;
    const status = document.getElementById('filterStatus').value;
    
    // Build query params
    let url = `${API_URL}/admin/slots?`;
    if (doctorId) url += `doctorId=${doctorId}&`;
    if (date) url += `date=${date}&`;
    if (status) url += `status=${status}&`;
    
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!response.ok) throw new Error('Failed to load slots');
    
    const data = await response.json();
    const slots = data.slots || data;
    
    console.log('Loaded slots:', slots);
    
    // Update statistics
    const total = slots.length;
    const available = slots.filter(s => !s.isBooked).length;
    const booked = slots.filter(s => s.isBooked).length;
    const uniqueDoctors = new Set(slots.map(s => s.doctorId)).size;
    
    document.getElementById('totalSlots').textContent = total;
    document.getElementById('availableSlots').textContent = available;
    document.getElementById('bookedSlots').textContent = booked;
    document.getElementById('activeDoctors').textContent = uniqueDoctors;
    
    // Populate table
    if (slots.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" style="padding: 20px; text-align: center;">No slots found</td></tr>';
      return;
    }
    
    tbody.innerHTML = slots.map(slot => {
      const startDate = new Date(slot.startTime);
      const endDate = new Date(slot.endTime);
      const duration = Math.round((endDate - startDate) / (1000 * 60)); // minutes
      
      const statusBadge = slot.isBooked 
        ? '<span style="padding: 4px 12px; background: #fee; color: #c33; border-radius: 12px; font-size: 0.875rem;">Booked</span>'
        : '<span style="padding: 4px 12px; background: #efe; color: #3c3; border-radius: 12px; font-size: 0.875rem;">Available</span>';
      
      const doctorName = slot.doctor?.name || `Doctor ID ${slot.doctorId}`;
      const patientInfo = slot.appointment?.patient?.name || (slot.isBooked ? 'Booked' : '-');
      
      return `
        <tr style="border-bottom: 1px solid #e0e0e0;">
          <td style="padding: 12px;">#${slot.id}</td>
          <td style="padding: 12px;">Dr. ${doctorName}</td>
          <td style="padding: 12px;">${startDate.toLocaleDateString()}</td>
          <td style="padding: 12px;">${startDate.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</td>
          <td style="padding: 12px;">${endDate.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</td>
          <td style="padding: 12px;">${duration} min</td>
          <td style="padding: 12px;">${statusBadge}</td>
          <td style="padding: 12px;">${patientInfo}</td>
          <td style="padding: 12px;">
            ${slot.isBooked 
              ? `<button onclick="viewSlotDetails(${slot.id})" style="padding: 6px 12px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.875rem;">View</button>`
              : `<button onclick="deleteSlot(${slot.id})" style="padding: 6px 12px; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.875rem;">Delete</button>`
            }
          </td>
        </tr>
      `;
    }).join('');
    
  } catch (error) {
    console.error('Error loading slots:', error);
    const tbody = document.getElementById('slots-table-body');
    tbody.innerHTML = `<tr><td colspan="9" style="padding: 20px; text-align: center; color: #e74c3c;">Error: ${error.message}</td></tr>`;
  }
}

function resetSlotFilters() {
  document.getElementById('filterDoctor').value = '';
  document.getElementById('filterDate').value = '';
  document.getElementById('filterStatus').value = '';
  loadSlots();
}

async function deleteSlot(slotId) {
  if (!confirm('Are you sure you want to delete this slot? This action cannot be undone.')) {
    return;
  }
  
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/admin/slots/${slotId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete slot');
    }
    
    alert('✅ Slot deleted successfully!');
    loadSlots(); // Reload slots
    
  } catch (error) {
    console.error('Error deleting slot:', error);
    alert('❌ Error: ' + error.message);
  }
}

function viewSlotDetails(slotId) {
  alert(`Viewing details for slot #${slotId}\n\nThis feature shows the appointment details associated with this slot.`);
}

// ==================== CREATE SLOTS ====================

function showCreateSlotModal() {
  const modal = document.createElement('div');
  modal.id = 'createSlotModal';
  modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:1000;display:flex;align-items:center;justify-content:center;';
  
  modal.innerHTML = `
    <div style="background:white;padding:2rem;border-radius:12px;max-width:500px;width:90%;">
      <h2 style="margin-top:0;">Create New Time Slots</h2>
      
      <form id="createSlotForm" onsubmit="createSlots(event)">
        <div style="margin-bottom:1rem;">
          <label style="display:block;margin-bottom:0.5rem;font-weight:600;">Select Doctor*</label>
          <select id="slotDoctorId" required style="width:100%;padding:0.75rem;border:1px solid #ddd;border-radius:6px;font-size:14px;">
            <option value="">Loading doctors...</option>
          </select>
        </div>
        
        <div style="margin-bottom:1rem;">
          <label style="display:block;margin-bottom:0.5rem;font-weight:600;">Date*</label>
          <input type="date" id="slotDate" required min="${new Date().toISOString().split('T')[0]}" style="width:100%;padding:0.75rem;border:1px solid #ddd;border-radius:6px;font-size:14px;">
        </div>
        
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem;">
          <div>
            <label style="display:block;margin-bottom:0.5rem;font-weight:600;">Start Time*</label>
            <input type="time" id="slotStartTime" required value="09:00" style="width:100%;padding:0.75rem;border:1px solid #ddd;border-radius:6px;font-size:14px;">
          </div>
          <div>
            <label style="display:block;margin-bottom:0.5rem;font-weight:600;">End Time*</label>
            <input type="time" id="slotEndTime" required value="17:00" style="width:100%;padding:0.75rem;border:1px solid #ddd;border-radius:6px;font-size:14px;">
          </div>
        </div>
        
        <div style="margin-bottom:1.5rem;">
          <label style="display:block;margin-bottom:0.5rem;font-weight:600;">Slot Duration (minutes)*</label>
          <select id="slotDuration" required style="width:100%;padding:0.75rem;border:1px solid #ddd;border-radius:6px;font-size:14px;">
            <option value="30">30 minutes</option>
            <option value="60" selected>60 minutes (1 hour)</option>
            <option value="90">90 minutes</option>
            <option value="120">120 minutes (2 hours)</option>
          </select>
        </div>
        
        <div style="display:flex;gap:1rem;">
          <button type="submit" style="flex:1;padding:0.75rem;background:#27ae60;color:white;border:none;border-radius:6px;font-weight:600;cursor:pointer;">Create Slots</button>
          <button type="button" onclick="closeCreateSlotModal()" style="flex:1;padding:0.75rem;background:#95a5a6;color:white;border:none;border-radius:6px;font-weight:600;cursor:pointer;">Cancel</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  loadDoctorsForSlots();
}

function closeCreateSlotModal() {
  const modal = document.getElementById('createSlotModal');
  if (modal) modal.remove();
}

async function loadDoctorsForSlots() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/public/doctors`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) throw new Error('Failed to load doctors');
    
    const doctors = await response.json();
    // Data from /public/doctors is already filtered to APPROVED doctors only
    
    const select = document.getElementById('slotDoctorId');
    select.innerHTML = '<option value="">-- Select a doctor --</option>' + 
      doctors.map(d => `<option value="${d.userId}">${d.name} (${d.specialty})</option>`).join('');
      
  } catch (error) {
    console.error('Error loading doctors:', error);
    alert('Failed to load doctors');
  }
}

async function createSlots(event) {
  event.preventDefault();
  
  const doctorId = document.getElementById('slotDoctorId').value;
  const date = document.getElementById('slotDate').value;
  const startTime = document.getElementById('slotStartTime').value;
  const endTime = document.getElementById('slotEndTime').value;
  const duration = document.getElementById('slotDuration').value;
  
  if (!doctorId || !date || !startTime || !endTime) {
    alert('Please fill all required fields');
    return;
  }
  
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/admin/slots`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        doctorId: parseInt(doctorId),
        date,
        startTime,
        endTime,
        duration: parseInt(duration)
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create slots');
    }
    
    const result = await response.json();
    alert(`✅ Success!\n\n${result.message}`);
    closeCreateSlotModal();
    loadSlots(); // Reload the slots table
    
  } catch (error) {
    console.error('Error creating slots:', error);
    alert('❌ Error: ' + error.message);
  }
}

// ==================== APPOINTMENT REMINDERS ====================

const sendRemindersBtn = document.getElementById('send-reminders');
if (sendRemindersBtn) {
  sendRemindersBtn.addEventListener('click', async () => {
    if (!confirm('Send appointment reminders to all patients with appointments in the next 24 hours?\n\nThis will send email notifications to patients.')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/reminders/send-upcoming`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send reminders');
      }
      
      const result = await response.json();
      alert(`✅ Success!\n\n${result.message}\n\nReminders have been sent to patients with upcoming appointments.`);
      
    } catch (error) {
      console.error('Error sending reminders:', error);
      alert('❌ Error: ' + error.message);
    }
  });
}

// ==================== DOCTOR APPOINTMENT SLOTS ====================

async function loadDoctorsForSlotFilter() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/admin/doctors`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!response.ok) throw new Error('Failed to load doctors');
    
    const doctors = await response.json();
    const select = document.getElementById('filterDoctorSlots');
    
    select.innerHTML = '<option value="">-- All Doctors --</option>';
    doctors.forEach(doctor => {
      const option = document.createElement('option');
      option.value = doctor.id;
      option.textContent = `Dr. ${doctor.name} (${doctor.specialty || 'N/A'})`;
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Error loading doctors for slots:', error);
  }
}

async function loadDoctorSlots() {
  try {
    const token = localStorage.getItem('token');
    const doctorId = document.getElementById('filterDoctorSlots').value;
    const date = document.getElementById('filterDateSlots').value;
    
    const tbody = document.getElementById('slots-table-body');
    tbody.innerHTML = '<tr><td colspan="8" style="padding: 20px; text-align: center;">Loading slots...</td></tr>';
    
    let url = `${API_URL}/slots/doctor/${doctorId || 'all'}`;
    if (doctorId && date) {
      url = `${API_URL}/slots/doctor/${doctorId}?date=${date}`;
    } else if (doctorId) {
      url = `${API_URL}/slots/doctor/${doctorId}`;
    }
    
    console.log('Fetching slots from:', url);
    
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error('Error response:', errorData);
      throw new Error(errorData.message || 'Failed to load slots');
    }
    
    const slots = await response.json();
    console.log('Slots loaded:', slots.length);
    
    // Update stats
    const total = slots.length;
    const available = slots.filter(s => !s.isBooked).length;
    const booked = slots.filter(s => s.isBooked).length;
    
    document.getElementById('totalSlotsCount').textContent = total;
    document.getElementById('availableSlotsCount').textContent = available;
    document.getElementById('bookedSlotsCount').textContent = booked;
    
    if (slots.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="padding: 20px; text-align: center;">No slots found</td></tr>';
      return;
    }
    
    tbody.innerHTML = slots.map(slot => {
      const startTime = new Date(slot.startTime);
      const endTime = new Date(slot.endTime);
      const duration = slot.duration || Math.round((endTime - startTime) / (1000 * 60));
      const patientName = slot.appointments && slot.appointments.length > 0 
        ? slot.appointments[0].patient?.name 
        : '-';
      const statusBadge = slot.isBooked 
        ? '<span style="padding: 4px 12px; background: #fee; color: #c33; border-radius: 12px; font-size: 0.875rem;">🔴 Booked</span>'
        : '<span style="padding: 4px 12px; background: #efe; color: #3c3; border-radius: 12px; font-size: 0.875rem;">🟢 Available</span>';
      
      return `
        <tr style="border-bottom: 1px solid #e0e0e0;">
          <td style="padding: 12px;">#${slot.id}</td>
          <td style="padding: 12px;">Dr. ${slot.doctor?.name || 'N/A'}</td>
          <td style="padding: 12px;">${startTime.toLocaleDateString()}</td>
          <td style="padding: 12px;">${startTime.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})} - ${endTime.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</td>
          <td style="padding: 12px;">${duration} min</td>
          <td style="padding: 12px;">${statusBadge}</td>
          <td style="padding: 12px;"><strong>${patientName}</strong></td>
          <td style="padding: 12px;">
            ${!slot.isBooked 
              ? `<button class="btn btn-danger" onclick="deleteSlot(${slot.id})" style="padding: 6px 12px; font-size: 0.875rem;">Delete</button>`
              : `<button class="btn btn-info" onclick="viewSlotAppointment(${slot.id})" style="padding: 6px 12px; font-size: 0.875rem; background: #3498db;">View Appt</button>`
            }
          </td>
        </tr>
      `;
    }).join('');
    
  } catch (error) {
    console.error('Error loading slots:', error);
    document.getElementById('slots-table-body').innerHTML = `<tr><td colspan="8" style="padding: 20px; text-align: center; color: red;">Error loading slots: ${error.message}</td></tr>`;
  }
}

function openCreateSlotModal() {
  const modal = document.createElement('div');
  modal.id = 'createSlotModal';
  modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px;';
  
  const today = new Date().toISOString().split('T')[0];
  
  modal.innerHTML = `
    <div style="background:white;padding:2rem;border-radius:12px;max-width:500px;width:100%;max-height:90vh;overflow-y:auto;">
      <h2 style="margin-top:0;">Create Doctor Appointment Slots</h2>
      <p style="color: #666; font-size: 0.875rem;">Create multiple time slots for a doctor. Each slot can only be booked by one patient.</p>
      
      <form id="createSlotForm" onsubmit="createSlots(event)">
        <div style="margin-bottom:1rem;">
          <label style="display:block;margin-bottom:0.5rem;font-weight:600;">Select Doctor*</label>
          <select id="slotDoctorId" required style="width:100%;padding:0.75rem;border:1px solid #ddd;border-radius:6px;font-size:14px;">
            <option value="">Loading doctors...</option>
          </select>
        </div>
        
        <div style="margin-bottom:1rem;">
          <label style="display:block;margin-bottom:0.5rem;font-weight:600;">Date*</label>
          <input type="date" id="slotDate" required min="${today}" style="width:100%;padding:0.75rem;border:1px solid #ddd;border-radius:6px;font-size:14px;">
        </div>
        
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem;">
          <div>
            <label style="display:block;margin-bottom:0.5rem;font-weight:600;">Start Time*</label>
            <input type="time" id="slotStartTime" required value="09:00" style="width:100%;padding:0.75rem;border:1px solid #ddd;border-radius:6px;font-size:14px;">
          </div>
          <div>
            <label style="display:block;margin-bottom:0.5rem;font-weight:600;">End Time*</label>
            <input type="time" id="slotEndTime" required value="17:00" style="width:100%;padding:0.75rem;border:1px solid #ddd;border-radius:6px;font-size:14px;">
          </div>
        </div>
        
        <div style="margin-bottom:1.5rem;">
          <label style="display:block;margin-bottom:0.5rem;font-weight:600;">Slot Duration (minutes)*</label>
          <select id="slotDuration" required style="width:100%;padding:0.75rem;border:1px solid #ddd;border-radius:6px;font-size:14px;">
            <option value="30">30 minutes</option>
            <option value="60" selected>60 minutes (1 hour)</option>
            <option value="90">90 minutes</option>
            <option value="120">120 minutes (2 hours)</option>
          </select>
        </div>

        <div style="background: #f0f7ff; padding: 1rem; border-radius: 6px; margin-bottom: 1.5rem; font-size: 0.875rem;">
          <strong>Note:</strong> Each slot can be booked by only one patient. We will automatically create multiple slots based on the duration you select.
        </div>
        
        <div style="display:flex;gap:1rem;">
          <button type="submit" style="flex:1;padding:0.75rem;background:#27ae60;color:white;border:none;border-radius:6px;font-weight:600;cursor:pointer;">Create Slots</button>
          <button type="button" onclick="closeCreateSlotModal()" style="flex:1;padding:0.75rem;background:#95a5a6;color:white;border:none;border-radius:6px;font-weight:600;cursor:pointer;">Cancel</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  loadDoctorsForSlotCreation();
}

async function loadDoctorsForSlotCreation() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/admin/doctors`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!response.ok) throw new Error('Failed to load doctors');
    
    const doctors = await response.json();
    const approvedDoctors = doctors.filter(d => d.status === 'APPROVED');
    
    const select = document.getElementById('slotDoctorId');
    select.innerHTML = '<option value="">-- Select a doctor --</option>' + 
      approvedDoctors.map(d => `<option value="${d.id}">Dr. ${d.name} (${d.specialty || 'N/A'})</option>`).join('');
  } catch (error) {
    console.error('Error loading doctors:', error);
    alert('Failed to load doctors');
  }
}

function closeCreateSlotModal() {
  const modal = document.getElementById('createSlotModal');
  if (modal) modal.remove();
}

async function createSlots(event) {
  event.preventDefault();
  
  const doctorId = document.getElementById('slotDoctorId').value;
  const date = document.getElementById('slotDate').value;
  const startTime = document.getElementById('slotStartTime').value;
  const endTime = document.getElementById('slotEndTime').value;
  const duration = document.getElementById('slotDuration').value;
  
  if (!doctorId || !date || !startTime || !endTime) {
    alert('Please fill all required fields');
    return;
  }
  
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/slots/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        doctorId: parseInt(doctorId),
        date,
        startTime,
        endTime,
        duration: parseInt(duration)
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create slots');
    }
    
    const result = await response.json();
    alert(`✅ Success!\n\nCreated ${result.count} appointment slots successfully!`);
    closeCreateSlotModal();
    loadDoctorSlots();
    
  } catch (error) {
    console.error('Error creating slots:', error);
    alert('❌ Error: ' + error.message);
  }
}

async function deleteSlot(slotId) {
  if (!confirm('Are you sure you want to delete this slot? This action cannot be undone.')) {
    return;
  }
  
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/slots/${slotId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete slot');
    }
    
    alert('✅ Slot deleted successfully!');
    loadDoctorSlots();
    
  } catch (error) {
    console.error('Error deleting slot:', error);
    alert('❌ Error: ' + error.message);
  }
}

function viewSlotAppointment(slotId) {
  alert(`View appointment for slot #${slotId}. This feature shows the associated appointment details.`);
}

function openRegenerateSlotModal() {
  const modal = document.createElement('div');
  modal.id = 'regenerateSlotModal';
  modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px;';
  
  modal.innerHTML = `
    <div style="background:white;padding:2rem;border-radius:12px;max-width:500px;width:100%;">
      <h2 style="margin-top:0;">Regenerate Doctor Slots</h2>
      <p style="color: #666; font-size: 0.875rem;">This will create new slots for the next 7 days for the selected doctor. Existing slots will not be affected.</p>
      
      <form id="regenerateSlotForm" onsubmit="regenerateDoctorSlots(event)">
        <div style="margin-bottom:1rem;">
          <label style="display:block;margin-bottom:0.5rem;font-weight:600;">Select Doctor*</label>
          <select id="regenerateDoctorId" required style="width:100%;padding:0.75rem;border:1px solid #ddd;border-radius:6px;font-size:14px;">
            <option value="">Loading doctors...</option>
          </select>
        </div>
        
        <div style="margin-bottom:1.5rem; padding: 1rem; background: #f9f9f9; border-radius: 6px; border-left: 4px solid #9b59b6;">
          <p style="margin: 0; font-size: 0.875rem; color: #555;">
            <strong>New slots will be created for:</strong><br>
            • Days: Monday - Friday (next 7 days)<br>
            • Hours: 9:00 AM - 5:00 PM<br>
            • Duration: 60 minutes each<br>
            • Total slots: 40-56 (depends on weekends)
          </p>
        </div>
        
        <div style="display: flex; gap: 0.75rem;">
          <button type="submit" class="btn btn-success" style="flex: 1; padding: 0.75rem;">🔄 Regenerate Slots</button>
          <button type="button" class="btn btn-secondary" onclick="document.getElementById('regenerateSlotModal').remove();" style="flex: 1; padding: 0.75rem; background: #95a5a6; color: white; border: none; border-radius: 6px; cursor: pointer;">Cancel</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Load doctors for the select
  loadDoctorsForRegenerateSlots();
}

async function loadDoctorsForRegenerateSlots() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/admin/doctors`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!response.ok) throw new Error('Failed to load doctors');
    
    const doctors = await response.json();
    const select = document.getElementById('regenerateDoctorId');
    
    if (doctors.length === 0) {
      select.innerHTML = '<option value="">No doctors available</option>';
      return;
    }
    
    select.innerHTML = '<option value="">-- Select Doctor --</option>' + 
      doctors.map(doctor => `<option value="${doctor.id}">${doctor.name} (${doctor.specialty})</option>`).join('');
  } catch (error) {
    console.error('Error loading doctors:', error);
    alert('❌ Error loading doctors');
  }
}

async function regenerateDoctorSlots(event) {
  event.preventDefault();
  
  try {
    const token = localStorage.getItem('token');
    const doctorId = document.getElementById('regenerateDoctorId').value;
    
    if (!doctorId) {
      alert('⚠️ Please select a doctor');
      return;
    }
    
    const response = await fetch(`${API_URL}/admin/doctors/${doctorId}/regenerate-slots`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to regenerate slots');
    }
    
    const result = await response.json();
    alert(`✅ ${result.message || 'Slots regenerated successfully!'}`);
    
    // Close modal
    const modal = document.getElementById('regenerateSlotModal');
    if (modal) modal.remove();
    
    // Reload slots
    loadDoctorSlots();
    
  } catch (error) {
    console.error('Error regenerating slots:', error);
    alert('❌ Error: ' + error.message);
  }
}
