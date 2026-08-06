// =========================================================
// FACULTY DASHBOARD -- PAGE-SPECIFIC INTERACTIONS
// - Populates the greeting from sample faculty data
//   (will come from the logged-in faculty's real record
//   once the backend exists)
// - Today's Status: Change Status opens a gradient popup of
//   status options; selecting + Save updates the visible
//   status pill. Frontend-only for now (no persistence).
// - Accept / Decline / View More: clickable placeholders,
//   functionality not implemented yet.
//
// Shared shell behavior (navbar, sidebar, quick action,
// notification bell) lives in faculty-shared.js.
// =========================================================


document.addEventListener("DOMContentLoaded", () => {

  // ---------------------------------------------------------
  // Sample faculty account -- replace with real session/user
  // data once backend authentication exists
  // ---------------------------------------------------------
  const SAMPLE_FACULTY = {
    fullName: "Engr. Maria Nina Sales",
    lastName: "Professor",
  };

  const nameEl = document.getElementById("facultyLastName");
  if (nameEl) {
    nameEl.textContent = SAMPLE_FACULTY.lastName;
  }

  // ---------------------------------------------------------
  // Today's Status: Change Status popup. Selecting an option
  // marks it visually selected; Save applies it to the status
  // pill and closes the popup. Closing without Save discards
  // the pending selection.
  // ---------------------------------------------------------
  const changeStatusButton = document.getElementById("changeStatusButton");
  const statusPanel = document.getElementById("statusPanel");
  const statusOptions = statusPanel
    ? Array.from(statusPanel.querySelectorAll(".faculty-status-option"))
    : [];
  const saveStatusButton = document.getElementById("saveStatusButton");
  const currentStatusDot = document.getElementById("currentStatusDot");
  const currentStatusLabel = document.getElementById("currentStatusLabel");

  let pendingStatus = null;
  let pendingLabel = null;

  function openStatusPanel() {
    statusPanel.hidden = false;
    requestAnimationFrame(() => statusPanel.classList.add("is-open"));
    changeStatusButton.setAttribute("aria-expanded", "true");
  }

  function closeStatusPanel() {
    statusPanel.classList.remove("is-open");
    changeStatusButton.setAttribute("aria-expanded", "false");
    window.setTimeout(() => {
      statusPanel.hidden = true;
    }, 200); // matches the panel's CSS transition duration
  }

  if (changeStatusButton) {
    changeStatusButton.addEventListener("click", (event) => {
      event.stopPropagation();
      const isOpen = statusPanel.classList.contains("is-open");
      if (isOpen) {
        closeStatusPanel();
      } else {
        openStatusPanel();
      }
    });
  }

  statusOptions.forEach((option) => {
    option.addEventListener("click", (event) => {
      event.stopPropagation();
      pendingStatus = option.dataset.status;
      pendingLabel = option.dataset.label;
      statusOptions.forEach((opt) => opt.classList.remove("is-selected"));
      option.classList.add("is-selected");
    });
  });

  if (saveStatusButton) {
    saveStatusButton.addEventListener("click", (event) => {
      event.stopPropagation();
      if (pendingStatus && currentStatusDot && currentStatusLabel) {
        currentStatusDot.className = `status-dot status-${pendingStatus}`;
        currentStatusLabel.textContent = pendingLabel;
      }
      closeStatusPanel();
    });
  }

  document.addEventListener("click", (event) => {
    if (
      statusPanel &&
      !statusPanel.hidden &&
      !statusPanel.contains(event.target) &&
      event.target !== changeStatusButton &&
      !changeStatusButton.contains(event.target)
    ) {
      closeStatusPanel();
    }
  });

  // ---------------------------------------------------------
  // Pending Consultation Requests -- Accept / Decline / View
  // More are clickable placeholders, no functionality yet
  // ---------------------------------------------------------
  ["acceptRequestButton", "declineRequestButton", "viewMoreRequestsButton"].forEach((id) => {
    const button = document.getElementById(id);
    if (button) {
      button.addEventListener("click", () => {
        // Intentionally left empty -- functionality comes later
      });
    }
  });

});