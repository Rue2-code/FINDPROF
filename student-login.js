// =========================================================
// STUDENT LOGIN PAGE INTERACTIONS
// - Back -> choose-account.html
// - Login form submit -> student-dashboard.html
// - Forgot Password -> forgot-password.html?from=student
// - Create Student Account -> create-student-account.html
// - Remember Me custom circular checkbox toggle
// =========================================================

document.addEventListener("DOMContentLoaded", () => {

  // ---------------------------------------------------------
  // Back -> choose-account.html
  // ---------------------------------------------------------
  document.querySelectorAll('[data-nav="back"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      window.location.href = "choose-account.html";
    });
  });

  // ---------------------------------------------------------
  // Forgot Password -> forgot-password.html
  // (page not built yet -- this link will 404 until it exists)
  // ---------------------------------------------------------
  document.querySelectorAll('[data-nav="forgot-password"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      window.location.href = "forgot-password.html?from=student";
    });
  });

  // ---------------------------------------------------------
  // Create Student Account -> create-student-account.html
  // (page not built yet -- this link will 404 until it exists)
  // ---------------------------------------------------------
  document.querySelectorAll('[data-nav="create-account"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      window.location.href = "create-student-account.html";
    });
  });

  // ---------------------------------------------------------
  // Show/Hide password toggle
  // ---------------------------------------------------------
  document.querySelectorAll(".password-toggle").forEach((toggleButton) => {
    toggleButton.addEventListener("click", () => {
      const targetId = toggleButton.getAttribute("data-target");
      const targetInput = document.getElementById(targetId);
      if (!targetInput) return;

      const isHidden = targetInput.type === "password";
      targetInput.type = isHidden ? "text" : "password";
      toggleButton.textContent = isHidden ? "Hide" : "Show";
      toggleButton.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
    });
  });

  // ---------------------------------------------------------
  // TEMPORARY FRONTEND-ONLY LOGIN VALIDATION
  // No backend yet -- checks against hardcoded test credentials.
  // Replace this entire block with a real API call once the
  // backend exists; everything else on the page stays the same.
  // ---------------------------------------------------------
  const TEST_CREDENTIALS = {
    email: "student@test.com",
    username: "student01",
    password: "Student123",
  };

  const loginForm = document.getElementById("studentLoginForm");
  const emailInput = document.getElementById("studentEmail");
  const passwordInput = document.getElementById("studentPassword");
  const loginError = document.getElementById("loginError");

  if (loginForm) {
    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const enteredIdentifier = emailInput.value.trim().toLowerCase();
      const enteredPassword = passwordInput.value;

      const identifierMatches =
        enteredIdentifier === TEST_CREDENTIALS.email ||
        enteredIdentifier === TEST_CREDENTIALS.username;
      const passwordMatches = enteredPassword === TEST_CREDENTIALS.password;

      if (identifierMatches && passwordMatches) {
        loginError.hidden = true;
        window.location.href = "student-dashboard.html";
      } else {
        loginError.hidden = false;
      }
    });
  }

});