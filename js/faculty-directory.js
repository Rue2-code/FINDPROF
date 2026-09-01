// =========================================================
// STUDENT-SHARED.JS
// Shared behavior for every Student-side page:
// - Burger menu: slide-in sidebar with dim/blur overlay
// - Quick Action: fade/slide popup (Find Faculty / Send Request)
// - Notification bell: navigates to notifications.html
// - Status filter popup: fade/slide open + outside-click close
//
// Page-specific files (e.g. faculty-directory.js) should call
// StudentShared.init() is NOT required -- this file wires
// itself up on DOMContentLoaded. Page-specific scripts should
// only add their own listeners for their own elements (e.g.
// the faculty search input, faculty cards, etc.) and should
// NOT re-declare any of the listeners below.
// =========================================================

document.addEventListener("DOMContentLoaded", () => {

  // ---------------------------------------------------------
  // Burger sidebar
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
  // Quick Action popup
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
      isOpen ? closeQuickAction() : openQuickAction();
    });
  }

  // "Send Request" doesn't have a fixed destination yet when no
  // faculty is pre-selected -- left wired up but intentionally
  // not navigating anywhere until that flow is defined
  const requestConsultationButton = document.getElementById("requestConsultationButton");
  if (requestConsultationButton) {
    requestConsultationButton.addEventListener("click", (event) => {
      event.preventDefault();
      // Future: navigate to the consultation request page once it exists
    });
  }

  // ---------------------------------------------------------
  // Notification bell -- navigates to notifications.html
  // ---------------------------------------------------------
  const notificationBellButton = document.getElementById("notificationBellButton");
  if (notificationBellButton) {
    notificationBellButton.addEventListener("click", () => {
      window.location.href = "notifications.html";
    });
  }

  // ---------------------------------------------------------
  // Status filter popup (search bar + filter icon)
  // Page-specific JS reads `window.StudentShared.activeStatus`
  // and listens for the "statusfilterchange" event to re-apply
  // its own search/filter logic.
  // ---------------------------------------------------------
  const filterButton = document.getElementById("filterButton");
  const filterPanel = document.getElementById("filterPanel");
  const filterOptions = filterPanel
    ? Array.from(filterPanel.querySelectorAll(".filter-option"))
    : [];

  window.StudentShared = window.StudentShared || {};
  window.StudentShared.activeStatus = null;

  function openFilterPanel() {
    filterPanel.hidden = false;
    requestAnimationFrame(() => filterPanel.classList.add("is-open"));
    filterButton.setAttribute("aria-expanded", "true");
  }

  function closeFilterPanel() {
    filterPanel.classList.remove("is-open");
    filterButton.setAttribute("aria-expanded", "false");
    window.setTimeout(() => {
      filterPanel.hidden = true;
    }, 200);
  }

  if (filterButton) {
    filterButton.addEventListener("click", (event) => {
      event.stopPropagation();
      const isOpen = filterPanel.classList.contains("is-open");
      isOpen ? closeFilterPanel() : openFilterPanel();
    });
  }

  filterOptions.forEach((option) => {
    option.addEventListener("click", (event) => {
      event.stopPropagation();
      const status = option.dataset.status;

      if (window.StudentShared.activeStatus === status) {
        window.StudentShared.activeStatus = null;
        option.classList.remove("is-active");
      } else {
        window.StudentShared.activeStatus = status;
        filterOptions.forEach((opt) => opt.classList.remove("is-active"));
        option.classList.add("is-active");
      }

      document.dispatchEvent(new CustomEvent("statusfilterchange", {
        detail: { status: window.StudentShared.activeStatus },
      }));
    });
  });

  // Close Quick Action and/or Filter popups on outside click
  document.addEventListener("click", (event) => {
    if (
      quickActionPanel &&
      !quickActionPanel.hidden &&
      !quickActionPanel.contains(event.target) &&
      event.target !== quickActionButton
    ) {
      closeQuickAction();
    }

    if (
      filterPanel &&
      !filterPanel.hidden &&
      !filterPanel.contains(event.target) &&
      event.target !== filterButton &&
      !filterButton.contains(event.target)
    ) {
      closeFilterPanel();
    }
  });

});


// =========================================================
// FACULTY-DIRECTORY.JS
// Page-specific behavior for the Faculty Directory:
// - Renders faculty cards from FACULTY_DIRECTORY_DATA
// - Search-as-you-type by name or specialization/program
// - Combines with the shared status filter (student-shared.js)
// - "View Profile" opens the split-view profile panel with an
//   animation and populates it from the same data object
// - "Request Consultation" persists the selected professor's
//   full record to sessionStorage so request-consultation.html
//   (and, after submitting, request-submitted.html) can display
//   that SAME professor instead of a hardcoded one
//
// NOTE -- TEST DATA ONLY:
// We are testing from a student account and there is no
// backend yet, so FACULTY_DIRECTORY_DATA below is prototype
// data. Faculty status/availability is currently controlled
// here. Once real faculty accounts exist, this array (and the
// render/lookup functions that use it) should be replaced by
// data fetched from those accounts -- the rest of the page
// logic (search, filter, profile panel, animation, selected-
// faculty hand-off) should not need to change.
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

  // Key used to hand the selected professor off to
  // request-consultation.html and, from there, request-submitted.html.
  // Frontend-only stand-in until real faculty accounts/backend exist.
  const SELECTED_FACULTY_STORAGE_KEY = "profconsult_selected_faculty";

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

      // Availability status is no longer shown here -- this page is now
      // purely for identifying/selecting a professor for consultation.
      // faculty.status/statusLabel are kept in the data model (and still
      // power the existing filter panel under the hood) but are not
      // rendered as a dot or label anymore.
      card.innerHTML = `
        <img src="${faculty.photo}" alt="${faculty.fullName}" class="faculty-photo">
        <div class="faculty-info">
          <p class="faculty-name">Engr. ${faculty.lastName}</p>
          <p class="faculty-meta faculty-meta-row">
            <span>${faculty.program}</span>
            <span class="faculty-meta-dot" aria-hidden="true">&middot;</span>
            <span>${faculty.office}</span>
          </p>
        </div>
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
    const hoursRows = faculty.hours.map((entry) => `
      <li class="profile-hours-row">
        <span class="profile-hours-day">${entry.day}</span>
        <span class="profile-hours-time">${entry.time}</span>
      </li>
    `).join("");

    // Availability status is no longer shown in the profile -- this page
    // is now purely for identifying/selecting a professor for consultation.
    return `
      <img src="${faculty.photo}" alt="${faculty.fullName}" class="profile-photo">
      <p class="profile-name">${faculty.fullName}</p>
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

    // Persist the selected faculty so request-consultation.html (and,
    // after submission, request-submitted.html) can display the same
    // professor instead of a hardcoded one. sessionStorage is a
    // frontend-only stand-in until real faculty accounts/backend exist.
    // The facultyId query param on the link above is kept as a fallback.
    const requestConsultationLink = profilePanel.querySelector(".request-consultation-button");
    if (requestConsultationLink) {
      requestConsultationLink.addEventListener("click", () => {
        try {
          sessionStorage.setItem(SELECTED_FACULTY_STORAGE_KEY, JSON.stringify(faculty));
        } catch (error) {
          // sessionStorage unavailable -- request-consultation.html will
          // fall back to its own neutral placeholder if it can't read this
        }
      });
    }

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