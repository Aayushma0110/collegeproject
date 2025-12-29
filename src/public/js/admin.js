
export function renderAppointmentsTable(appointments, tableId) {
    const tbody = document.querySelector(`#${tableId} tbody`);
    tbody.innerHTML = "";
    appointments.forEach(app => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${app.id}</td>
            <td>${app.patient}</td>
            <td>${app.doctor}</td>
            <td><span class="badge ${app.status.toLowerCase()}">${app.status}</span></td>
            <td>${app.date}</td>
        `;
        tbody.appendChild(row);
    });
}
