
export async function login(email, password) {
    const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ email, password })
    });
    return res.json();
}

export async function register(name, email, password, role) {
    const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ name, email, password, role })
    });
    return res.json();
}

export function storeUserSession(user, token) {
    localStorage.setItem("token", token);
    localStorage.setItem("role", user.role);
}

export function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/src/pages/auth/login.html";
}
