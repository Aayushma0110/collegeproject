/**
 * Problem Selection & Doctor Recommendation System
 */

const API_URL = 'http://localhost:5050/api';

// State Management
let selectedDiseases = [];
let selectedSymptoms = [];
let allDiseases = [];
let allSymptoms = [];
let currentRecommendations = [];
let selectedDoctorId = null;

/**
 * Initialize the page - Load diseases and symptoms
 */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = 'login.html';
      return;
    }

    // Load diseases and symptoms
    await loadDiseasesAndSymptoms();
  } catch (error) {
    console.error('Initialization error:', error);
    showError('Failed to load data. Please refresh the page.');
  }
});

/**
 * Load all diseases and symptoms
 */
async function loadDiseasesAndSymptoms() {
  try {
    const token = localStorage.getItem('token');
    
    console.log('Fetching from:', `${API_URL}/diseases/with-symptoms`);
    console.log('Token:', token ? 'Present' : 'Missing');
    
    // Fetch diseases with symptoms
    const response = await fetch(`${API_URL}/diseases/with-symptoms`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Disease response status:', response.status);
    console.log('Disease response headers:', response.headers);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response body:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to fetch diseases'}`);
    }

    const diseasesList = await response.json();
    console.log('Raw diseases response:', diseasesList);
    
    // Also fetch all symptoms separately
    const symptomsResponse = await fetch(`${API_URL}/diseases/symptoms`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Symptoms response status:', symptomsResponse.status);

    let symptomsList = [];
    if (symptomsResponse.ok) {
      symptomsList = await symptomsResponse.json();
    } else {
      console.warn('Failed to fetch symptoms, continuing with empty list');
    }
    console.log('Raw symptoms response:', symptomsList);

    // Handle both array and object responses
    allDiseases = Array.isArray(diseasesList) ? diseasesList : diseasesList.diseases || [];
    allSymptoms = Array.isArray(symptomsList) ? symptomsList : symptomsList.symptoms || [];

    console.log('Parsed allDiseases:', allDiseases);
    console.log('Parsed allSymptoms:', allSymptoms);
    console.log(`Total diseases: ${allDiseases.length}, Total symptoms: ${allSymptoms.length}`);

    // Populate disease dropdown
    populateDiseaseDropdown();
    populateSymptomDropdown();

    // Add event listeners to dropdowns
    const diseaseSelect = document.getElementById('diseaseSelect');
    const symptomSelect = document.getElementById('symptomSelect');
    
    if (diseaseSelect) {
      diseaseSelect.addEventListener('change', (e) => {
        if (e.target.value) {
          addDisease(parseInt(e.target.value));
          e.target.value = ''; // Reset dropdown
        }
      });
    }
    
    if (symptomSelect) {
      symptomSelect.addEventListener('change', (e) => {
        if (e.target.value) {
          addSymptom(parseInt(e.target.value));
          e.target.value = ''; // Reset dropdown
        }
      });
    }

    console.log('Event listeners added to dropdowns');

  } catch (error) {
    console.error('Error loading data:', error);
    console.error('Error details:', error.message, error.stack);
    showError(`Failed to load diseases and symptoms: ${error.message}`);
  }
}

/**
 * Populate disease dropdown
 */
function populateDiseaseDropdown() {
  const select = document.getElementById('diseaseSelect');
  if (!select) {
    console.error('diseaseSelect element not found');
    return;
  }
  
  select.innerHTML = '<option value="">-- Select a Disease --</option>';

  allDiseases.forEach(disease => {
    const option = document.createElement('option');
    option.value = disease.id;
    option.textContent = disease.name;
    select.appendChild(option);
  });
  
  console.log(`Populated disease dropdown with ${allDiseases.length} diseases`);
}

/**
 * Populate symptom dropdown
 */
function populateSymptomDropdown() {
  const select = document.getElementById('symptomSelect');
  if (!select) {
    console.error('symptomSelect element not found');
    return;
  }
  
  select.innerHTML = '<option value="">-- Select a Symptom --</option>';

  allSymptoms.forEach(symptom => {
    const option = document.createElement('option');
    option.value = symptom.id;
    option.textContent = symptom.name;
    select.appendChild(option);
  });
  
  console.log(`Populated symptom dropdown with ${allSymptoms.length} symptoms`);
}

/**
 * Add disease to selected list
 */
function addDisease(diseaseId) {
  // If called without parameter, get from select
  if (!diseaseId) {
    const select = document.getElementById('diseaseSelect');
    diseaseId = parseInt(select.value);
  }

  if (!diseaseId) return;

  // Prevent duplicates
  if (selectedDiseases.includes(diseaseId)) {
    showError('This disease is already selected');
    const select = document.getElementById('diseaseSelect');
    if (select) select.value = '';
    return;
  }

  // Add to selected list
  selectedDiseases.push(diseaseId);
  updateDiseaseDisplay();
  updateSelectedDisplay();
  enableSubmitButton();
  
  const select = document.getElementById('diseaseSelect');
  if (select) select.value = '';
}

/**
 * Add symptom to selected list
 */
function addSymptom(symptomId) {
  // If called without parameter, get from select
  if (!symptomId) {
    const select = document.getElementById('symptomSelect');
    symptomId = parseInt(select.value);
  }

  if (!symptomId) return;

  // Prevent duplicates
  if (selectedSymptoms.includes(symptomId)) {
    showError('This symptom is already selected');
    const select = document.getElementById('symptomSelect');
    if (select) select.value = '';
    return;
  }

  // Add to selected list
  selectedSymptoms.push(symptomId);
  updateSymptomDisplay();
  updateSelectedDisplay();
  enableSubmitButton();
  
  const select = document.getElementById('symptomSelect');
  if (select) select.value = '';
}

/**
 * Remove disease from selected list
 */
function removeDisease(diseaseId) {
  selectedDiseases = selectedDiseases.filter(id => id !== diseaseId);
  updateDiseaseDisplay();
  updateSelectedDisplay();
  enableSubmitButton();
}

/**
 * Remove symptom from selected list
 */
function removeSymptom(symptomId) {
  selectedSymptoms = selectedSymptoms.filter(id => id !== symptomId);
  updateSymptomDisplay();
  updateSelectedDisplay();
  enableSubmitButton();
}

/**
 * Update selected items display in summary
 */
function updateSelectedDisplay() {
  const container = document.getElementById('selectedTags');
  
  const allSelected = [...selectedDiseases, ...selectedSymptoms];
  if (allSelected.length === 0) {
    container.innerHTML = '<span style="color: #666;">No selections yet</span>';
    return;
  }

  const selectedItems = selectedDiseases.map(diseaseId => {
    const disease = allDiseases.find(d => d.id === diseaseId);
    return `<span class="tag">${disease ? disease.name : 'Unknown'}</span>`;
  }).concat(selectedSymptoms.map(symptomId => {
    const symptom = allSymptoms.find(s => s.id === symptomId);
    return `<span class="tag">${symptom ? symptom.name : 'Unknown'}</span>`;
  }));

  container.innerHTML = selectedItems.join('');
}

/**
 * Enable/disable submit button
 */
function enableSubmitButton() {
  const button = document.getElementById('submitBtn');
  if (button) {
    button.disabled = selectedDiseases.length === 0 && selectedSymptoms.length === 0;
  }
}

/**
 * Update disease display
 */
function updateDiseaseDisplay() {
  const container = document.getElementById('diseaseItems');
  
  if (selectedDiseases.length === 0) {
    container.innerHTML = '<div class="empty-message">No diseases selected yet</div>';
    return;
  }

  container.innerHTML = selectedDiseases.map(diseaseId => {
    const disease = allDiseases.find(d => d.id === diseaseId);
    return `
      <div class="selected-item">
        <span>${disease.name}</span>
        <button type="button" onclick="removeDisease(${diseaseId})">×</button>
      </div>
    `;
  }).join('');
}

/**
 * Update symptom display
 */
function updateSymptomDisplay() {
  const container = document.getElementById('symptomItems');
  
  if (selectedSymptoms.length === 0) {
    container.innerHTML = '<div class="empty-message">No symptoms selected yet</div>';
    return;
  }

  container.innerHTML = selectedSymptoms.map(symptomId => {
    const symptom = allSymptoms.find(s => s.id === symptomId);
    return `
      <div class="selected-item">
        <span>${symptom.name}</span>
        <button type="button" onclick="removeSymptom(${symptomId})">×</button>
      </div>
    `;
  }).join('');
}

/**
 * Submit problem form and get recommendations
 */
async function submitProblemForm() {
  try {
    // Validate selection
    if (selectedDiseases.length === 0 && selectedSymptoms.length === 0) {
      showError('Please select at least one disease or symptom');
      return;
    }

    console.log('Submitting with diseases:', selectedDiseases, 'symptoms:', selectedSymptoms);

    // Show loading state
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading-spinner"></span> Finding doctors...';

    const token = localStorage.getItem('token');

    // Call recommendation API
    const requestBody = {
      diseaseIds: selectedDiseases,
      symptomIds: selectedSymptoms
    };

    console.log('Sending request to:', `${API_URL}/recommendations/doctors`);
    console.log('Request body:', requestBody);

    const response = await fetch(`${API_URL}/recommendations/doctors`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    if (!response.ok) {
      const error = await response.json();
      console.error('Error response:', error);
      throw new Error(error.message || 'Failed to get recommendations');
    }

    const recommendations = await response.json();
    console.log('Received recommendations:', recommendations);
    console.log('Recommendations count:', recommendations.length);

    currentRecommendations = recommendations;

    console.log('About to hide form and show recommendations section');

    // Hide form and show recommendations
    const formSection = document.getElementById('problemForm');
    if (formSection) {
      formSection.style.display = 'none';
      console.log('Form hidden');
    }

    // Make sure recommendations section is visible
    const recommendationsSection = document.getElementById('recommendationsSection');
    if (recommendationsSection) {
      recommendationsSection.style.display = 'block';
      console.log('Recommendations section made visible');
    } else {
      console.warn('Recommendations section not found in DOM');
    }

    // Display the doctor cards
    displayRecommendations(recommendations);

    // Scroll to recommendations
    setTimeout(() => {
      const element = document.getElementById('recommendationsSection');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        console.log('Scrolled to recommendations section');
      }
    }, 100);

    // Update progress
    updateProgressSteps(2);
    showSuccess(`Great! We found ${recommendations.length} doctors matching your needs`);

    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;

  } catch (error) {
    console.error('Submission error:', error);
    console.error('Error message:', error.message);
    showError(error.message || 'Failed to get recommendations. Please try again.');
    
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = false;
    submitBtn.innerHTML = 'Find Doctors →';
  }
}

/**
 * Display doctor recommendations
 */
function displayRecommendations(recommendations) {
  const container = document.getElementById('recommendationsList');

  console.log('displayRecommendations called with:', recommendations);
  console.log('recommendations length:', recommendations ? recommendations.length : 'null');
  console.log('container element:', container);

  if (!recommendations || recommendations.length === 0) {
    console.log('No recommendations to display');
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #666;">
        <p style="font-size: 1.1rem; margin: 0;">No doctors found for your condition.</p>
        <p style="margin: 0.5rem 0 0 0;">Please try selecting different symptoms or diseases.</p>
      </div>
    `;
    return;
  }

  console.log('Rendering', recommendations.length, 'doctor cards');

  const doctorCards = recommendations.map((doctor, index) => {
    console.log(`Creating card for doctor ${index}:`, doctor);
    
    return `
    <div style="background: white; border: 2px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; transition: all 0.3s ease; cursor: pointer;" 
         onmouseover="this.style.boxShadow='0 10px 30px rgba(102, 126, 234, 0.2)'; this.style.borderColor='#667eea';"
         onmouseout="this.style.boxShadow='none'; this.style.borderColor='#e2e8f0';">
      <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
        <div style="width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 1.5rem; flex-shrink: 0;">
          ${doctor.name ? doctor.name.charAt(0).toUpperCase() : 'D'}
        </div>
        <div style="flex: 1;">
          <h3 style="margin: 0 0 0.25rem 0; font-size: 1.1rem; color: #1a202c;">Dr. ${doctor.name || 'Unknown'}</h3>
          <p style="margin: 0 0 0.25rem 0; color: #667eea; font-weight: 600;">${doctor.specialty || 'General Medicine'}</p>
          <p style="margin: 0; color: #999; font-size: 0.9rem;">${doctor.experience || 0} years experience</p>
        </div>
      </div>

      <div style="display: flex; gap: 1rem; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid #e2e8f0;">
        <div style="flex: 1;">
          <p style="margin: 0 0 0.25rem 0; color: #666; font-size: 0.85rem;">Rating</p>
          <p style="margin: 0; font-weight: 600; font-size: 1.1rem;">
            <span style="color: #ffc107;">★</span> ${doctor.ratings || 'N/A'}
          </p>
        </div>
        <div style="flex: 1;">
          <p style="margin: 0 0 0.25rem 0; color: #666; font-size: 0.85rem;">Consultation</p>
          <p style="margin: 0; font-weight: 600; font-size: 1.1rem; color: #27ae60;">₹${doctor.fees || 'N/A'}</p>
        </div>
        <div style="flex: 1;">
          <p style="margin: 0 0 0.25rem 0; color: #666; font-size: 0.85rem;">Availability</p>
          <p style="margin: 0; font-weight: 600; font-size: 0.95rem; color: #667eea;">${doctor.nextAvailable || 'Soon'}</p>
        </div>
      </div>

      <p style="margin: 0 0 1rem 0; color: #666; font-size: 0.9rem; line-height: 1.4;">
        <strong>Match Score: ${doctor.score || 0}/100</strong><br>
        ${doctor.matchReasons || 'Verified doctor'}
      </p>

      <div style="display: flex; gap: 0.75rem;">
        <button type="button" class="btn btn-outline" onclick="viewDoctorProfile(${doctor.id})" style="flex: 1; padding: 0.75rem; border: 1px solid #667eea; color: #667eea; background: white; border-radius: 6px; cursor: pointer; font-weight: 600;">
          View Profile
        </button>
        <button type="button" class="btn btn-primary" onclick="selectAndBookDoctor(${doctor.id}, '${doctor.name.replace(/'/g, "\\'")}', '${doctor.specialty || ''}')" style="flex: 1; padding: 0.75rem; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
          Book Now
        </button>
      </div>
    </div>
  `;
  }).join('');

  console.log('Doctor cards HTML length:', doctorCards.length);
  container.innerHTML = doctorCards;
  console.log('Container innerHTML set successfully');
}

/**
 * View doctor profile
 */
async function viewDoctorProfile(doctorId) {
  try {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_URL}/recommendations/doctor/${doctorId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      throw new Error('Failed to load doctor profile');
    }

    const doctor = await response.json();
    selectedDoctorId = doctorId;

    // Display in modal
    const modal = document.getElementById('doctorModal');
    const content = document.getElementById('modalContent');

    content.innerHTML = `
      <div style="display: flex; gap: 1.5rem; margin-bottom: 1.5rem; padding-bottom: 1.5rem; border-bottom: 2px solid #e0e0e0;">
        <div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 2rem; color: white; font-weight: bold;">
          ${doctor.name.charAt(0)}
        </div>
        <div style="flex: 1;">
          <h3 style="margin: 0 0 0.5rem 0; font-size: 1.5rem; color: #1a202c;">Dr. ${doctor.name}</h3>
          <p style="margin: 0 0 0.5rem 0; color: #667eea; font-weight: 600; font-size: 1.1rem;">${doctor.profile.specialty || 'General Medicine'}</p>
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
            <span style="color: #ffc107; font-size: 1.25rem;">★</span>
            <span style="font-weight: 600; font-size: 1.1rem;">${doctor.ratings.average}</span>
            <span style="color: #999;">(${doctor.ratings.total} reviews)</span>
          </div>
          <span style="padding: 4px 12px; border-radius: 12px; font-size: 0.875rem; font-weight: 600; background: #e8f5e9; color: #2e7d32; display: inline-block;">APPROVED</span>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
        <div style="background: #f7fafc; padding: 1rem; border-radius: 8px;">
          <p style="margin: 0 0 0.25rem 0; color: #666; font-size: 0.875rem; font-weight: 500;">Experience</p>
          <p style="margin: 0; font-weight: 600; font-size: 1.1rem; color: #2d3748;">${doctor.profile.experience || 0} years</p>
        </div>
        <div style="background: #f7fafc; padding: 1rem; border-radius: 8px;">
          <p style="margin: 0 0 0.25rem 0; color: #666; font-size: 0.875rem; font-weight: 500;">Consultation Fee</p>
          <p style="margin: 0; font-weight: 600; font-size: 1.1rem; color: #2563eb;">₹${doctor.profile.fees || 'N/A'}</p>
        </div>
      </div>

      ${doctor.profile.degree ? `
        <div style="margin-bottom: 1.5rem;">
          <p style="margin: 0 0 0.5rem 0; color: #2d3748; font-size: 0.875rem; font-weight: 600; text-transform: uppercase;">Education</p>
          <p style="margin: 0; color: #4a5568; line-height: 1.6;">${doctor.profile.degree}</p>
        </div>
      ` : ''}

      ${doctor.profile.nmcNumber ? `
        <div style="margin-bottom: 1.5rem;">
          <p style="margin: 0 0 0.5rem 0; color: #2d3748; font-size: 0.875rem; font-weight: 600; text-transform: uppercase;">NMC Number</p>
          <p style="margin: 0; color: #4a5568;">${doctor.profile.nmcNumber}</p>
        </div>
      ` : ''}

      ${doctor.profile.bio ? `
        <div style="margin-bottom: 1.5rem;">
          <p style="margin: 0 0 0.5rem 0; color: #2d3748; font-size: 0.875rem; font-weight: 600; text-transform: uppercase;">About</p>
          <p style="margin: 0; color: #4a5568; line-height: 1.6;">${doctor.profile.bio}</p>
        </div>
      ` : ''}

      ${doctor.availability.slots.length > 0 ? `
        <div style="margin-bottom: 1.5rem;">
          <p style="margin: 0 0 0.5rem 0; color: #2d3748; font-size: 0.875rem; font-weight: 600; text-transform: uppercase;">Available Slots</p>
          <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
            ${doctor.availability.slots.slice(0, 5).map(slot => `
              <span style="padding: 4px 12px; background: #e8f5e9; color: #2e7d32; border-radius: 6px; font-size: 0.85rem;">
                ${slot.date} ${slot.time}
              </span>
            `).join('')}
            ${doctor.availability.slots.length > 5 ? `<span style="padding: 4px 12px; background: #f0f0f0; color: #666; border-radius: 6px; font-size: 0.85rem;">+${doctor.availability.slots.length - 5} more</span>` : ''}
          </div>
        </div>
      ` : ''}

      ${doctor.reviews.length > 0 ? `
        <div style="margin-bottom: 1.5rem;">
          <p style="margin: 0 0 0.5rem 0; color: #2d3748; font-size: 0.875rem; font-weight: 600; text-transform: uppercase;">Recent Reviews</p>
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            ${doctor.reviews.slice(0, 3).map(review => `
              <div style="padding: 0.75rem; background: #f7fafc; border-left: 3px solid #ffc107; border-radius: 4px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
                  <strong style="color: #2d3748;">${review.reviewer}</strong>
                  <span style="color: #ffc107;">${'★'.repeat(review.rating)}</span>
                </div>
                <p style="margin: 0; color: #4a5568; font-size: 0.9rem;">${review.comment || 'No comment'}</p>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    `;

    modal.style.display = 'flex';

  } catch (error) {
    console.error('Error loading doctor profile:', error);
    showError('Failed to load doctor profile');
  }
}

/**
 * Select and book doctor
 */
function selectAndBookDoctor(doctorId, doctorName, specialty) {
  selectedDoctorId = doctorId;
  localStorage.setItem('selectedDoctorId', doctorId);
  localStorage.setItem('selectedDoctorName', doctorName);
  localStorage.setItem('selectedSpecialty', specialty);
  
  // Redirect to patient dashboard booking section
  window.location.href = 'patient-dashboard.html?section=book-appointment&step=slots';
}

/**
 * Update progress steps
 */
function updateProgressSteps(step) {
  document.querySelectorAll('.progress-step').forEach((el, index) => {
    el.classList.remove('active', 'completed');
    if (index < step - 1) {
      el.classList.add('completed');
    } else if (index === step - 1) {
      el.classList.add('active');
    }
  });
}

/**
 * Go back to previous page
 */
function goBack() {
  window.location.href = 'patient-dashboard.html';
}

/**
 * Go back to form
 */
function goBackToForm() {
  selectedDiseases = [];
  selectedSymptoms = [];
  document.getElementById('problemForm').style.display = 'block';
  document.getElementById('recommendationsSection').style.display = 'none';
  document.getElementById('diseaseSelect').value = '';
  document.getElementById('symptomSelect').value = '';
  updateDiseaseDisplay();
  updateSymptomDisplay();
  updateProgressSteps(1);
  clearMessages();
}

/**
 * Close modal
 */
function closeModal() {
  document.getElementById('doctorModal').style.display = 'none';
}

/**
 * Book doctor (from modal)
 */
function bookDoctor() {
  if (selectedDoctorId) {
    selectAndBookDoctor(selectedDoctorId, '', '');
  }
}

/**
 * Show error message
 */
function showError(message) {
  const errorBox = document.getElementById('errorMessage');
  errorBox.textContent = message;
  errorBox.style.display = 'block';
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    errorBox.style.display = 'none';
  }, 5000);
}

/**
 * Show success message
 */
function showSuccess(message) {
  const successBox = document.getElementById('successMessage');
  successBox.textContent = message;
  successBox.style.display = 'block';
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    successBox.style.display = 'none';
  }, 5000);
}

/**
 * Clear all messages
 */
function clearMessages() {
  document.getElementById('errorMessage').style.display = 'none';
  document.getElementById('successMessage').style.display = 'none';
}

/**
 * Start over - Reset form and go back
 */
function startOver() {
  selectedDiseases = [];
  selectedSymptoms = [];
  currentRecommendations = [];
  
  const formSection = document.getElementById('problemForm');
  const recommendationsSection = document.getElementById('recommendationsSection');
  
  if (formSection) formSection.style.display = 'block';
  if (recommendationsSection) recommendationsSection.style.display = 'none';
  
  // Reset form elements
  const diseaseSelect = document.getElementById('diseaseSelect');
  const symptomSelect = document.getElementById('symptomSelect');
  if (diseaseSelect) diseaseSelect.value = '';
  if (symptomSelect) symptomSelect.value = '';
  
  // Update displays
  updateDiseaseDisplay();
  updateSymptomDisplay();
  
  console.log('Started over - form reset');
}

/**
 * Close doctor profile modal
 */
function closeDoctorModal() {
  const modal = document.getElementById('doctorModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

/**
 * Book doctor - Create appointment
 */
async function selectAndBookDoctor(doctorId, doctorName, specialty) {
  try {
    console.log('Booking doctor:', doctorId, doctorName, specialty);
    
    const token = localStorage.getItem('token');
    if (!token) {
      showError('Please login to book an appointment');
      return;
    }

    // Show loading state
    const submitBtn = event.target;
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Booking...';

    // Schedule appointment for next available time (7 days from now at 10:00 AM)
    const appointmentDate = new Date();
    appointmentDate.setDate(appointmentDate.getDate() + 7);
    appointmentDate.setHours(10, 0, 0, 0);

    // Format date and times
    const dateStr = appointmentDate.toISOString().split('T')[0]; // YYYY-MM-DD
    const startTimeStr = '10:00'; // HH:MM
    const endTimeStr = '10:30';   // 30 minutes appointment

    console.log('Creating appointment with:', {
      doctorId,
      date: dateStr,
      startTime: startTimeStr,
      endTime: endTimeStr,
      mode: 'IN_PERSON'
    });

    // Call appointment creation API
    const response = await fetch(`${API_URL}/appointments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        doctorId: parseInt(doctorId),
        date: dateStr,
        startTime: startTimeStr,
        endTime: endTimeStr,
        mode: 'IN_PERSON'
      })
    });

    console.log('Appointment response status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to book appointment');
    }

    const result = await response.json();
    console.log('Appointment created:', result);

    // Show success message
    showSuccess(`✅ Appointment booked with ${doctorName}! Redirecting to your appointments...`);

    // Navigate to patient dashboard appointments section after 2 seconds
    setTimeout(() => {
      window.location.href = 'patient-dashboard.html?section=appointments';
    }, 2000);

    submitBtn.disabled = false;
    submitBtn.textContent = originalText;

  } catch (error) {
    console.error('Booking error:', error);
    showError(`Failed to book appointment: ${error.message}`);
    
    const submitBtn = event.target;
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Book Now';
    }
  }
}