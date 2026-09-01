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
  // Pending Consultation Requests -- shows the most recent
  // pending mock request. Same in-memory, resets-on-reload
  // pattern as faculty-consultation-requests.js (see that file
  // for more detail): a plain JS variable, no localStorage/
  // sessionStorage/backend of any kind. A page reload simply
  // re-runs this script, which naturally reinitializes fresh
  // mock requests -- any previous Accept/Decline on this page,
  // or on the Consultation Requests page, is intentionally not
  // remembered. Once a real backend exists, both pages will
  // instead fetch the same real request state; the accept/
  // decline/view-more actions themselves stay the same.
  // ---------------------------------------------------------
  let requests = [
    {
      id: "req-1",
      name: "Juan Dela Cruz",
      studentId: "22-00145",
      type: "Research Proposal",
      date: "July 20, 10:00 AM",
      program: "BS Computer Engineering",
      yearSet: "3B",
      message: "Good day po! I'd like to consult about my capstone research proposal title and methodology before I submit it for approval.",
      status: "pending",
    },
    {
      id: "req-2",
      name: "Joselita Rizal",
      studentId: "22-00098",
      type: "Research Proposal",
      date: "July 20, 10:00 AM",
      program: "BS Computer Engineering",
      yearSet: "3B",
      message: "Hi sir/ma'am, may I request a consultation regarding the scope and limitations section of our group's proposal?",
      status: "pending",
    },
    {
      id: "req-3",
      name: "Mark Santos",
      studentId: "21-00567",
      type: "Thesis Defense Prep",
      date: "July 21, 1:00 PM",
      program: "BS Computer Engineering",
      yearSet: "4A",
      message: "Requesting a short consultation to go over my defense slides and anticipated panel questions.",
      status: "pending",
    },
    {
      id: "req-4",
      name: "Angela Cruz",
      studentId: "23-00212",
      type: "Grade Concern",
      date: "July 22, 9:30 AM",
      program: "BS Computer Engineering",
      yearSet: "2A",
      message: "I'd like to clarify some items on my midterm exam whenever you have a free slot this week.",
      status: "pending",
    },
  ];

  // Placeholder only -- wire this to the real notification
  // system once the backend exists. No localStorage or any
  // other persistence.
  function notifyRequestAnswered(request, decision) {
    // Intentionally does nothing and stores nothing for now.
  }

  const requestNameEl = document.querySelector(".faculty-request-name");
  const requestMetaEl = document.querySelector(".faculty-request-meta");
  const requestSubjectLabelEl = document.querySelector(".faculty-request-subject-label");
  const requestSubjectEl = document.querySelector(".faculty-request-subject");
  const requestActionsEl = document.querySelector(".faculty-request-actions");
  const acceptButton = document.getElementById("acceptRequestButton");
  const declineButton = document.getElementById("declineRequestButton");
  const viewMoreButton = document.getElementById("viewMoreRequestsButton");

  function getNextPendingRequest() {
    return requests.find((r) => r.status === "pending") || null;
  }

  function renderDashboardRequest() {
    const request = getNextPendingRequest();

    if (!request) {
      // No pending requests left -- reuse the existing markup,
      // just swap its text instead of adding new elements.
      if (requestNameEl) requestNameEl.textContent = "No pending requests right now.";
      if (requestMetaEl) requestMetaEl.style.display = "none";
      if (requestSubjectLabelEl) requestSubjectLabelEl.style.display = "none";
      if (requestSubjectEl) requestSubjectEl.style.display = "none";
      if (requestActionsEl) requestActionsEl.style.display = "none";
      return;
    }

    if (requestMetaEl) requestMetaEl.style.display = "";
    if (requestSubjectLabelEl) requestSubjectLabelEl.style.display = "";
    if (requestSubjectEl) requestSubjectEl.style.display = "";
    if (requestActionsEl) requestActionsEl.style.display = "";

    if (requestNameEl) requestNameEl.textContent = request.name;
    if (requestMetaEl) requestMetaEl.textContent = `${request.program} | ${request.studentId} | ${request.yearSet}`;
    if (requestSubjectEl) requestSubjectEl.textContent = request.type;

    if (acceptButton) {
      acceptButton.textContent = "Accept";
      acceptButton.disabled = false;
      acceptButton.classList.remove("is-accepted");
    }
    if (declineButton) {
      declineButton.textContent = "Decline";
      declineButton.disabled = false;
      declineButton.classList.remove("is-declined");
    }
  }

  renderDashboardRequest();

  if (acceptButton) {
    acceptButton.addEventListener("click", () => {
      const request = getNextPendingRequest();
      if (!request) return;

      acceptButton.textContent = "Accepted";
      acceptButton.disabled = true;
      acceptButton.classList.add("is-accepted");
      if (declineButton) declineButton.disabled = true;

      request.status = "accepted";
      notifyRequestAnswered(request, "accepted");

      // Give the person a moment to see "Accepted" before the
      // next pending request takes its place.
      window.setTimeout(renderDashboardRequest, 900);
    });
  }

  if (declineButton) {
    declineButton.addEventListener("click", () => {
      const request = getNextPendingRequest();
      if (!request) return;

      declineButton.textContent = "Declined";
      declineButton.disabled = true;
      declineButton.classList.add("is-declined");
      if (acceptButton) acceptButton.disabled = true;

      request.status = "declined";
      notifyRequestAnswered(request, "declined");

      window.setTimeout(renderDashboardRequest, 900);
    });
  }

  if (viewMoreButton) {
    viewMoreButton.addEventListener("click", () => {
      window.location.href = "faculty-consultation-requests.html";
    });
  }

});