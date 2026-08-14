// =========================================================
// NOTIFICATIONS PAGE INTERACTIONS
// - Burger menu + Quick Action: copied verbatim from the
//   proven-working Student Dashboard implementation
// - Notification bell icon: clickable placeholder, no
//   functionality implemented yet
// - Renders the sample notification list, newest first.
//   Structured so future real notifications can simply be
//   pushed into SAMPLE_NOTIFICATIONS (or, once a backend
//   exists, fetched and passed to renderNotifications())
//   without changing how the list itself renders.
// =========================================================

document.addEventListener("DOMContentLoaded", () => {

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
  // Notification bell -- clickable placeholder, no
  // functionality implemented yet
  // ---------------------------------------------------------
  const notificationBellButton = document.getElementById("notificationBellButton");
  if (notificationBellButton) {
    notificationBellButton.addEventListener("click", () => {
      // Intentionally left empty -- functionality comes later
    });
  }

  // ---------------------------------------------------------
  // Notifications list
  // Sample data for the current test student account. Already
  // listed newest-first; once real notifications exist, sort
  // by their actual timestamp before rendering instead of
  // relying on insertion order.
  // ---------------------------------------------------------
  const SAMPLE_NOTIFICATIONS = [
    { message: "Professor accepted your consultation request.", timestamp: "2 minutes ago" },
    { message: "Professor changed availability.", timestamp: "Today" },
    { message: "Consultation moved to 3:00 PM.", timestamp: "Yesterday" },
    { message: "New announcement.", timestamp: "" },
  ];

  function renderNotifications(notifications) {
    const listEl = document.getElementById("notificationsList");
    if (!listEl) return;

    listEl.innerHTML = "";

    notifications.forEach((notification) => {
      const li = document.createElement("li");
      li.className = "notification-item";

      const check = document.createElement("span");
      check.className = "notification-check";
      check.setAttribute("aria-hidden", "true");
      check.innerHTML = "&check;";

      const content = document.createElement("div");
      content.className = "notification-content";

      const message = document.createElement("p");
      message.className = "notification-message";
      message.textContent = notification.message;
      content.appendChild(message);

      if (notification.timestamp) {
        const timestamp = document.createElement("p");
        timestamp.className = "notification-timestamp";
        timestamp.textContent = notification.timestamp;
        content.appendChild(timestamp);
      }

      li.appendChild(check);
      li.appendChild(content);
      listEl.appendChild(li);
    });
  }

  renderNotifications(SAMPLE_NOTIFICATIONS);

});