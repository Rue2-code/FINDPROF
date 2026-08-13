// =========================================================
// REQUEST CONSULTATION PAGE INTERACTIONS
// - Burger menu + Quick Action + Notification bell: same
//   behavior as the Dashboard / Faculty Directory
// - Faculty Member auto-fills from the professor the student
//   selected in the Faculty Directory (handed off via
//   sessionStorage from faculty-directory.js) -- never
//   hardcoded to a specific professor
// - Student Name/ID/Program & Year auto-fill from sample
//   student data (structured so it's easy to swap for the
//   real logged-in student once the backend exists)
// - Preferred Time: custom dropdown populated with every
//   30-minute slot across a full 24-hour day
// - Submit Request -> request-submitted.html
// =========================================================

document.addEventListener("DOMContentLoaded", () => {

  // ---------------------------------------------------------
  // Selected faculty -- set by faculty-directory.js
  // (sessionStorage) when the student clicks "Request
  // Consultation" on a professor's profile. There is no
  // backend yet, so sessionStorage is the frontend-only
  // hand-off mechanism; this page never hardcodes a specific
  // professor. Falls back to a neutral placeholder only if
  // the student somehow lands here without selecting anyone
  // (e.g. navigating here directly).
  // ---------------------------------------------------------
  const SELECTED_FACULTY_STORAGE_KEY = "profconsult_selected_faculty";

  function getSelectedFaculty() {
    try {
      const stored = sessionStorage.getItem(SELECTED_FACULTY_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      return null;
    }
  }

  const selectedFaculty = getSelectedFaculty();
  const SELECTED_FACULTY_MEMBER = (selectedFaculty && selectedFaculty.fullName)
    ? selectedFaculty.fullName
    : "Selected Faculty Member";

  // ---------------------------------------------------------
  // Sample student data -- replace with the logged-in
  // student's real record once the backend exists
  // ---------------------------------------------------------
  const SAMPLE_STUDENT = {
    name: "John Dela Cruz",
    studentId: "24-00001",
    programYear: "BSCPE (Computer Engineering) - 3rd Year",
  };

  const facultyMemberInput = document.getElementById("facultyMember");
  const studentNameInput = document.getElementById("studentName");
  const studentIdInput = document.getElementById("studentId");
  const programYearInput = document.getElementById("programYear");

  if (facultyMemberInput) facultyMemberInput.textContent = SELECTED_FACULTY_MEMBER;
  if (studentNameInput) studentNameInput.textContent = SAMPLE_STUDENT.name;
  if (studentIdInput) studentIdInput.textContent = SAMPLE_STUDENT.studentId;
  if (programYearInput) programYearInput.textContent = SAMPLE_STUDENT.programYear;

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
  // Notification bell -- navigates to notifications.html
  // ---------------------------------------------------------
  const notificationBellButton = document.getElementById("notificationBellButton");
  if (notificationBellButton) {
    notificationBellButton.addEventListener("click", () => {
      window.location.href = "notifications.html";
    });
  }

  // ---------------------------------------------------------
  // Preferred Time: build every 30-minute slot covering a full
  // 24-hour day (12:00 AM - 12:30 AM, 12:30 AM - 1:00 AM, ...
  // through 11:30 PM - 12:00 AM), then populate the dropdown.
  // ---------------------------------------------------------
  function formatHourMinute(totalMinutes) {
    const hour24 = Math.floor(totalMinutes / 60) % 24;
    const minute = totalMinutes % 60;
    const period = hour24 < 12 ? "AM" : "PM";
    let hour12 = hour24 % 12;
    if (hour12 === 0) hour12 = 12;
    const minuteStr = minute.toString().padStart(2, "0");
    return `${hour12}:${minuteStr} ${period}`;
  }

  function buildTimeSlots() {
    const slots = [];
    for (let start = 0; start < 24 * 60; start += 30) {
      const end = start + 30;
      const label = `${formatHourMinute(start)} \u2013 ${formatHourMinute(end)}`;
      slots.push(label);
    }
    return slots;
  }

  const preferredTimeOptions = document.getElementById("preferredTimeOptions");
  if (preferredTimeOptions) {
    buildTimeSlots().forEach((label) => {
      const li = document.createElement("li");
      li.setAttribute("role", "option");
      li.setAttribute("data-value", label);
      li.textContent = label;
      preferredTimeOptions.appendChild(li);
    });
  }

  // ---------------------------------------------------------
  // Custom dropdown behavior (Preferred Time) -- same pattern
  // used elsewhere in the project so it can never be sized or
  // positioned by the browser/OS in a way that overflows on mobile.
  // ---------------------------------------------------------
  const timeSelect = document.getElementById("preferredTimeSelect");

  if (timeSelect) {
    const trigger = timeSelect.querySelector(".custom-select-trigger");
    const valueLabel = timeSelect.querySelector(".custom-select-value");
    const optionsList = timeSelect.querySelector(".custom-select-options");
    const hiddenInput = timeSelect.querySelector('input[type="hidden"]');

    trigger.addEventListener("click", (event) => {
      event.stopPropagation();
      const isOpen = timeSelect.classList.contains("is-open");

      if (isOpen) {
        timeSelect.classList.remove("is-open");
        optionsList.hidden = true;
        trigger.setAttribute("aria-expanded", "false");
      } else {
        timeSelect.classList.add("is-open");
        optionsList.hidden = false;
        trigger.setAttribute("aria-expanded", "true");
      }
    });

    optionsList.addEventListener("click", (event) => {
      const option = event.target.closest("li[role='option']");
      if (!option) return;

      optionsList.querySelectorAll("li").forEach((li) => li.classList.remove("is-active"));
      option.classList.add("is-active");

      valueLabel.textContent = option.textContent;
      valueLabel.removeAttribute("data-is-placeholder");
      hiddenInput.value = option.getAttribute("data-value");

      timeSelect.classList.remove("is-open");
      optionsList.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
    });

    document.addEventListener("click", () => {
      timeSelect.classList.remove("is-open");
      optionsList.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
    });
  }

  // ---------------------------------------------------------
  // Submit Request -> request-submitted.html
  // No backend yet, so this just collects and forwards the
  // entered data structure; wire up the real API call here later.
  // ---------------------------------------------------------
  const form = document.getElementById("requestConsultationForm");
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const requestId = `REQ-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

      const requestData = {
        requestId,
        facultyMember: facultyMemberInput.textContent,
        studentName: studentNameInput.textContent,
        studentId: studentIdInput.textContent,
        programYear: programYearInput.textContent,
        purpose: document.getElementById("consultationPurpose").value,
        message: document.getElementById("additionalMessage").value,
        preferredDate: document.getElementById("preferredDate").value,
        preferredTime: document.getElementById("preferredTime").value,
        status: "Pending Approval",
      };

      // Future: POST requestData to the backend here instead of
      // storing it locally -- sessionStorage is a frontend-only
      // stand-in so request-submitted.html can display it
      sessionStorage.setItem("profconsult_last_request", JSON.stringify(requestData));

      // Also add this request to the persistent My Requests list
      // so it automatically shows up on my-requests.html, growing
      // that list every time a request is submitted.
      try {
        const MY_REQUESTS_KEY = "profconsult_my_requests";
        const existing = JSON.parse(localStorage.getItem(MY_REQUESTS_KEY) || "[]");

        const dateLabel = requestData.preferredDate
          ? new Date(`${requestData.preferredDate}T00:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric" })
          : "";
        const timeLabel = requestData.preferredTime ? requestData.preferredTime.split("\u2013")[0].trim() : "";

        existing.unshift({
          title: requestData.purpose || "Consultation",
          date: dateLabel,
          time: timeLabel,
          status: "waiting",
          statusLabel: "Waiting",
        });

        localStorage.setItem(MY_REQUESTS_KEY, JSON.stringify(existing));
      } catch (error) {
        // Storage unavailable -- the request still submits, it just
        // won't show up on My Requests until storage works again
      }

      window.location.href = "request-submitted.html";
    });
  }

});