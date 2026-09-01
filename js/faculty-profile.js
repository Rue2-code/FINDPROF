// =========================================================
// FACULTY PROFILE -- PAGE-SPECIFIC INTERACTIONS
// - View/Edit mode toggle
// - Custom Program dropdown (data-driven, not a native <select>)
// - Name / Email / Phone validation on Save
// - Faculty ID always read-only, never editable
//
// Represents the currently logged-in faculty account. Prototype
// data for now -- once the backend exists, FACULTY_ACCOUNT should
// be populated from the logged-in session instead, and this same
// object should feed the Faculty Directory and other faculty
// pages so there's a single source of truth per account.
//
// Shared shell behavior (navbar, sidebar, quick action,
// notification bell) lives in faculty-shared.js.
// =========================================================

// ---------------------------------------------------------
// Prototype logged-in faculty account -- replace with real
// session data once backend authentication exists.
// ---------------------------------------------------------
const FACULTY_ACCOUNT = {
  name: "Engr. Juan Dela Cruz",
  facultyId: "24-00001",
  program: "Computer Engineering",
  email: "juan.delacruz@cvsu.edu.ph",
  phone: "912-345-6789", // local part only; +63 prefix is fixed in the UI
};

// Structured so more programs can be added later without
// touching any markup or logic -- just extend this array.
const PROGRAM_OPTIONS = ["Computer Engineering"];

document.addEventListener("DOMContentLoaded", () => {

  // ---------------------------------------------------------
  // Element references
  // ---------------------------------------------------------
  const editProfileButton = document.getElementById("editProfileButton");

  const viewSection = document.getElementById("facultyProfileView");
  const editForm = document.getElementById("facultyProfileEdit");

  const viewName = document.getElementById("viewFacultyName");
  const viewId = document.getElementById("viewFacultyId");
  const viewProgram = document.getElementById("viewFacultyProgram");
  const viewEmail = document.getElementById("viewFacultyEmail");
  const viewPhone = document.getElementById("viewFacultyPhone");

  const nameInput = document.getElementById("editFacultyName");
  const nameError = document.getElementById("nameError");
  const idInput = document.getElementById("editFacultyId");
  const emailInput = document.getElementById("editFacultyEmail");
  const emailError = document.getElementById("emailError");
  const phoneInput = document.getElementById("editFacultyPhone");
  const phoneError = document.getElementById("phoneError");
  const phoneWrap = phoneInput ? phoneInput.closest(".faculty-phone-input-wrap") : null;

  const programDropdown = document.getElementById("programDropdown");
  const programTrigger = document.getElementById("programDropdownTrigger");
  const programValueEl = document.getElementById("programDropdownValue");
  const programList = document.getElementById("programDropdownList");

  const saveButton = document.getElementById("saveProfileButton");
  const saveSuccessMessage = document.getElementById("saveSuccessMessage");

  let selectedProgram = FACULTY_ACCOUNT.program;

  // ---------------------------------------------------------
  // Render the account's current data into view mode
  // ---------------------------------------------------------
  function renderViewMode() {
    viewName.textContent = FACULTY_ACCOUNT.name;
    viewId.textContent = FACULTY_ACCOUNT.facultyId;
    viewProgram.textContent = FACULTY_ACCOUNT.program;
    viewEmail.textContent = FACULTY_ACCOUNT.email;
    viewPhone.textContent = `+63 ${FACULTY_ACCOUNT.phone}`;
  }

  renderViewMode();

  // ---------------------------------------------------------
  // Program dropdown -- built from PROGRAM_OPTIONS so future
  // programs can be added just by extending that array.
  // ---------------------------------------------------------
  function renderProgramOptions() {
    programList.innerHTML = "";
    PROGRAM_OPTIONS.forEach((program) => {
      const li = document.createElement("li");
      li.className = "faculty-dropdown-option";
      li.setAttribute("role", "option");
      li.dataset.value = program;
      li.textContent = program;
      if (program === selectedProgram) {
        li.classList.add("is-selected");
        li.setAttribute("aria-selected", "true");
      } else {
        li.setAttribute("aria-selected", "false");
      }
      programList.appendChild(li);
    });
  }

  function openProgramDropdown() {
    renderProgramOptions();
    programList.hidden = false;
    requestAnimationFrame(() => programList.classList.add("is-open"));
    programTrigger.setAttribute("aria-expanded", "true");
  }

  function closeProgramDropdown() {
    programList.classList.remove("is-open");
    programTrigger.setAttribute("aria-expanded", "false");
    window.setTimeout(() => {
      programList.hidden = true;
    }, 150); // matches the dropdown's CSS transition duration
  }

  if (programTrigger) {
    programTrigger.addEventListener("click", (event) => {
      event.stopPropagation();
      const isOpen = programList.classList.contains("is-open");
      if (isOpen) {
        closeProgramDropdown();
      } else {
        openProgramDropdown();
      }
    });
  }

  if (programList) {
    programList.addEventListener("click", (event) => {
      const option = event.target.closest(".faculty-dropdown-option");
      if (!option) return;
      selectedProgram = option.dataset.value;
      programValueEl.textContent = selectedProgram;
      closeProgramDropdown();
    });
  }

  document.addEventListener("click", (event) => {
    if (
      programDropdown &&
      !programList.hidden &&
      !programDropdown.contains(event.target)
    ) {
      closeProgramDropdown();
    }
  });

  // ---------------------------------------------------------
  // Phone number formatting -- digits only, auto-hyphenated
  // as 3-3-4 (matches the Philippine mobile format used
  // elsewhere in Prof Consult, e.g. 912-345-6789).
  // ---------------------------------------------------------
  function formatPhoneInput(rawValue) {
    const digits = rawValue.replace(/\D/g, "").slice(0, 10);
    const part1 = digits.slice(0, 3);
    const part2 = digits.slice(3, 6);
    const part3 = digits.slice(6, 10);
    return [part1, part2, part3].filter(Boolean).join("-");
  }

  if (phoneInput) {
    phoneInput.addEventListener("input", () => {
      phoneInput.value = formatPhoneInput(phoneInput.value);
    });
  }

  // ---------------------------------------------------------
  // Validation
  // ---------------------------------------------------------
  function showFieldError(inputEl, errorEl, message, wrapEl) {
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.hidden = false;
    }
    if (inputEl) inputEl.classList.add("has-error");
    if (wrapEl) wrapEl.classList.add("has-error");
  }

  function clearFieldError(inputEl, errorEl, wrapEl) {
    if (errorEl) {
      errorEl.textContent = "";
      errorEl.hidden = true;
    }
    if (inputEl) inputEl.classList.remove("has-error");
    if (wrapEl) wrapEl.classList.remove("has-error");
  }

  function validateName() {
    const value = nameInput.value.trim();
    if (value === "") {
      showFieldError(nameInput, nameError, "Faculty name cannot be empty.");
      return false;
    }
    clearFieldError(nameInput, nameError);
    return true;
  }

  function validateEmail() {
    const value = emailInput.value.trim();
    // Requires a non-empty local part, an @, a domain with at
    // least one dot, and a TLD of 2+ letters -- rejects
    // "john.example.com", "john@", "@gmail.com", and empty values.
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (value === "" || !emailPattern.test(value)) {
      showFieldError(emailInput, emailError, "Enter a valid email address.");
      return false;
    }
    clearFieldError(emailInput, emailError);
    return true;
  }

  function validatePhone() {
    const value = phoneInput.value.trim();
    // Philippine mobile local part: 9XX-XXX-XXXX (10 digits,
    // starts with 9 -- the digit that follows the +63 prefix
    // on a standard PH mobile number).
    const phonePattern = /^9\d{2}-\d{3}-\d{4}$/;
    if (!phonePattern.test(value)) {
      showFieldError(
        phoneInput,
        phoneError,
        "Enter a valid Philippine mobile number (e.g. 912-345-6789).",
        phoneWrap
      );
      return false;
    }
    clearFieldError(phoneInput, phoneError, phoneWrap);
    return true;
  }

  // ---------------------------------------------------------
  // Enter / exit edit mode
  // ---------------------------------------------------------
  function enterEditMode() {
    // Populate the edit form from the current account data
    nameInput.value = FACULTY_ACCOUNT.name;
    idInput.value = FACULTY_ACCOUNT.facultyId; // display only, never submitted as editable
    selectedProgram = FACULTY_ACCOUNT.program;
    programValueEl.textContent = selectedProgram;
    emailInput.value = FACULTY_ACCOUNT.email;
    phoneInput.value = FACULTY_ACCOUNT.phone;

    clearFieldError(nameInput, nameError);
    clearFieldError(emailInput, emailError);
    clearFieldError(phoneInput, phoneError, phoneWrap);

    if (saveSuccessMessage) {
      saveSuccessMessage.classList.remove("is-visible");
      saveSuccessMessage.hidden = true;
    }

    viewSection.hidden = true;
    editForm.hidden = false;
    editProfileButton.hidden = true;
  }

  function exitEditMode() {
    editForm.hidden = true;
    viewSection.hidden = false;
    editProfileButton.hidden = false;
    closeProgramDropdown();
  }

  if (editProfileButton) {
    editProfileButton.addEventListener("click", enterEditMode);
  }

  // ---------------------------------------------------------
  // Save -- validates all fields; only applies and exits edit
  // mode if everything passes. Faculty ID is never read from
  // the form (it's read-only and never changes).
  // ---------------------------------------------------------
  function handleSave() {
    // Do nothing if not currently editing -- Save only acts on
    // the edit form's values.
    if (editForm.hidden) return;

    const isNameValid = validateName();
    const isEmailValid = validateEmail();
    const isPhoneValid = validatePhone();

    if (!isNameValid || !isEmailValid || !isPhoneValid) {
      // Keep edit mode active; validation feedback is already
      // shown inline on the offending field(s).
      return;
    }

    FACULTY_ACCOUNT.name = nameInput.value.trim();
    FACULTY_ACCOUNT.program = selectedProgram;
    FACULTY_ACCOUNT.email = emailInput.value.trim();
    FACULTY_ACCOUNT.phone = phoneInput.value.trim();
    // FACULTY_ACCOUNT.facultyId intentionally left untouched --
    // the Faculty ID field is never a source of updates.

    renderViewMode();
    exitEditMode();

    if (saveSuccessMessage) {
      saveSuccessMessage.hidden = false;
      requestAnimationFrame(() => saveSuccessMessage.classList.add("is-visible"));
      window.setTimeout(() => {
        saveSuccessMessage.classList.remove("is-visible");
        window.setTimeout(() => {
          saveSuccessMessage.hidden = true;
        }, 250);
      }, 2500);
    }
  }

  if (saveButton) {
    saveButton.addEventListener("click", handleSave);
  }

});