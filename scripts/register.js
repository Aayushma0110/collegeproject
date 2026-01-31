// Handle role selection to show/hide fields
document.getElementById("role").addEventListener("change", function () {
  const role = this.value
  const patientFields = document.getElementById("patientFields")
  const doctorFields = document.getElementById("doctorFields")

  if (role === "PATIENT") {
    patientFields.style.display = "block"
    doctorFields.style.display = "none"
  } else if (role === "DOCTOR") {
    patientFields.style.display = "none"
    doctorFields.style.display = "block"
  } else {
    patientFields.style.display = "none"
    doctorFields.style.display = "none"
  }
})

const API_URL = "http://localhost:5050/api"

// Handle registration form submission
document.getElementById("registerForm").addEventListener("submit", async function (e) {
  e.preventDefault()

  const formData = new FormData(this)
  const role = formData.get("role")

  if (!role) {
    alert("Please select a role")
    return
  }

  const payload = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: role,
  }

  // Add phone number if provided
  const phone = formData.get("phone") || formData.get("phoneNumber")
  if (phone) {
    payload.phoneNumber = [phone]
  }

  if (!payload.name || !payload.email || !payload.password) {
    alert("Please fill in all required fields.")
    return
  }

  // include doctor-specific fields if present
  if (role === "DOCTOR") {
    const specialty = formData.get("specialty")
    if (specialty) payload.specialty = specialty
  }

  try {
    const res = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const data = await res.json()

    if (!res.ok) {
      alert(data.message || data.error || "Registration failed")
      return
    }

    alert(`Registration successful! ${role === "DOCTOR" ? "Please wait for admin verification." : "You can now login."}`)
    window.location.href = "login.html"
  } catch (err) {
    console.error("Registration error:", err)
    alert("Network error during registration. Please check console for details.")
  }
})
