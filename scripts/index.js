// Index page JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in and redirect appropriately
    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');

    // Add click handlers for navigation
    const loginBtn = document.querySelector('a[href="login.html"]');
    const registerBtn = document.querySelector('a[href="register.html"]');

    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            if (token) {
                e.preventDefault();
                // Redirect based on user role
                const role = (userData.role || '').toUpperCase();
                if (role === 'PATIENT') {
                    window.location.href = 'patient-dashboard.html';
                } else if (role === 'DOCTOR') {
                    window.location.href = 'doctor-dashboard.html';
                } else if (role === 'ADMIN') {
                    window.location.href = 'admin-dashboard.html';
                } else {
                    window.location.href = 'login.html';
                }
            }
        });
    }

    // Handle "Find a Doctor" button
    const findDoctorBtn = document.querySelector('a[href="find-doctors.html"]');
    if (findDoctorBtn) {
        findDoctorBtn.addEventListener('click', (e) => {
            if (!token) {
                e.preventDefault();
                window.location.href = 'login.html';
            } else {
                // If logged in, go to problem selection
                e.preventDefault();
                window.location.href = 'problem-selection.html';
            }
        });
    }
});