const API_URL = 'http://localhost:5050/api';
let currentDoctor = null;
let allDiseases = [];

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    await loadDoctorData();
    await loadAllDiseases();
    loadAppointments();
    
    // Setup nav
    setupNavigation();
});

function setupNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            showSection(section);
        });
    });
}

function showSection(sectionName) {
    // Update nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-section="${sectionName}"]`)?.classList.add('active');

    // Update content
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`${sectionName}-section`)?.classList.add('active');
    
    // Load reviews when reviews section is shown
    if (sectionName === 'reviews') {
        loadReviews();
    }
}

// Load doctor data
async function loadDoctorData() {
    try {
        const token = localStorage.getItem('token');
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const userId = userData.id;
        
        if (!userId) {
            console.error('User ID not found in localStorage');
            return;
        }
        
        const response = await fetch(`${API_URL}/doctors/${userId}/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();
            // Ensure the doctor object has an id field
            currentDoctor = {
                ...data,
                id: userId,
                name: userData.name || data.name
            };
            console.log('Doctor data loaded:', currentDoctor);
            displayDoctorInfo();
            loadProfileForm();
        } else {
            console.warn('Doctor profile not found yet:', response.status);
            // Set minimal doctor data from userData
            currentDoctor = {
                id: userId,
                name: userData.name
            };
        }
    } catch (error) {
        console.error('Error loading doctor data:', error);
        // Set fallback doctor data from localStorage
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        currentDoctor = {
            id: userData.id,
            name: userData.name
        };
    }
}

function displayDoctorInfo() {
    const doctorNameEl = document.getElementById('doctorName');
    const doctorStatusEl = document.getElementById('doctorStatus');
    
    if (doctorNameEl && currentDoctor) {
        doctorNameEl.textContent = currentDoctor.name || 'Doctor';
    }
    
    if (doctorStatusEl && currentDoctor) {
        const status = currentDoctor.status || 'PENDING';
        doctorStatusEl.innerHTML = `
            <span class="badge badge-${status.toLowerCase()}">
                ${status}
            </span>
        `;
    }
}

// Load all diseases for profile setup
async function loadAllDiseases() {
    try {
        const response = await fetch(`${API_URL}/admin/diseases`);
        if (response.ok) {
            allDiseases = await response.json();
        }
    } catch (error) {
        console.error('Error loading diseases:', error);
    }
}

// ============ AVAILABILITY MANAGEMENT ============

function setupAvailabilityForm() {
    const form = document.getElementById('availabilityForm');
    if (!form) return;

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const container = document.getElementById('weeklyScheduleContainer');
    
    container.innerHTML = days.map(day => `
        <div class="day-schedule">
            <label>
                <input type="checkbox" id="${day}-enabled" onchange="toggleDaySchedule('${day}')">
                ${day.charAt(0).toUpperCase() + day.slice(1)}
            </label>
            <div id="${day}-times" class="time-inputs" style="display: none;">
                <input type="time" id="${day}-start" value="09:00">
                <span>to</span>
                <input type="time" id="${day}-end" value="17:00">
                <button type="button" class="btn-small" onclick="addTimeSlot('${day}')">+ Add</button>
            </div>
            <div id="${day}-slots"></div>
        </div>
    `).join('');
}

function toggleDaySchedule(day) {
    const enabled = document.getElementById(`${day}-enabled`).checked;
    const timesDiv = document.getElementById(`${day}-times`);
    timesDiv.style.display = enabled ? 'flex' : 'none';
}

let daySchedules = {};

function addTimeSlot(day) {
    const start = document.getElementById(`${day}-start`).value;
    const end = document.getElementById(`${day}-end`).value;
    
    if (!start || !end) {
        alert('Please select start and end times');
        return;
    }

    if (!daySchedules[day]) {
        daySchedules[day] = [];
    }

    daySchedules[day].push(`${start}-${end}`);
    renderDaySlots(day);
}

function renderDaySlots(day) {
    const container = document.getElementById(`${day}-slots`);
    if (!daySchedules[day] || daySchedules[day].length === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = daySchedules[day].map((slot, index) => `
        <div class="slot-tag">
            ${slot}
            <span onclick="removeTimeSlot('${day}', ${index})" style="cursor: pointer; margin-left: 8px;">×</span>
        </div>
    `).join('');
}

function removeTimeSlot(day, index) {
    daySchedules[day].splice(index, 1);
    renderDaySlots(day);
}

async function saveAvailability() {
    const slotDuration = document.getElementById('slotDuration')?.value || 30;
    
    const weeklySchedule = {};
    Object.keys(daySchedules).forEach(day => {
        if (daySchedules[day].length > 0) {
            weeklySchedule[day] = daySchedules[day];
        }
    });

    if (Object.keys(weeklySchedule).length === 0) {
        alert('Please add at least one time slot');
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/doctors/me/availability/schedule`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                weeklySchedule,
                slotDuration: parseInt(slotDuration)
            })
        });

        if (!response.ok) {
            throw new Error('Failed to save availability');
        }

        const result = await response.json();
        alert(`✅ Availability saved! ${result.slotsGenerated} slots generated for next 30 days.`);
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error saving availability');
    }
}

// ============ PROFILE MANAGEMENT ============

function loadProfileForm() {
    if (!currentDoctor || !currentDoctor.profile) return;

    const profile = currentDoctor.profile;
    
    // Fill form fields
    document.getElementById('education').value = profile.education || '';
    document.getElementById('certifications').value = profile.certifications || '';
    document.getElementById('clinicName').value = profile.clinicName || '';
    document.getElementById('bio').value = profile.bio || '';
    document.getElementById('city').value = profile.city || '';
    document.getElementById('experience').value = profile.experience || '';
    document.getElementById('fees').value = profile.fees || '';

    // Languages
    if (profile.languages) {
        document.getElementById('languages').value = profile.languages.join(', ');
    }

    // Consultation modes
    if (profile.consultationModes) {
        profile.consultationModes.forEach(mode => {
            const checkbox = document.querySelector(`input[value="${mode}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }

    // Expertise
    renderExpertiseOptions(profile.expertise);
}

function renderExpertiseOptions(selectedExpertise = []) {
    const container = document.getElementById('expertiseOptions');
    if (!container) return;

    const selectedIds = selectedExpertise.map(e => e.id);

    container.innerHTML = allDiseases.map(disease => `
        <label class="expertise-checkbox">
            <input type="checkbox" value="${disease.id}" ${selectedIds.includes(disease.id) ? 'checked' : ''}>
            ${disease.name}
        </label>
    `).join('');
}

async function saveProfile() {
    const education = document.getElementById('education').value;
    const bio = document.getElementById('bio').value;
    const city = document.getElementById('city').value;

    if (!education || !bio || !city) {
        alert('Education, bio, and city are required');
        return;
    }

    const languages = document.getElementById('languages').value
        .split(',')
        .map(l => l.trim())
        .filter(l => l);

    const consultationModes = Array.from(
        document.querySelectorAll('input[name="consultationMode"]:checked')
    ).map(cb => cb.value);

    const expertiseIds = Array.from(
        document.querySelectorAll('#expertiseOptions input:checked')
    ).map(cb => parseInt(cb.value));

    try {
        const token = localStorage.getItem('token');
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const userId = userData.id;

        // Try to create or update profile
        const profileData = {
            education,
            certifications: document.getElementById('certifications').value,
            clinicName: document.getElementById('clinicName').value,
            languages,
            expertiseIds,
            bio,
            city,
            consultationModes,
            experience: parseInt(document.getElementById('experience').value) || 0,
            fees: parseFloat(document.getElementById('fees').value) || 0
        };

        // First try creating the profile (if it doesn't exist)
        let response = await fetch(`${API_URL}/doctors/profile`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(profileData)
        });

        // If profile already exists (400 error), try updating via patient endpoint
        if (response.status === 400) {
            response = await fetch(`${API_URL}/patients/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profileData)
            });
        }

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error response:', response.status, errorData);
            throw new Error(errorData.message || errorData.error || 'Failed to save profile');
        }

        alert('✅ Profile saved successfully!');
        await loadDoctorData();
    } catch (error) {
        console.error('Error:', error);
        alert(`❌ Error saving profile: ${error.message}`);
    }
}

// ============ APPOINTMENTS ============

async function loadAppointments() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.warn('No token found, cannot load appointments');
            return;
        }

        const response = await fetch(`${API_URL}/appointments`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('API error response:', response.status, errorData);
            throw new Error(`Failed to load appointments: ${response.status}`);
        }

        const appointments = await response.json();
        console.log('Appointments loaded:', appointments);
        displayAppointments(appointments);
    } catch (error) {
        console.error('Error loading appointments:', error);
        const tbody = document.querySelector('#appointmentsTable tbody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #dc3545;">Failed to load appointments</td></tr>';
        }
    }
}

function displayAppointments(appointments) {
    const tbody = document.querySelector('#appointmentsTable tbody');
    if (!tbody) return;

    if (appointments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No appointments</td></tr>';
        return;
    }

    tbody.innerHTML = appointments.map(apt => {
        const patient = apt.patient || {};
        
        // Use appointment date and startTime fields (now properly returned from backend)
        let dateTimeStr = 'N/A';
        if (apt.date && apt.startTime) {
            const aptDate = new Date(apt.date);
            dateTimeStr = `${aptDate.toLocaleDateString()} ${apt.startTime}`;
        } else if (apt.slot?.startTime) {
            dateTimeStr = new Date(apt.slot.startTime).toLocaleString();
        }
        
        return `
            <tr>
                <td>${patient.name || 'N/A'}</td>
                <td>${dateTimeStr}</td>
                <td><span class="badge badge-${apt.status.toLowerCase()}">${apt.status}</span></td>
                <td>
                    ${apt.status === 'PENDING' ? 
                        `<button class="btn btn-sm" onclick="updateAppointment(${apt.id}, 'CONFIRMED')">Confirm</button>` :
                        apt.status === 'CONFIRMED' ?
                        `<button class="btn btn-sm btn-primary" onclick="completeAppointment(${apt.id})">Complete</button>` :
                        '-'
                    }
                </td>
            </tr>
        `;
    }).join('');
}

async function updateAppointment(id, status) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/appointments/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error response:', response.status, errorData);
            throw new Error(errorData.message || 'Failed to update appointment');
        }

        alert('✅ Appointment updated');
        loadAppointments();
    } catch (error) {
        console.error('Error:', error);
        alert(`❌ Error updating appointment: ${error.message}`);
    }
}

async function completeAppointment(id) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/appointments/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: 'COMPLETED' })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error response:', response.status, errorData);
            throw new Error(errorData.message || 'Failed to complete appointment');
        }

        alert('✅ Appointment completed');
        loadAppointments();
    } catch (error) {
        console.error('Error:', error);
        alert(`❌ Error completing appointment: ${error.message}`);
    }
}

// ============ REVIEWS ============

async function loadReviews() {
    // Get doctor ID from currentDoctor or userData
    let doctorId = null;
    
    if (currentDoctor && currentDoctor.id) {
        doctorId = currentDoctor.id;
    } else {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        doctorId = userData.id;
    }
    
    if (!doctorId) {
        console.error('Doctor ID not available. currentDoctor:', currentDoctor);
        const reviewsList = document.getElementById('reviewsList');
        if (reviewsList) {
            reviewsList.innerHTML = '<p style="text-align: center; color: #666;">Unable to load reviews - doctor information not available</p>';
        }
        return;
    }

    console.log('Loading reviews for doctor ID:', doctorId);
    
    try {
        const token = localStorage.getItem('token');
        const url = `${API_URL}/reviews/doctor/${doctorId}`;
        console.log('Fetching reviews from:', url);
        
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('Reviews response status:', response.status);

        if (!response.ok) {
            throw new Error(`Failed to load reviews: ${response.status}`);
        }

        const data = await response.json();
        console.log('Reviews loaded:', data.reviews?.length || 0, 'Data:', data);
        
        // Handle both old (array) and new (object) response formats
        const reviews = Array.isArray(data) ? data : (data.reviews || []);
        displayReviews(reviews);
    } catch (error) {
        console.error('Error loading reviews:', error);
        const reviewsList = document.getElementById('reviewsList');
        if (reviewsList) {
            reviewsList.innerHTML = '<p style="text-align: center; color: #dc3545;">Error loading reviews</p>';
        }
    }
}

function displayReviews(reviews) {
    const reviewsList = document.getElementById('reviewsList');
    const avgRatingEl = document.getElementById('avgRating');
    const totalReviewsEl = document.getElementById('totalReviews');

    if (!reviewsList) return;

    // Update stats
    if (totalReviewsEl) {
        totalReviewsEl.textContent = reviews.length;
    }

    if (avgRatingEl && reviews.length > 0) {
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        avgRatingEl.textContent = avgRating.toFixed(1) + ' ⭐';
    } else if (avgRatingEl) {
        avgRatingEl.textContent = 'N/A';
    }

    // Display reviews
    if (reviews.length === 0) {
        reviewsList.innerHTML = '<p style="text-align: center; color: #666;">No reviews yet</p>';
        return;
    }

    reviewsList.innerHTML = reviews.map(review => {
        const reviewer = review.reviewer || {};
        const stars = '⭐'.repeat(review.rating);
        const date = new Date(review.createdAt).toLocaleDateString();
        
        return `
            <div style="border: 1px solid #dee2e6; border-radius: 8px; padding: 15px; margin-bottom: 15px; background: #f8f9fa;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <div>
                        <strong>${reviewer.name || 'Anonymous'}</strong>
                        <div style="color: #ffc107; font-size: 18px;">${stars}</div>
                    </div>
                    <div style="color: #666; font-size: 13px;">${date}</div>
                </div>
                ${review.comment ? `<p style="color: #495057; margin: 0;">${review.comment}</p>` : '<p style="color: #999; font-style: italic;">No comment provided</p>'}
            </div>
        `;
    }).join('');
}

function doctorLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    window.location.href = 'login.html';
}

// ============ UPCOMING APPOINTMENTS ============

async function loadUpcomingAppointments() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.warn('No token found, cannot load appointments');
            return;
        }

        const response = await fetch(`${API_URL}/appointments`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('API error response:', response.status, errorData);
            throw new Error(`Failed to load upcoming appointments: ${response.status}`);
        }

        const appointments = await response.json();
        console.log('All appointments for filtering:', appointments);
        
        // Filter for upcoming appointments (next 7 days) that are not cancelled/rejected
        const now = new Date();
        const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        const upcoming = appointments.filter(apt => {
            // Use appointment date and startTime fields (which are now included in the API response)
            const aptDate = apt.date ? new Date(apt.date) : (apt.slot?.startTime ? new Date(apt.slot.startTime) : null);
            if (!aptDate || isNaN(aptDate)) return false;
            
            return aptDate >= now && aptDate <= sevenDaysLater && 
                   !['CANCELLED', 'REJECTED'].includes(apt.status);
        }).sort((a, b) => {
            const dateA = new Date(a.date || a.slot?.startTime);
            const dateB = new Date(b.date || b.slot?.startTime);
            return dateA - dateB;
        });

        console.log('Filtered upcoming appointments:', upcoming);
        displayUpcomingAppointments(upcoming);
    } catch (error) {
        console.error('Error loading upcoming appointments:', error);
        const container = document.getElementById('upcomingAppointmentsList');
        if (container) {
            container.innerHTML = '<p style="text-align: center; color: #dc3545;">Failed to load upcoming appointments</p>';
        }
    }
}

function displayUpcomingAppointments(appointments) {
    const container = document.getElementById('upcomingAppointmentsList');
    if (!container) return;

    if (appointments.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No upcoming appointments in the next 7 days</p>';
        return;
    }

    container.innerHTML = appointments.map(apt => {
        const patient = apt.patient || {};
        const aptDate = new Date(apt.slot?.startTime || apt.scheduledAt || apt.date);
        const timeStr = aptDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const dateStr = aptDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        const statusColor = {
            'PENDING': '#ff9800',
            'CONFIRMED': '#4caf50',
            'COMPLETED': '#2196f3'
        };

        return `
            <div class="upcoming-appointment-card">
                <div class="appointment-time">${timeStr}</div>
                <div class="appointment-details">
                    <h4>${patient.name || 'Unknown Patient'}</h4>
                    <p>📅 ${dateStr} • ${apt.mode || 'IN_PERSON'}</p>
                    <p>Status: <span style="background: ${statusColor[apt.status] || '#95a5a6'}; color: white; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.85rem;">${apt.status}</span></p>
                </div>
                <div class="appointment-actions">
                    <button class="btn btn-icon btn-info" onclick="viewPatientInfo(${patient.id})">👤 Patient Info</button>
                    ${apt.status === 'PENDING' ? `
                        <button class="btn btn-icon" style="background: #4caf50; color: white; padding: 0.5rem 1rem;" onclick="confirmAppointmentQuick(${apt.id})">✓ Confirm</button>
                    ` : apt.status === 'CONFIRMED' ? `
                        <button class="btn btn-icon" style="background: #2196f3; color: white; padding: 0.5rem 1rem;" onclick="completeAppointmentQuick(${apt.id})">✓ Complete</button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Quick confirm appointment
async function confirmAppointmentQuick(appointmentId) {
    if (!confirm('Confirm this appointment?')) return;
    
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
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to confirm');
        }

        alert('✅ Appointment confirmed!');
        loadAppointments();
        loadUpcomingAppointments();
    } catch (error) {
        alert(`❌ Error: ${error.message}`);
    }
}

// Quick complete appointment
async function completeAppointmentQuick(appointmentId) {
    if (!confirm('Mark this appointment as completed?')) return;
    
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
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to complete');
        }

        alert('✅ Appointment completed!');
        loadAppointments();
        loadUpcomingAppointments();
    } catch (error) {
        alert(`❌ Error: ${error.message}`);
    }
}

// ============ PATIENT INFORMATION ============

async function viewPatientInfo(patientId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/appointments`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to load appointments');

        const appointments = await response.json();
        const patientAppointments = appointments.filter(apt => apt.patientId === patientId);
        
        if (patientAppointments.length === 0) {
            alert('No appointments found for this patient');
            return;
        }

        const firstApt = patientAppointments[0];
        const patient = firstApt.patient || {};

        // Populate modal
        document.getElementById('patientModalTitle').textContent = `${patient.name || 'Patient'} - Medical Profile`;
        document.getElementById('patientName').textContent = patient.name || '-';
        document.getElementById('patientEmail').textContent = patient.email || '-';
        document.getElementById('patientAge').textContent = patient.age ? `${patient.age} years` : '-';
        document.getElementById('patientGender').textContent = patient.gender || '-';
        document.getElementById('patientPhone').textContent = patient.phone || 'Not provided';
        document.getElementById('patientMaritalStatus').textContent = patient.maritalStatus || 'Not provided';

        // Appointment history
        const appointmentHistoryHtml = patientAppointments
            .sort((a, b) => new Date(b.scheduledAt || b.date) - new Date(a.scheduledAt || a.date))
            .map(apt => {
                const aptDate = new Date(apt.scheduledAt || apt.date);
                const dateStr = aptDate.toLocaleDateString('en-US', { 
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                const statusColors = {
                    'PENDING': '#ff9800',
                    'CONFIRMED': '#4caf50',
                    'COMPLETED': '#2196f3',
                    'CANCELLED': '#f44336',
                    'REJECTED': '#f44336'
                };

                return `
                    <div style="padding: 0.75rem; background: #f8f9fa; border-radius: 4px; border-left: 4px solid ${statusColors[apt.status] || '#95a5a6'};">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                            <strong>${dateStr}</strong>
                            <span style="background: ${statusColors[apt.status] || '#95a5a6'}; color: white; padding: 0.25rem 0.5rem; border-radius: 3px; font-size: 0.8rem;">${apt.status}</span>
                        </div>
                        <p style="margin: 0.25rem 0; color: #555; font-size: 0.9rem;">
                            Mode: ${apt.mode || 'IN_PERSON'} | Type: ${apt.type || 'Consultation'}
                        </p>
                    </div>
                `;
            })
            .join('');

        document.getElementById('appointmentHistory').innerHTML = appointmentHistoryHtml || '<p style="color: #666;">No appointment history</p>';

        // Show modal
        document.getElementById('patientModal').classList.add('show');
    } catch (error) {
        console.error('Error loading patient info:', error);
        alert('Failed to load patient information');
    }
}

function closePatientModal() {
    document.getElementById('patientModal').classList.remove('show');
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    const modal = document.getElementById('patientModal');
    if (modal && e.target === modal) {
        closePatientModal();
    }
});

// Initialize availability form when section is shown
document.addEventListener('DOMContentLoaded', () => {
    setupAvailabilityForm();
    loadUpcomingAppointments();
});
