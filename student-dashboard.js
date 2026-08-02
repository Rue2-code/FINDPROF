// =========================================================
// STUDENT DASHBOARD INTERACTIONS
// - Populates the greeting from sample student data
//   (will come from the logged-in student's real record
//   once the backend exists)
// - Burger menu: slide-in sidebar with dim/blur overlay
// - Quick Action: fade/slide popup with Find Faculty and
//   Request Consultation actions
// - Search Professor: real-time, case-insensitive, partial-match
//   filtering with a "No professor found." empty state
// =========================================================

document.addEventListener("DOMContentLoaded", () => {

  // ---------------------------------------------------------
  // Sample student account -- replace with real session/user
  // data once backend authentication exists
  // ---------------------------------------------------------
  const SAMPLE_STUDENT = {
    fullName: "John Dela Cruz",
    firstName: "John",
    studentId: "24-00001",
    program: "BSCPE (Computer Engineering)",
    yearLevel: "3rd Year",
  };

  const firstNameEl = document.getElementById("studentFirstName");
  if (firstNameEl) {
    firstNameEl.textContent = SAMPLE_STUDENT.firstName;
  }

  // ---------------------------------------------------------
  // Burger sidebar: slides in from the left, dims/blurs the
  // dashboard behind it. Closes via the X button or clicking
  // the overlay outside the sidebar.
  // ---------------------------------------------------------
  const hamburgerButton = document.getElementById("hamburgerButton");
  const sidebar = document.getElementById("sidebar");
  const sidebarOverlay = document.getElementById("sidebarOverlay");
  const sidebarClose = document.getElementById("sidebarClose");

  function openSidebar() {
    sidebar.classList.add("is-open");
    sidebarOverlay.hidden = false;
    // Let the browser paint `hidden` removal first so the
    // opacity transition on the overlay actually animates in
    requestAnimationFrame(() => sidebarOverlay.classList.add("is-open"));
  }

  function closeSidebar() {
    sidebar.classList.remove("is-open");
    sidebarOverlay.classList.remove("is-open");
    window.setTimeout(() => {
      sidebarOverlay.hidden = true;
    }, 250); // matches the overlay's CSS transition duration
  }

  if (hamburgerButton) {
    hamburgerButton.addEventListener("click", openSidebar);
  }
  if (sidebarClose) {
    sidebarClose.addEventListener("click", closeSidebar);
  }
  if (sidebarOverlay) {
    sidebarOverlay.addEventListener("click", closeSidebar);
  }

  // ---------------------------------------------------------
  // Quick Action popup: fades/slides in below its trigger icon.
  // Closes when clicking its trigger again or anywhere outside.
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
    }, 200); // matches the panel's CSS transition duration
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
  // Search Professor: real-time, case-insensitive, partial-match
  // filtering of the professor cards. Shows "No professor found."
  // when nothing matches; empty search restores the full list.
  // ---------------------------------------------------------
  const searchInput = document.getElementById("professorSearchInput");
  const professorCards = Array.from(document.querySelectorAll(".professor-card"));
  const noResultsMessage = document.getElementById("noResultsMessage");

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.trim().toLowerCase();
      let visibleCount = 0;

      professorCards.forEach((card) => {
        const name = card.querySelector(".professor-name").textContent.toLowerCase();
        const matches = query === "" || name.includes(query);
        card.hidden = !matches;
        if (matches) visibleCount += 1;
      });

      noResultsMessage.hidden = visibleCount > 0;
    });
  }

});