// Redirect if already logged in
    if (localStorage.getItem('isLoggedIn') === 'true') {
        window.location.href = 'dashboard.html';
    }

    document.getElementById('loginForm').addEventListener('submit', function(e) {
      e.preventDefault();
      
      const userVal = document.getElementById('username').value.trim();
      const passVal = document.getElementById('password').value.trim();
      
      // Fetch dynamic credentials (or use defaults if they haven't been changed yet)
      const validUser = localStorage.getItem('matkaAdminUser') || 'admin';
      const validPass = localStorage.getItem('matkaAdminPass') || 'password';

      const msgBox = document.getElementById('message');

      if (userVal === validUser && passVal === validPass) {
        // Success: Set session and redirect
        localStorage.setItem('isLoggedIn', 'true');
        window.location.href = 'dashboard.html';
      } else {
        // Fail: Show error
        msgBox.textContent = "Invalid username or password.";
      }
    });