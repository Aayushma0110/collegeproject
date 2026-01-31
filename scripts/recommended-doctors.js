// Recommended Doctors JavaScript
const API_URL = 'http://localhost:5050/api';

document.addEventListener('DOMContentLoaded', () => {
    console.log('Recommended doctors page loaded');
    const token = localStorage.getItem('token');
    console.log('Token exists:', !!token);

    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    displayProblems();
    displayRecommendations();
});

function displayProblems() {
    const problems = JSON.parse(sessionStorage.getItem('selectedProblems') || '{}');
    const tagsContainer = document.getElementById('problemTags');

    if (!problems.diseases && !problems.symptoms) {
        window.location.href = 'problem-selection.html';
        return;
    }

    const tags = [];
    if (problems.diseases) {
        tags.push(...problems.diseases.map(d => `<span class="tag">${d.name}</span>`));
    }
    if (problems.symptoms) {
        tags.push(...problems.symptoms.map(s => `<span class="tag" style="background: #4CAF50;">${s.name}</span>`));
    }

    tagsContainer.innerHTML = tags.join('');
}

function displayRecommendations() {
    const recommendations = JSON.parse(sessionStorage.getItem('recommendations') || '[]');
    const container = document.getElementById('doctorsGrid');

    console.log('Recommendations data:', recommendations);
    console.log('Container element:', container);

    if (!recommendations || recommendations.length === 0) {
        console.log('No recommendations found');
        document.getElementById('loadingMessage').style.display = 'none';
        document.getElementById('noResults').style.display = 'block';
        return;
    }

    console.log('Displaying', recommendations.length, 'recommendations');

    document.getElementById('loadingMessage').style.display = 'none';
    document.getElementById('noResults').style.display = 'none';
    container.style.display = 'grid';

    try {
        console.log('Loaded recommendations from sessionStorage:', recommendations);

        const html = recommendations.map(doctor => {
            const name = doctor.name || doctor.recommendedDoctor || 'Unknown Doctor';
            const rating = doctor.rating || 0;
            const fee = doctor.fees || 'N/A';
            const experience = doctor.experience || 0;
            const city = doctor.city || 'N/A';
            const education = doctor.education || 'N/A';

            const specialization = doctor.expertise ? doctor.expertise.join(', ') : 'General Physician';
            const consultationModes = doctor.consultationModes ? doctor.consultationModes.join(', ') : 'N/A';

            const relatedDiseases = doctor.expertise ? doctor.expertise.join(', ') : 'N/A';
            const relatedSymptoms = doctor.relatedSymptoms ? doctor.relatedSymptoms.join(', ') : 'N/A';

            return `
                <div class="doctor-card">
                    <div class="doctor-header">
                        <div class="doctor-avatar">${name.charAt(0).toUpperCase()}</div>
                        <div class="doctor-info">
                            <h4 style="font-size: 1.2em; font-weight: bold;">${name}</h4>
                            <div class="doctor-meta">
                                <span>⭐ ${rating.toFixed(1)}</span>
                                <span>💼 ${experience} years</span>
                                <span>💰 NPR ${fee}</span>
                                <span>📍 ${city}</span>
                            </div>
                        </div>
                    </div>
                    <div class="doctor-details">
                        <div class="detail-item">🎓 ${education}</div>
                        <div class="detail-item">🩺 Related Diseases: ${relatedDiseases}</div>
                        <div class="detail-item">🤒 Related Symptoms: ${relatedSymptoms}</div>
                        <div class="why-recommended">
                            <strong>Why recommended:</strong> ${doctor.why || 'N/A'}
                        </div>
                        <div><strong>Consultation Modes:</strong> ${consultationModes}</div>
                        ${doctor.nextAvailableSlot ? `
                            <div style="margin-top: 10px; color: #27ae60;">
                                ✅ Next available: ${new Date(doctor.nextAvailableSlot).toLocaleString()}
                            </div>
                        ` : `
                            <div style="margin-top: 10px; color: #e74c3c;">
                                ⚠️ No slots available currently
                            </div>
                        `}
                    </div>
                    <div class="doctor-actions">
                        <button class="btn btn-outline" onclick="viewProfile(${doctor.doctorId || 'N/A'})">View Profile</button>
                        ${doctor.nextAvailableSlot ? `
                            <button class="btn btn-primary" onclick="bookAppointment(${doctor.doctorId || 'N/A'})">Book Now</button>
                        ` : `
                            <button class="btn btn-secondary" disabled>No Slots Available</button>
                        `}
                    </div>
                </div>
            `;
        }).join('');

        console.log('Generated HTML length:', html.length);
        container.innerHTML = html;
        console.log('HTML set successfully');

    } catch (error) {
        console.error('Error rendering recommendations:', error);
        container.innerHTML = '<p style="color: red;">Error displaying recommendations</p>';
    }
}

async function viewProfile(doctorId) {
    try {
        const response = await fetch(`${API_URL}/doctors/${doctorId}/profile`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) throw new Error('Failed to load doctor profile');

        const doctor = await response.json();

        // Create and show modal
        const modal = document.createElement('div');
        modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:1000;';
        modal.innerHTML = `
            <div style="background:white;padding:30px;border-radius:12px;max-width:600px;max-height:80vh;overflow-y:auto;position:relative;">
                <button onclick="this.closest('div[style*=fixed]').remove()" style="position:absolute;top:10px;right:10px;background:none;border:none;font-size:24px;cursor:pointer;">&times;</button>
                <h2 style="color:#2c3e50;margin-top:0;">${doctor.profile?.fullName || doctor.name || 'Doctor'}</h2>
                <p><strong>Email:</strong> ${doctor.email}</p>
                <p><strong>Phone:</strong> ${doctor.profile?.contactNumber || 'N/A'}</p>
                <p><strong>Specialization:</strong> ${doctor.profile?.specialization || 'N/A'}</p>
                <p><strong>Experience:</strong> ${doctor.profile?.experience || 'N/A'} years</p>
                <p><strong>Qualification:</strong> ${doctor.profile?.qualification || 'N/A'}</p>
                <p><strong>Education:</strong> ${doctor.profile?.education || 'N/A'}</p>
                <p><strong>Consultation Fee:</strong> ₹${doctor.profile?.consultationFee || 'N/A'}</p>
                <p><strong>Bio:</strong> ${doctor.profile?.bio || 'N/A'}</p>
                <div><strong>Expertise:</strong> ${doctor.expertise?.map(e => e.disease?.name || e.disease).join(', ') || 'N/A'}</div>
            </div>
        `;
        document.body.appendChild(modal);
    } catch (error) {
        console.error('Error loading profile:', error);
        alert('Failed to load doctor profile');
    }
}

function bookAppointment(doctorId) {
    // Store selected doctor and redirect to slot booking
    sessionStorage.setItem('selectedDoctorId', doctorId);
    window.location.href = `slot-booking.html?doctorId=${doctorId}`;
}

function logout() {
    localStorage.removeItem('token');
    sessionStorage.clear();
    window.location.href = 'login.html';
}

// Make functions globally available
window.viewProfile = viewProfile;
window.bookAppointment = bookAppointment;
window.logout = logout;