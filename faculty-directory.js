// =========================================================
// SHARED FACULTY DATA LAYER (frontend-only stand-in)
// =========================================================
// This is the single source of truth for faculty accounts and
// their live status until a real backend exists. It's built on
// localStorage specifically (not sessionStorage) because
// localStorage is shared across all tabs/pages for the same
// site, which is what lets a status change made on the future
// Faculty Dashboard show up immediately on the Student
// Dashboard and Faculty Directory in another tab.
//
// Everything other files need is explicitly attached to
// `window` below, instead of relying on plain top-level
// const/function declarations being implicitly shared across
// separate <script> files. Both approaches are valid per spec,
// but explicit `window.x = ...` is the more robust, unambiguous
// choice for cross-file access.
//
// HOW TO REPLACE WITH A REAL BACKEND LATER:
// Swap the body of each function below for the matching API
// call (e.g. getFacultyList -> GET /api/faculty). Every page
// that uses this file only calls these functions, never
// localStorage directly, so the swap is isolated to this file.
// =========================================================

var FACULTY_STORAGE_KEY = "profconsult_faculty_directory";

// Supported statuses. "onleave" is an extra status beyond the
// four in the spec (Available/Teaching Class/Meeting/Offline),
// kept for consistency with the Student Dashboard sample data.
window.FACULTY_STATUS_LABELS = {
  available: "Available",
  teaching: "Teaching Class",
  meeting: "Meeting",
  offline: "Offline",
  onleave: "On Leave",
};

window.FACULTY_STATUS_COLOR_CLASS = {
  available: "status-available",
  teaching: "status-teaching",
  meeting: "status-meeting",
  offline: "status-offline",
  onleave: "status-onleave",
};

// Seed data -- only used the very first time the site runs
// (i.e. when localStorage has nothing yet). Once real faculty
// accounts are created, this seed data lives alongside them.
var FACULTY_SEED_DATA = [
  {
    id: "maria-nina-sales",
    fullName: "Engr. Maria Nina Sales",
    lastName: "Sales",
    status: "available",
    department: "Computer Engineering",
    officeRoom: "301",
    photo: "images/professor-maria-nina-sales.jpg",
  },
  {
    id: "bernard-bisuecos",
    fullName: "Engr. Bernard Bisuecos",
    lastName: "Bisuecos",
    status: "onleave",
    department: "Computer Engineering",
    officeRoom: "305",
    photo: "images/professor-bernard-bisuecos.jpg",
  },
  {
    id: "mervin-molina",
    fullName: "Engr. Mervin Molina",
    lastName: "Molina",
    status: "teaching",
    department: "Computer Engineering",
    officeRoom: "212",
    photo: "images/professor-mervin-molina.jpg",
  },
  {
    id: "rose-onate",
    fullName: "Engr. Rose Onate",
    lastName: "Onate",
    status: "meeting",
    department: "Computer Engineering",
    officeRoom: "118",
    photo: "images/professor-rose-onate.jpg",
  },
  {
    id: "melody-paned",
    fullName: "Engr. Melody Paned",
    lastName: "Paned",
    status: "offline",
    department: "Computer Engineering",
    officeRoom: "204",
    photo: "images/professor-melody-paned.jpg",
  },
];

/**
 * Returns the current faculty list, seeding localStorage with
 * FACULTY_SEED_DATA the very first time this runs.
 */
window.getFacultyList = function getFacultyList() {
  var raw = localStorage.getItem(FACULTY_STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(FACULTY_STORAGE_KEY, JSON.stringify(FACULTY_SEED_DATA));
    return FACULTY_SEED_DATA.slice();
  }
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error("Faculty data was corrupted, reseeding.", error);
    localStorage.setItem(FACULTY_STORAGE_KEY, JSON.stringify(FACULTY_SEED_DATA));
    return FACULTY_SEED_DATA.slice();
  }
};

function saveFacultyList(list) {
  localStorage.setItem(FACULTY_STORAGE_KEY, JSON.stringify(list));
  // Let other listeners on the SAME tab know immediately --
  // the native "storage" event only fires for OTHER tabs.
  window.dispatchEvent(new CustomEvent("profconsult:faculty-updated"));
}

/**
 * Returns a single faculty member by id, or null if not found.
 */
window.getFacultyById = function getFacultyById(facultyId) {
  var list = window.getFacultyList();
  for (var i = 0; i < list.length; i++) {
    if (list[i].id === facultyId) return list[i];
  }
  return null;
};

/**
 * Adds a newly created faculty account so it automatically
 * appears in the Faculty Directory. Called from
 * create-faculty-account2.js once account creation succeeds.
 */
window.addFacultyAccount = function addFacultyAccount(record) {
  var list = window.getFacultyList();

  var id =
    record.id ||
    record.fullName
      .toLowerCase()
      .replace(/^engr\.\s*/, "")
      .trim()
      .replace(/[^a-z0-9]+/g, "-");

  list.push({
    id: id,
    fullName: record.fullName,
    lastName: record.lastName,
    status: record.status || "offline",
    department: record.department || "Computer Engineering",
    officeRoom: record.officeRoom || "TBA",
    photo: record.photo || "images/professor-default.jpg",
  });

  saveFacultyList(list);
  return id;
};

/**
 * Updates a single faculty member's status. This is the
 * function the future Faculty Dashboard will call when a
 * professor changes their availability -- every page reading
 * via getFacultyList()/subscribeFacultyUpdates() picks up the
 * change automatically.
 */
window.updateFacultyStatus = function updateFacultyStatus(facultyId, newStatus) {
  var list = window.getFacultyList();
  var record = null;
  for (var i = 0; i < list.length; i++) {
    if (list[i].id === facultyId) {
      record = list[i];
      break;
    }
  }
  if (!record) return;
  record.status = newStatus;
  saveFacultyList(list);
};

/**
 * Subscribes a callback to faculty data changes, whether they
 * happen on this tab (custom event) or another tab/page
 * (native "storage" event). Returns an unsubscribe function.
 */
window.subscribeFacultyUpdates = function subscribeFacultyUpdates(callback) {
  function handleStorageEvent(event) {
    if (event.key === FACULTY_STORAGE_KEY) callback();
  }
  function handleLocalEvent() {
    callback();
  }

  window.addEventListener("storage", handleStorageEvent);
  window.addEventListener("profconsult:faculty-updated", handleLocalEvent);

  return function unsubscribe() {
    window.removeEventListener("storage", handleStorageEvent);
    window.removeEventListener("profconsult:faculty-updated", handleLocalEvent);
  };
};