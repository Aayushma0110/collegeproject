// src/scripts/doctor.js
export function renderAppointments(appointments, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";
    appointments.forEach(app => {
        const div = document.createElement("div");
        div.className = "card appointment-card";
        div.innerHTML = `
            <h4>Appointment with ${app.patient}</h4>
            <p>Mode: ${app.mode}</p>
            <p>Status: <span class="badge ${app.status.toLowerCase()}">${app.status}</span></p>
            <p>Time: ${app.time}</p>
        `;
        container.appendChild(div);
    });
}
