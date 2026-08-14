// =========================================================
// FACULTY-DIRECTORY.JS
// Page-specific behavior for the Faculty Directory:
// - Renders faculty cards from FACULTY_DIRECTORY_DATA
// - Search-as-you-type by name or specialization/program
// - Combines with the shared status filter (student-shared.js)
// - "View Profile" opens the split-view profile panel with an
//   animation and populates it from the same data object
//
// NOTE -- TEST DATA ONLY:
// We are testing from a student account and there is no
// backend yet, so FACULTY_DIRECTORY_DATA below is prototype
// data. Faculty status/availability is currently controlled
// here. Once real faculty accounts exist, this array (and the
// render/lookup functions that use it) should be replaced by
// data fetched from those accounts -- the rest of the page
// logic (search, filter, profile panel, animation) should not
// need to change.
// =========================================================

document.addEventListener("DOMContentLoaded", () => {

  // ---------------------------------------------------------
  // TEST DATA -- replace with real faculty account data later
  // ---------------------------------------------------------
  // All faculty currently share one test office/room. Change this
  // single constant when real office assignments exist per faculty.
  const DEFAULT_OFFICE = "Room 305";

  const FACULTY_DIRECTORY_DATA = [
    {
      id: "maria-nina-sales",
      lastName: "Sales",
      fullName: "Engr. Maria Nina Sales",
      program: "Computer Engineering",
      office: DEFAULT_OFFICE,
      status: "available",
      statusLabel: "Available",
      photo: "images/professor-maria-nina-sales.jpg",
      hours: [
        { day: "Monday", time: "9:00 AM - 11:00 AM" },
        { day: "Tuesday", time: "1:00 PM - 3:00 PM" },
        { day: "Wednesday", time: "9:00 AM - 11:00 AM" },
        { day: "Thursday", time: "1:00 PM - 3:00 PM" },
        { day: "Friday", time: "10:00 AM - 12:00 PM" },
      ],
    },
    {
      id: "bernard-bisuecos",
      lastName: "Bisuecos",
      fullName: "Engr. Bernard Bisuecos",
      program: "Computer Engineering",
      office: DEFAULT_OFFICE,
      status: "onleave",
      statusLabel: "On Leave",
      photo: "images/professor-bernard-bisuecos.jpg",
      hours: [
        { day: "Monday", time: "Unavailable" },
        { day: "Tuesday", time: "Unavailable" },
        { day: "Wednesday", time: "10:00 AM - 12:00 PM" },
        { day: "Thursday", time: "Unavailable" },
        { day: "Friday", time: "Unavailable" },
      ],
    },
    {
      id: "mervin-molina",
      lastName: "Molina",
      fullName: "Engr. Mervin Molina",
      program: "Computer Engineering",
      office: DEFAULT_OFFICE,
      status: "teaching",
      statusLabel: "Teaching Class",
      photo: "images/professor-mervin-molina.jpg",
      hours: [
        { day: "Monday", time: "2:00 PM - 4:00 PM" },
        { day: "Tuesday", time: "9:00 AM - 10:00 AM" },
        { day: "Wednesday", time: "2:00 PM - 4:00 PM" },
        { day: "Thursday", time: "9:00 AM - 10:00 AM" },
        { day: "Friday", time: "1:00 PM - 2:00 PM" },
      ],
    },
    {
      id: "rose-onate",
      lastName: "Onate",
      fullName: "Engr. Rose Onate",
      program: "Computer Engineering",
      office: DEFAULT_OFFICE,
      status: "meeting",
      statusLabel: "Meeting",
      photo: "images/professor-rose-onate.jpg",
      hours: [
        { day: "Monday", time: "10:00 AM - 12:00 PM" },
        { day: "Tuesday", time: "10:00 AM - 12:00 PM" },
        { day: "Wednesday", time: "1:00 PM - 3:00 PM" },
        { day: "Thursday", time: "10:00 AM - 12:00 PM" },
        { day: "Friday", time: "9:00 AM - 11:00 AM" },
      ],
    },
    {
      id: "melody-paned",
      lastName: "Paned",
      fullName: "Engr. Melody Paned",
      program: "Computer Engineering",
      office: DEFAULT_OFFICE,
      status: "offline",
      statusLabel: "Offline",
      photo: "images/professor-melody-paned.jpg",
      hours: [
        { day: "Monday", time: "9:00 AM - 11:00 AM" },
        { day: "Tuesday", time: "Unavailable" },
        { day: "Wednesday", time: "9:00 AM - 11:00 AM" },
        { day: "Thursday", time: "Unavailable" },
        { day: "Friday", time: "9:00 AM - 11:00 AM" },
      ],
    },
  ];

  const STATUS_DOT_CLASS = {
    available: "status-available",
    teaching: "status-teaching",
    meeting: "status-meeting",
    consultation: "status-consultation",
    onleave: "status-onleave",
    offline: "status-offline",
  };

  // ---------------------------------------------------------
  // Element references
  // ---------------------------------------------------------
  const facultyListEl = document.getElementById("facultyList");
  const noResultsMessage = document.getElementById("noResultsMessage");
  const searchInput = document.getElementById("facultySearchInput");
  const directoryContainer = document.getElementById("directoryContainer");
  const profilePanel = document.getElementById("directoryProfilePanel");

  let selectedFacultyId = null;

  // ---------------------------------------------------------
  // Render the faculty list from FACULTY_DIRECTORY_DATA
  // ---------------------------------------------------------
  function renderFacultyList() {
    facultyListEl.innerHTML = "";

    FACULTY_DIRECTORY_DATA.forEach((faculty) => {
      const card = document.createElement("article");
      card.className = "faculty-card";
      card.dataset.status = faculty.status;
      card.dataset.facultyId = faculty.id;

      const dotClass = STATUS_DOT_CLASS[faculty.status] || "status-offline";

      card.innerHTML = `
        <img src="${faculty.photo}" alt="${faculty.fullName}" class="faculty-photo">
        <div class="faculty-info">
          <p class="faculty-name">Engr. ${faculty.lastName}</p>
          <p class="faculty-meta faculty-meta-row">
            <span>${faculty.statusLabel}</span>
            <span class="faculty-meta-dot" aria-hidden="true">&middot;</span>
            <span>${faculty.program}</span>
            <span class="faculty-meta-dot" aria-hidden="true">&middot;</span>
            <span>${faculty.office}</span>
          </p>
        </div>
        <span class="status-dot ${dotClass} faculty-status-dot" aria-hidden="true"></span>
        <button type="button" class="view-profile-button" data-faculty-id="${faculty.id}">View Profile</button>
      `;

      facultyListEl.appendChild(card);
    });

    // Wire up "View Profile" buttons after render
    Array.from(facultyListEl.querySelectorAll(".view-profile-button")).forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        openProfile(button.dataset.facultyId);
      });
    });
  }

  // ---------------------------------------------------------
  // Search + status filter (status comes from student-shared.js)
  // ---------------------------------------------------------
  function applyFilters() {
    const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
    const activeStatus = (window.StudentShared && window.StudentShared.activeStatus) || null;
    const cards = Array.from(facultyListEl.querySelectorAll(".faculty-card"));
    let visibleCount = 0;

    cards.forEach((card) => {
      const faculty = FACULTY_DIRECTORY_DATA.find((f) => f.id === card.dataset.facultyId);
      const nameMatch = faculty.fullName.toLowerCase().includes(query);
      const programMatch = faculty.program.toLowerCase().includes(query);
      const matchesSearch = query === "" || nameMatch || programMatch;
      const matchesStatus = !activeStatus || faculty.status === activeStatus;
      const matches = matchesSearch && matchesStatus;

      card.hidden = !matches;
      if (matches) visibleCount += 1;
    });

    if (noResultsMessage) {
      noResultsMessage.hidden = visibleCount > 0;
    }
  }

  if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
  }

  // student-shared.js dispatches this when a status filter option is toggled
  document.addEventListener("statusfilterchange", applyFilters);

  // ---------------------------------------------------------
  // Profile panel: builds the markup for the selected faculty,
  // then animates the layout into the split (list-left,
  // profile-right) view.
  // ---------------------------------------------------------
  function buildProfileMarkup(faculty) {
    const dotClass = STATUS_DOT_CLASS[faculty.status] || "status-offline";

    const hoursRows = faculty.hours.map((entry) => `
      <li class="profile-hours-row">
        <span class="profile-hours-day">${entry.day}</span>
        <span class="profile-hours-time">${entry.time}</span>
      </li>
    `).join("");

    return `
      <img src="${faculty.photo}" alt="${faculty.fullName}" class="profile-photo">
      <p class="profile-name">${faculty.fullName}</p>
      <p class="profile-status-row">
        <span class="status-dot ${dotClass}" aria-hidden="true"></span>
        <span class="profile-status-label">${faculty.statusLabel}</span>
      </p>
      <p class="profile-program">${faculty.program}</p>
      <p class="profile-office">${faculty.office}</p>

      <h2 class="profile-section-title">Available Hours</h2>
      <ul class="profile-hours-list">
        ${hoursRows}
      </ul>

      <a
        href="request-consultation.html?facultyId=${encodeURIComponent(faculty.id)}"
        class="request-consultation-button"
      >
        Request Consultation
      </a>
    `;
  }

  function openProfile(facultyId) {
    const faculty = FACULTY_DIRECTORY_DATA.find((f) => f.id === facultyId);
    if (!faculty) return;

    selectedFacultyId = facultyId;

    // Highlight the selected card
    Array.from(facultyListEl.querySelectorAll(".faculty-card")).forEach((card) => {
      card.classList.toggle("is-selected", card.dataset.facultyId === facultyId);
    });

    profilePanel.innerHTML = buildProfileMarkup(faculty);
    profilePanel.hidden = false;
    directoryContainer.classList.add("is-split");

    // Let the browser paint `hidden` removal first so the
    // opacity/transform transition actually animates in
    requestAnimationFrame(() => profilePanel.classList.add("is-visible"));
  }

  // ---------------------------------------------------------
  // Initial render
  // ---------------------------------------------------------
  renderFacultyList();
  applyFilters();

});