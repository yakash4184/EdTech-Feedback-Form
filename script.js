/* script.js
   - Multi-teacher flow
   - Welcome poster -> open app
   - Star rating UI
   - Collect responses and send to Google Form (one POST per teacher)
*/

/* ====== GOOGLE FORM SETTINGS (REPLACE THESE) ======
  1) Create a Google Form with fields:
     - Teacher Name (Short answer)
     - Rating (Short answer or Short answer)
     - Comment (Paragraph)
     - Student Name (optional)
     - Class (optional)
     - Subject (optional)

  2) Get entry IDs & form POST URL:
     - Open form preview, submit a dummy response while DevTools Network tab is open.
     - Find the request named "formResponse" and inspect request payload -> you'll see parameter names like entry.123456789
     - The POST URL will be like:
       https://docs.google.com/forms/d/e/FORM_ID/formResponse
     - Replace GOOGLE_FORM_ACTION and all ENTRY_* constants below with your real values.
================================================== */

const GOOGLE_FORM_ACTION = "https://docs.google.com/forms/d/e/FORM_ID/formResponse"; // <- REPLACE
const ENTRY_TEACHER = "entry.1111111111"; // <- REPLACE teacher name field entry id
const ENTRY_RATING  = "entry.2222222222"; // <- REPLACE rating field entry id
const ENTRY_COMMENT = "entry.3333333333"; // <- REPLACE comment field entry id
const ENTRY_STUDENT = "entry.4444444444"; // optional
const ENTRY_CLASS   = "entry.5555555555"; // optional
const ENTRY_SUBJECT = "entry.6666666666"; // optional

/* ===== Teachers array (update names/photos as needed) ===== */
const teachers = [
  { name: "Mrs. Anjali Sharma", meta: "Mathematics • Class 8A", photo: "images/teacher1.jpg" },
  { name: "Ms. Pooja Verma",    meta: "Science • Class 8A",     photo: "images/teacher2.jpg" },
  { name: "Mrs. Neha Singh",    meta: "English • Class 8A",     photo: "images/teacher3.jpg" }
];

/* ===== DOM elements ===== */
const welcomePage = document.getElementById("welcomePage");
const startBtn = document.getElementById("startBtn");
const app = document.getElementById("app");
const teacherSection = document.getElementById("teacherSection");
const thankyou = document.getElementById("thankyou");

const teacherPhoto = document.getElementById("teacherPhoto");
const teacherName  = document.getElementById("teacherName");
const teacherMeta  = document.getElementById("teacherMeta");
const progressEl   = document.getElementById("progress");
const starWrap     = document.getElementById("starWrap");
const ratingValue  = document.getElementById("ratingValue");
const commentEl    = document.getElementById("comment");

const studentNameEl = document.getElementById("studentName");
const studentClassEl = document.getElementById("studentClass");
const subjectEl = document.getElementById("subject");

const notTaughtBtn = document.getElementById("notTaughtBtn");
const nextBtn = document.getElementById("nextBtn");
const submitBtn = document.getElementById("submitBtn");

/* ===== Rating UI ===== */
const STAR_COUNT = 5;
let currentRating = 0;
function buildStars() {
  starWrap.innerHTML = "";
  for (let i = 1; i <= STAR_COUNT; i++) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "star-btn";
    b.innerHTML = "★";
    b.dataset.value = String(i);
    b.addEventListener("click", () => setRating(i));
    starWrap.appendChild(b);
  }
  updateStars();
}
function setRating(n) {
  currentRating = n;
  ratingValue.innerText = n;
  updateStars();
}
function updateStars() {
  const buttons = starWrap.querySelectorAll(".star-btn");
  buttons.forEach(btn => {
    const v = Number(btn.dataset.value);
    if (v <= currentRating) btn.classList.add("filled"); else btn.classList.remove("filled");
  });
}

/* ===== Flow state ===== */
let current = 0;
const responses = []; // collects responses per teacher

/* ===== Start: open app (hide welcome) ===== */
startBtn.addEventListener("click", openForm);
function openForm() {
  welcomePage.classList.add("hidden");
  app.classList.remove("hidden");
  current = 0;
  responses.length = 0;
  studentNameEl.value = "";
  studentClassEl.value = "";
  subjectEl.value = "";
  buildStars();
  loadTeacher();
}

/* ===== Load teacher to UI ===== */
function loadTeacher() {
  const t = teachers[current];
  teacherPhoto.src = t.photo;
  teacherName.textContent = t.name;
  teacherMeta.textContent = t.meta;
  progressEl.textContent = `${current + 1} / ${teachers.length}`;

  // Buttons visibility
  if (current === teachers.length - 1) {
    nextBtn.classList.add("hidden");
    submitBtn.classList.remove("hidden");
  } else {
    nextBtn.classList.remove("hidden");
    submitBtn.classList.add("hidden");
  }

  // Reset rating & comment for this teacher
  setRating(0);
  commentEl.value = "";
  // prefill subject field with teacher subject if possible
  subjectEl.value = t.meta.split("•")[0].trim();
}

/* ===== Save current teacher response ===== */
function saveResponse(skipped = false) {
  const t = teachers[current];
  const obj = {
    teacher: t.name,
    rating: skipped ? "" : currentRating,
    comment: skipped ? "" : (commentEl.value || ""),
    skipped,
    student: studentNameEl.value || "",
    class: studentClassEl.value || "",
    subject: subjectEl.value || ""
  };
  responses.push(obj);
}

/* ===== Next / Skip logic ===== */
function nextTeacher() {
  saveResponse(false);
  current++;
  if (current < teachers.length) loadTeacher();
}
function skipTeacher() {
  saveResponse(true);
  current++;
  if (current < teachers.length) loadTeacher();
}

/* ===== Submit all collected responses to Google Form ===== */
async function submitFeedback() {
  // Save last teacher's response
  saveResponse(false);

  // Simple UI feedback
  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting...";

  // Post each teacher response separately
  for (const resp of responses) {
    const formData = new FormData();
    formData.append(ENTRY_TEACHER, resp.teacher);
    formData.append(ENTRY_RATING, resp.rating || (resp.skipped ? "Not Taught" : "0"));
    formData.append(ENTRY_COMMENT, resp.comment || (resp.skipped ? "Not Taught" : ""));
    formData.append(ENTRY_STUDENT, resp.student || "");
    formData.append(ENTRY_CLASS, resp.class || "");
    formData.append(ENTRY_SUBJECT, resp.subject || "");

    try {
      // 'no-cors' is required for client-side POST to Google Forms
      await fetch(GOOGLE_FORM_ACTION, { method: "POST", mode: "no-cors", body: formData });
    } catch (e) {
      // fetch will often fail to return a readable response due to no-cors, but submission still works
      console.warn("Google Form submit warning (no-cors):", e);
    }

    // small delay so form backend isn't hit too fast
    await new Promise(r => setTimeout(r, 200));
  }

  // Show thank you
  document.getElementById("teacherSection").classList.add("hidden");
  thankyou.classList.remove("hidden");

  submitBtn.disabled = false;
  submitBtn.textContent = "Submit Feedback / फीडबैक भेजें";
}

/* ===== Restart to show welcome again ===== */
function restart() {
  thankyou.classList.add("hidden");
  document.getElementById("teacherSection").classList.remove("hidden");
  welcomePage.classList.remove("hidden");
  app.classList.add("hidden");
  responses.length = 0;
}

/* Build stars initially (if user opens directly) */
buildStars();
