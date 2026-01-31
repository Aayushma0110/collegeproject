const API_URL = "http://localhost:5050/api"

// Handle login form submission
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault()

  const email = document.getElementById("email").value
  const password = document.getElementById("password").value

  if (!email || !password) {
    alert("Please enter email and password")
    return
  }

  try {
    console.log("Attempting login to:", `${API_URL}/users/login`)
    const res = await fetch(`${API_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    
    console.log("Response status:", res.status)
    
    const data = await res.json()
    console.log("Response data:", data)

    if (!res.ok) {
      alert(data.message || "Login failed")
      return
    }

    // Save token and user
    if (data.token) localStorage.setItem("token", data.token)
    if (data.user) localStorage.setItem("userData", JSON.stringify(data.user))

    const user = data.user || JSON.parse(localStorage.getItem("userData") || '{}')
    const role = (user.role || user?.role || "PATIENT").toUpperCase()

    console.log("User role:", role)

    // Redirect based on role
    if (role === "PATIENT") {
      window.location.href = "patient-dashboard.html"
    } else if (role === "DOCTOR") {
      window.location.href = "doctor-dashboard.html"
    } else if (role === "ADMIN") {
      window.location.href = "admin-dashboard.html"
    } else {
      window.location.href = "index.html"
    }
  } catch (err) {
    console.error("Login error details:", err)
    alert(`Network error during login. Please check:\n1. Backend server is running on port 5050\n2. Check browser console for details\n\nError: ${err.message}`)
  }
})
