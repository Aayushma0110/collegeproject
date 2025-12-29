// src/scripts/patient.js
export function renderDoctors(doctors, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";
    doctors.forEach(doc => {
        const div = document.createElement("div");
        div.className = "card doctor-card";
        div.innerHTML = `
            <h3>${doc.name}</h3>
            <p>${doc.specialty}</p>
            <p>⭐ ${doc.rating}</p>
            <button class="primary btn-book">Book Appointment</button>
        `;
        container.appendChild(div);
    });

    document.querySelectorAll(".btn-book").forEach(btn => {
        btn.addEventListener("click", () => {
            alert("Booking feature coming soon!");
        });
    });
}
