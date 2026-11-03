/* ==========================================================================
   Bookflow | Business Setup — Script
   Sections:
   1. Configuration
   2. Element references
   3. Logo placeholder handling
   4. Step navigation & validation
   5. Conditional fields
   6. Operating hours builder
   7. Form submission
   ========================================================================== */

/* 1. Configuration -------------------------------------------------------- */
/* SETUP: Replace this with the email address where you want to receive submissions. */
const RECEIVING_EMAIL = "YOUR_EMAIL@example.com";

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/* 2. Element references --------------------------------------------------- */
const form      = document.getElementById("setupForm");
const steps     = [...document.querySelectorAll(".step")];
const progress  = document.getElementById("progress");
const stepLabel = document.getElementById("stepLabel");
const percent   = document.getElementById("percent");
const backBtn   = document.getElementById("back");
const nextBtn   = document.getElementById("next");
const submitBtn = document.getElementById("submit");

let current = 0;

/* 3. Logo placeholder handling -------------------------------------------- */
/* If assets/bookflow-logo.png loads, hide the dashed placeholder styling.
   If it is missing, the "YOUR LOGO" placeholder box stays visible. */
const logoBox = document.querySelector(".logo");
const logoImg = logoBox.querySelector("img");

logoImg.addEventListener("load", () => logoBox.classList.add("has-image"));
logoImg.addEventListener("error", () => logoImg.remove());

/* 4. Step navigation & validation ----------------------------------------- */
function showStep(index) {
  current = index;

  steps.forEach((step, i) => step.classList.toggle("active", i === index));

  const pct = Math.round(((index + 1) / steps.length) * 100);
  progress.style.width = pct + "%";
  stepLabel.textContent = `Step ${index + 1} of ${steps.length}`;
  percent.textContent = pct + "% complete";

  backBtn.disabled = index === 0;
  nextBtn.classList.toggle("hidden", index === steps.length - 1);
  submitBtn.classList.toggle("hidden", index !== steps.length - 1);

  document.querySelector(".shell").scrollIntoView({ behavior: "smooth", block: "start" });
}

function validateStep() {
  const fields = [...steps[current].querySelectorAll("input, select, textarea")]
    .filter(el => !el.disabled && el.offsetParent !== null);

  for (const el of fields) {
    if (!el.checkValidity()) {
      el.reportValidity();
      el.focus();
      return false;
    }
  }
  return true;
}

nextBtn.addEventListener("click", () => {
  if (validateStep()) showStep(Math.min(current + 1, steps.length - 1));
});

backBtn.addEventListener("click", () => showStep(Math.max(0, current - 1)));

/* 5. Conditional fields --------------------------------------------------- */
// Show "Other business type" only when "Other" is chosen
document.getElementById("category").addEventListener("change", e => {
  document.getElementById("otherCategory").classList.toggle("hidden", e.target.value !== "Other");
});

// Show staff fields unless the owner works alone
document.querySelectorAll('input[name="Staff arrangement"]').forEach(radio => {
  radio.addEventListener("change", e => {
    document.getElementById("staffFields").classList.toggle("hidden", e.target.value === "I work alone");
  });
});

/* 6. Operating hours builder ---------------------------------------------- */
function buildDayCards() {
  document.getElementById("days").innerHTML = DAY_NAMES.map(day => `
    <div class="day" id="day-${day}">
      <div class="day-head">
        <input type="checkbox" name="Open days[]" value="${day}" checked aria-label="${day} open">
        <span>${day}</span>
      </div>
      <div class="day-times">
        <input type="time" name="${day} opening time" aria-label="${day} opening time" value="09:00">
        <input type="time" name="${day} closing time" aria-label="${day} closing time" value="17:00">
      </div>
    </div>`).join("");

  // Grey out the times when a day is unticked
  DAY_NAMES.forEach(day => {
    const card  = document.getElementById("day-" + day);
    const check = card.querySelector('input[type="checkbox"]');
    check.addEventListener("change", () => card.classList.toggle("closed", !check.checked));
  });
}

buildDayCards();

/* 7. Form submission ------------------------------------------------------ */
form.addEventListener("submit", e => {
  if (!validateStep()) {
    e.preventDefault();
    return;
  }

  const emailMissing = RECEIVING_EMAIL === "adrikolab25@gmail.com" || !RECEIVING_EMAIL.includes("@");
  if (emailMissing) {
    e.preventDefault();
    alert("Please set your receiving email address in js/main.js before publishing this form.");
    return;
  }

  form.action = "https://formsubmit.co/" + encodeURIComponent(RECEIVING_EMAIL);
});
