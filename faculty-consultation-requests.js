// =========================================================
// FACULTY CONSULTATION REQUESTS -- PAGE-SPECIFIC INTERACTIONS
// - Renders pending requests from a data array (horizontally
//   scrollable), so incoming requests can later be added just
//   by pushing to REQUESTS -- no HTML changes needed.
// - View More expands a card in place to show Program, Year
//   and Set, and Additional Message; clicking outside any
//   expanded card collapses it back.
// - Accept / Decline mark the request answered, notify through
//   the existing Faculty Notifications system (persisted to
//   localStorage so it actually shows up when the faculty
//   later visits that page), simulate a notification landing
//   on the student's side, then remove the request from the
//   pending queue so the next one moves up.
// - Reschedule is a frontend-only placeholder for now.
//
// Frontend/prototype only -- there is no backend yet. Shared
// shell behavior (navbar, sidebar, quick action, notification
// bell) lives in faculty-shared.js and is untouched by this file.
// =========================================================

// ---------------------------------------------------------
// Mock pending requests -- replace with real data from the
// backend once consultation requests are persisted server-side.
// ---------------------------------------------------------
let REQUESTS = [
  {
    id: "req-1",
    name: "Juan Dela Cruz",
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
    type: "Grade Concern",
    date: "July 22, 9:30 AM",
    program: "BS Computer Engineering",
    yearSet: "2A",
    message: "I'd like to clarify some items on my midterm exam whenever you have a free slot this week.",
    status: "pending",
  },
];

// ---------------------------------------------------------
// Notification integration -- writes into the same storage
// shape/key that faculty-notifications.js reads, so this is
// genuinely the existing notification system, not a separate
// one. Also writes a simulated entry to the student-side store;
// actually displaying that requires the Student Dashboard/
// Notifications pages to read from it, which is outside this
// page's scope.
// ---------------------------------------------------------
const FACULTY_NOTIFICATIONS_STORAGE_KEY = "profconsult_faculty_notifications";
const STUDENT_NOTIFICATIONS_STORAGE_KEY = "profconsult_student_notifications";

function pushNotification(storageKey, notification) {
  let list = [];
  try {
    const raw = window.localStorage.getItem(storageKey);
    list = raw ? JSON.parse(raw) : [];
  } catch (error) {
    list = [];
  }
  list.unshift(notification);
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(list));
  } catch (error) {
    // Storage unavailable (e.g. private browsing) -- the action
    // itself still completes, it just won't persist a notification.
  }
}

function notifyFacultyRequestAnswered(request, decision) {
  const verb = decision === "accepted" ? "accepted" : "declined";
  pushNotification(FACULTY_NOTIFICATIONS_STORAGE_KEY, {
    id: `notif-${request.id}-${decision}-${Date.now()}`,
    type: `consultation-${decision}`,
    message: `You ${verb} ${request.name}'s consultation request.`,
  });
}

function notifyStudentRequestAnswered(request, decision) {
  const verb = decision === "accepted" ? "approved" : "declined";
  pushNotification(STUDENT_NOTIFICATIONS_STORAGE_KEY, {
    id: `notif-${request.id}-${decision}-${Date.now()}`,
    type: `consultation-${decision}`,
    message: `Your consultation request (${request.type}) was ${verb}.`,
  });
}

document.addEventListener("DOMContentLoaded", () => {

  const scrollContainer = document.getElementById("requestsScrollContainer");
  const noRequestsMessage = document.getElementById("noRequestsMessage");

  // ---------------------------------------------------------
  // Render
  // ---------------------------------------------------------
  function buildRequestCard(request) {
    const card = document.createElement("article");
    card.className = "request-card";
    card.dataset.id = request.id;

    card.innerHTML = `
      <div class="request-card-header">
        <p class="request-name">${request.name}</p>
        <span class="request-avatar" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="8" r="4"></circle>
            <path d="M4 20c0-4.418 3.582-8 8-8s8 3.582 8 8v1H4v-1z"></path>
          </svg>
        </span>
        <button type="button" class="request-accept-button" data-action="accept">Accept</button>
      </div>

      <p class="request-type">${request.type}</p>
      <p class="request-date">Preferred Date: ${request.date}</p>

      <div class="request-expanded-info">
        <div class="request-info-col">
          <p class="request-info-label">Program:</p>
          <p class="request-info-value">${request.program}</p>
          <p class="request-info-label">Year and Set:</p>
          <p class="request-info-value">${request.yearSet}</p>
        </div>
        <div class="request-info-col">
          <p class="request-info-label">Additional Message:</p>
          <p class="request-message">${request.message}</p>
        </div>
      </div>

      <div class="request-actions">
        <button type="button" class="request-view-more-button" data-action="view-more">View More</button>
        <button type="button" class="request-reschedule-button" data-action="reschedule">Reschedule</button>
        <button type="button" class="request-decline-button" data-action="decline">Decline</button>
      </div>

      <p class="request-toast" aria-live="polite"></p>
    `;

    return card;
  }

  function renderRequests() {
    if (!scrollContainer) return;
    scrollContainer.innerHTML = "";

    const pending = REQUESTS.filter((request) => request.status === "pending");

    pending.forEach((request) => {
      scrollContainer.appendChild(buildRequestCard(request));
    });

    if (noRequestsMessage) {
      noRequestsMessage.hidden = pending.length > 0;
    }
  }

  renderRequests();

  // ---------------------------------------------------------
  // Card interactions -- delegated to the scroll container so
  // re-rendering never loses event bindings.
  // ---------------------------------------------------------
  if (scrollContainer) {
    scrollContainer.addEventListener("click", (event) => {
      const actionButton = event.target.closest("[data-action]");
      if (!actionButton) return;

      const card = actionButton.closest(".request-card");
      if (!card) return;

      const requestId = card.dataset.id;
      const request = REQUESTS.find((r) => r.id === requestId);
      if (!request) return;

      const action = actionButton.dataset.action;

      if (action === "view-more") {
        // Only one card expanded at a time.
        Array.from(scrollContainer.querySelectorAll(".request-card")).forEach((c) => {
          if (c !== card) c.classList.remove("is-expanded");
        });
        card.classList.add("is-expanded");
      }

      if (action === "reschedule") {
        const toast = card.querySelector(".request-toast");
        if (toast) {
          toast.textContent = "Reschedule request noted. (Feature coming soon.)";
          toast.classList.add("is-visible");
          window.setTimeout(() => toast.classList.remove("is-visible"), 2500);
        }
      }

      if (action === "accept") {
        actionButton.textContent = "Accepted";
        actionButton.disabled = true;
        actionButton.classList.add("is-accepted");
        const declineButton = card.querySelector(".request-decline-button");
        if (declineButton) declineButton.disabled = true;
        const viewMoreButton = card.querySelector(".request-view-more-button");
        if (viewMoreButton) viewMoreButton.disabled = true;

        request.status = "accepted";
        notifyFacultyRequestAnswered(request, "accepted");
        notifyStudentRequestAnswered(request, "accepted");

        // Give the person a moment to see "Accepted" before the
        // card leaves the pending queue and the next one shifts up.
        window.setTimeout(renderRequests, 900);
      }

      if (action === "decline") {
        actionButton.textContent = "Declined";
        actionButton.disabled = true;
        actionButton.classList.add("is-declined");
        const acceptButton = card.querySelector(".request-accept-button");
        if (acceptButton) acceptButton.disabled = true;
        const viewMoreButton = card.querySelector(".request-view-more-button");
        if (viewMoreButton) viewMoreButton.disabled = true;

        request.status = "declined";
        notifyFacultyRequestAnswered(request, "declined");
        notifyStudentRequestAnswered(request, "declined");

        window.setTimeout(renderRequests, 900);
      }
    });
  }

  // ---------------------------------------------------------
  // Click outside any expanded card collapses it back.
  // ---------------------------------------------------------
  document.addEventListener("click", (event) => {
    if (!scrollContainer) return;
    const expandedCards = Array.from(scrollContainer.querySelectorAll(".request-card.is-expanded"));
    if (expandedCards.length === 0) return;

    const clickedInsideAnExpandedCard = expandedCards.some((card) => card.contains(event.target));
    if (!clickedInsideAnExpandedCard) {
      expandedCards.forEach((card) => card.classList.remove("is-expanded"));
    }
  });

});