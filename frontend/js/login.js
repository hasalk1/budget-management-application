// login.js

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-pass').value;

    const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    const result = await response.json();
    if (response.status === 200) {
        alert(result.message);  // Show success message
        // Store the token for authentication in localStorage or sessionStorage
        localStorage.setItem('authToken', result.token);
        window.location.href = 'dashboard.html';  // Redirect to dashboard
    } else {
        alert(result.error);  // Show error message
    }
});
