// =========================================================
// FACULTY SHARED LAYOUT INTERACTIONS
// Reused across every Faculty page. Handles only the shared
// shell: burger sidebar, Quick Action popup, notification
// bell placeholder, and active-link highlighting.
//
// Each Faculty page sets `document.body.dataset.activePage`
// to one of: "dashboard", "consultation-requests",
// "availability", "notifications", "profile", "settings"
// so the correct sidebar link gets the .is-active class
// automatically, without hardcoding it per page.
//
// Page-specific behavior (e.g. the Dashboard's status
// dropdown) belongs in that page's own JS file, loaded
// after this one.
// =========================================================

document.addEventListener("DOMContentLoaded", () => {

  // ---------------------------------------------------------
  // Burger sidebar: slides in from the left, dims/blurs the
  // page behind it. Closes via the X button or clicking the
  // overlay outside the sidebar.
  // ---------------------------------------------------------
  const hamburgerButton = document.getElementById("facultyHamburgerButton");
  const sidebar = document.getElementById("facultySidebar");
  const sidebarOverlay = document.getElementById("facultySidebarOverlay");
  const sidebarClose = document.getElementById("facultySidebarClose");

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
  // Active sidebar link -- set automatically from
  // document.body.dataset.activePage, so nothing needs to be
  // hardcoded by hand on each page's copy of the sidebar.
  // ---------------------------------------------------------
  const activePage = document.body.dataset.activePage;
  if (activePage) {
    const activeLink = sidebar
      ? sidebar.querySelector(`.faculty-sidebar-link[data-page="${activePage}"]`)
      : null;
    if (activeLink) {
      activeLink.classList.add("is-active");
    }
  }

  // ---------------------------------------------------------
  // Quick Action popup: fades/slides in below its trigger icon.
  // Check In / Check Out are placeholders -- clickable, no
  // functionality implemented yet.
  // ---------------------------------------------------------
  const quickActionButton = document.getElementById("facultyQuickActionButton");
  const quickActionPanel = document.getElementById("facultyQuickActionPanel");

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
      event.target !== quickActionButton &&
      !quickActionButton.contains(event.target)
    ) {
      closeQuickAction();
    }
  });

  const checkInButton = document.getElementById("facultyCheckInButton");
  const checkOutButton = document.getElementById("facultyCheckOutButton");
  [checkInButton, checkOutButton].forEach((button) => {
    if (button) {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        // Intentionally left empty -- functionality comes later
      });
    }
  });

  // ---------------------------------------------------------
  // Notification bell -- clickable placeholder, no
  // functionality implemented yet
  // ---------------------------------------------------------
  const notificationBellButton = document.getElementById("facultyNotificationBellButton");
  if (notificationBellButton) {
    notificationBellButton.addEventListener("click", () => {
      // Intentionally left empty -- functionality comes later
    });
  }

});