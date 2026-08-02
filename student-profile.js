// =========================================================
// STUDENT PROFILE PAGE INTERACTIONS
// - Burger menu + Quick Action: same behavior as the Dashboard
// - Populates profile fields from sample student data
//   (will come from the logged-in student's real record,
//   structured so it's easy to swap for real backend data)
// - Edit Profile: toggles all fields except Student Number
//   into an editable state; "Save Changes" exits edit mode.
//   No backend yet, so this only updates the page's own state.
// - Profile photo: clicking the edit badge (visible only in
//   edit mode) opens a file picker and previews the chosen image
// =========================================================

document.addEventListener("DOMContentLoaded", () => {

  // ---------------------------------------------------------
  // Sample student account -- replace with real session/user
  // data once backend authentication exists
  // ---------------------------------------------------------
  const SAMPLE_STUDENT = {
    fullName: "John Dela Cruz",
    studentNumber: "24-00001",
    course: "computer-engineering",
    yearLevel: "3",
    email: "john.delacruz@example.com",
    phone: "912-345-6789",
  };

  const fullNameInput = document.getElementById("profileFullName");
  const studentNumberInput = document.getElementById("profileStudentNumber");
  const courseSelect = document.getElementById("profileCourse");
  const yearLevelSelect = document.getElementById("profileYearLevel");
  const emailInput = document.getElementById("profileEmail");
  const phoneInput = document.getElementById("profilePhone");

  if (fullNameInput) fullNameInput.value = SAMPLE_STUDENT.fullName;
  if (studentNumberInput) studentNumberInput.value = SAMPLE_STUDENT.studentNumber;
  if (courseSelect) courseSelect.value = SAMPLE_STUDENT.course;
  if (yearLevelSelect) yearLevelSelect.value = SAMPLE_STUDENT.yearLevel;
  if (emailInput) emailInput.value = SAMPLE_STUDENT.email;
  if (phoneInput) phoneInput.value = SAMPLE_STUDENT.phone;

  // ---------------------------------------------------------
  // Burger sidebar (same behavior as the Student Dashboard)
  // ---------------------------------------------------------
  const hamburgerButton = document.getElementById("hamburgerButton");
  const sidebar = document.getElementById("sidebar");
  const sidebarOverlay = document.getElementById("sidebarOverlay");
  const sidebarClose = document.getElementById("sidebarClose");

  function openSidebar() {
    sidebar.classList.add("is-open");
    sidebarOverlay.hidden = false;
    requestAnimationFrame(() => sidebarOverlay.classList.add("is-open"));
  }

  function closeSidebar() {
    sidebar.classList.remove("is-open");
    sidebarOverlay.classList.remove("is-open");
    window.setTimeout(() => {
      sidebarOverlay.hidden = true;
    }, 250);
  }

  if (hamburgerButton) hamburgerButton.addEventListener("click", openSidebar);
  if (sidebarClose) sidebarClose.addEventListener("click", closeSidebar);
  if (sidebarOverlay) sidebarOverlay.addEventListener("click", closeSidebar);

  // ---------------------------------------------------------
  // Quick Action popup (same behavior as the Student Dashboard)
  // ---------------------------------------------------------
  const quickActionButton = document.getElementById("quickActionButton");
  const quickActionPanel = document.getElementById("quickActionPanel");

  function openQuickAction() {
    quickActionPanel.hidden = false;
    requestAnimationFrame(() => quickActionPanel.classList.add("is-open"));
    quickActionButton.setAttribute("aria-expanded", "true");
  }

  function closeQuickAction() {
    quickActionPanel.classList.remove("is-open");
    quickActionButton.setAttribute("aria-expanded", "false");
    window.setTimeout(() => {
      quickActionPanel.hidden = true;
    }, 200);
  }

  if (quickActionButton) {
    quickActionButton.addEventListener("click", (event) => {
      event.stopPropagation();
      const isOpen = quickActionPanel.classList.contains("is-open");
      if (isOpen) {
        closeQuickAction();
      } else {
        openQuickAction();
      }
    });
  }

  document.addEventListener("click", (event) => {
    if (
      quickActionPanel &&
      !quickActionPanel.hidden &&
      !quickActionPanel.contains(event.target) &&
      event.target !== quickActionButton
    ) {
      closeQuickAction();
    }
  });

  // "Send Request" doesn't have a destination page yet --
  // left wired up but intentionally not navigating anywhere
  const requestConsultationButton = document.getElementById("requestConsultationButton");
  if (requestConsultationButton) {
    requestConsultationButton.addEventListener("click", (event) => {
      event.preventDefault();
      // Future: navigate to the consultation request page once it exists
    });
  }

  // ---------------------------------------------------------
  // Edit Profile: toggles all fields except Student Number
  // between read-only and editable. No backend yet, so
  // "Save Changes" just exits edit mode -- the values already
  // live on the page's own inputs, ready for a real save call
  // to be wired in later.
  // ---------------------------------------------------------
  const editProfileButton = document.getElementById("editProfileButton");
  const profileInfoCard = document.querySelector(".profile-info-card");
  const profilePhotoEdit = document.getElementById("profilePhotoEdit");

  // Every editable field except Student Number (which stays
  // read-only/disabled at all times, per spec)
  const editableFields = [fullNameInput, courseSelect, yearLevelSelect, emailInput, phoneInput];

  let isEditing = false;

  function enterEditMode() {
    isEditing = true;
    editableFields.forEach((field) => {
      if (!field) return;
      field.readOnly = false;
      field.disabled = false;
    });
    profileInfoCard.classList.add("is-editing");
    profilePhotoEdit.hidden = false;
    editProfileButton.textContent = "Save Changes";
  }

  function exitEditMode() {
    isEditing = false;
    editableFields.forEach((field) => {
      if (!field) return;
      // <select> elements use disabled to lock them (readOnly
      // isn't meaningful on selects); text/email/tel inputs use readOnly
      if (field.tagName === "SELECT") {
        field.disabled = true;
      } else {
        field.readOnly = true;
      }
    });
    profileInfoCard.classList.remove("is-editing");
    profilePhotoEdit.hidden = true;
    editProfileButton.textContent = "Edit Profile";

    // Future: send the updated field values to the backend here
  }

  if (editProfileButton) {
    editProfileButton.addEventListener("click", () => {
      if (isEditing) {
        exitEditMode();
      } else {
        enterEditMode();
      }
    });
  }

  // ---------------------------------------------------------
  // Profile photo upload preview -- only reachable while in
  // edit mode, since the edit badge is hidden otherwise
  // ---------------------------------------------------------
  const profilePhotoInput = document.getElementById("profilePhotoInput");
  const profilePhoto = document.getElementById("profilePhoto");

  if (profilePhotoInput && profilePhoto) {
    profilePhotoInput.addEventListener("change", () => {
      const file = profilePhotoInput.files && profilePhotoInput.files[0];
      if (!file) return;

      const previewUrl = URL.createObjectURL(file);
      profilePhoto.src = previewUrl;

      // Future: upload `file` to the backend and use the
      // returned URL instead of this local preview
    });
  }

});