// Slot Booking JavaScript
const API_URL = 'http://localhost:5050/api';
let doctor = null;
let selectedDate = null;
let selectedSlot = null;
let slots = [];

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const doctorId = urlParams.get('doctorId');

    if (!doctorId) {
        window.location.href = 'problem-selection.html';
        return;
    }

    await loadDoctorInfo(doctorId);
    displayProblemSummary();
    generateDateSelector();
});

async function loadDoctorInfo(doctorId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/doctors/${doctorId}/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to load doctor');

        doctor = await response.json();
        displayDoctorInfo();
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('doctorInfo').innerHTML =
            '<p style="color: red;">Error loading doctor information</p>';
    }
}

function displayDoctorInfo() {
    const infoDiv = document.getElementById('doctorInfo');
    const initials = doctor.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    infoDiv.innerHTML = `
        <div class="doctor-info-card">
            <div class="doctor-avatar">
                ${initials}
            </div>
            <div class="doctor-details">
                <h3>${doctor.name}</h3>
                <p>${doctor.profile?.specialization || 'General Medicine'}</p>
                <div class="doctor-meta">
                    <span>⭐ ${doctor.ratings || '4.8'}</span>
                    <span>💼 ${doctor.profile?.experience || '0'} years</span>
                    <span>💰 ₹${doctor.profile?.consultationFee || '500'}</span>
                </div>
            </div>
        </div>
    `;
}

function displayProblemSummary() {
    const problems = JSON.parse(sessionStorage.getItem('selectedProblems') || '{}');
    const summaryDiv = document.getElementById('problemSummary');
    const listDiv = document.getElementById('problemList');

    if (!problems.diseases && !problems.symptoms) {
        summaryDiv.style.display = 'none';
        return;
    }

    summaryDiv.style.display = 'block';

    const items = [];
    if (problems.diseases) {
        items.push(...problems.diseases.map(d => `<li><strong>${d.name}</strong></li>`));
    }
    if (problems.symptoms) {
        items.push(...problems.symptoms.map(s => `<li><em>${s.name}</em></li>`));
    }

    listDiv.innerHTML = items.join('');
}

function generateDateSelector() {
    const container = document.getElementById('dateSelector');
    const today = new Date();

    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);

        const dateCard = document.createElement('div');
        dateCard.className = 'date-card';
        dateCard.onclick = () => selectDate(date);

        dateCard.innerHTML = `
            <div class="day">${date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
            <div class="date">${date.getDate()}</div>
            <div class="month">${date.toLocaleDateString('en-US', { month: 'short' })}</div>
        `;

        container.appendChild(dateCard);
    }
}

function selectDate(date) {
    selectedDate = date;

    // Update UI
    document.querySelectorAll('.date-card').forEach(card => {
        card.classList.remove('selected');
    });
    event.currentTarget.classList.add('selected');

    // Load slots for selected date
    loadSlotsForDate(date);
}

async function loadSlotsForDate(date) {
    if (!doctor) return;

    const dateStr = date.toISOString().split('T')[0];
    const slotsLoading = document.getElementById('slotsLoading');
    const slotsGrid = document.getElementById('slotsGrid');
    const noSlots = document.getElementById('noSlots');

    slotsLoading.style.display = 'block';
    slotsGrid.style.display = 'none';
    noSlots.style.display = 'none';

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/doctors/${doctor.id}/slots?date=${dateStr}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to load slots');

        slots = await response.json();
        displaySlots(slots);
    } catch (error) {
        console.error('Error loading slots:', error);
        slotsLoading.style.display = 'none';
        noSlots.style.display = 'block';
        noSlots.innerHTML = '<p style="color: red;">Error loading slots</p>';
    }
}

function displaySlots(slots) {
    const slotsLoading = document.getElementById('slotsLoading');
    const slotsGrid = document.getElementById('slotsGrid');
    const noSlots = document.getElementById('noSlots');

    slotsLoading.style.display = 'none';

    if (!slots || slots.length === 0) {
        noSlots.style.display = 'block';
        slotsGrid.style.display = 'none';
        return;
    }

    noSlots.style.display = 'none';
    slotsGrid.style.display = 'grid';
    slotsGrid.innerHTML = slots.map(slot => `
        <div class="slot-card ${slot.isBooked ? 'booked' : ''}" onclick="${!slot.isBooked ? `selectSlot(${slot.slotId || slot.id}, this)` : ''}">
            <div class="slot-time">${slot.startTime || new Date(slot.startDateTime).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</div>
            <div class="slot-status">${slot.isBooked ? 'Booked' : 'Available'}</div>
        </div>
    `).join('');
}

function selectSlot(slotId, element) {
    // Remove previous selection
    document.querySelectorAll('.slot-card').forEach(card => {
        card.classList.remove('selected');
    });
    element.classList.add('selected');

    selectedSlot = slots.find(s => (s.slotId || s.id) === slotId);
    updateBookButton();
}

function updateBookButton() {
    const btn = document.getElementById('bookBtn');

    if (selectedSlot) {
        btn.disabled = false;
        btn.textContent = `Book Appointment for ${selectedSlot.startTime || new Date(selectedSlot.startDateTime).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}`;
    } else {
        btn.disabled = true;
        btn.textContent = 'Select a slot to continue';
    }
}

async function confirmBooking() {
    if (!selectedSlot) return;

    const btn = document.getElementById('bookBtn');
    btn.disabled = true;
    btn.textContent = 'Booking...';

    try {
        const token = localStorage.getItem('token');
        const problems = JSON.parse(sessionStorage.getItem('selectedProblems') || '{}');

        const response = await fetch(`${API_URL}/appointments/book`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                doctorId: doctor.id,
                slotId: selectedSlot.slotId || selectedSlot.id,
                problems: {
                    diseases: (problems.diseases || []).map(d => d.name),
                    symptoms: (problems.symptoms || []).map(s => s.name)
                }
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Booking failed');
        }

        const result = await response.json();

        alert('✅ Appointment booked successfully!');
        sessionStorage.clear();
        window.location.href = 'patient-dashboard.html';
    } catch (error) {
        console.error('Error:', error);
        alert(`❌ Error: ${error.message}`);
        btn.disabled = false;
        updateBookButton();
    }
}

function logout() {
    localStorage.removeItem('token');
    sessionStorage.clear();
    window.location.href = 'login.html';
}

// Make functions globally available
window.selectSlot = selectSlot;
window.confirmBooking = confirmBooking;
window.logout = logout;