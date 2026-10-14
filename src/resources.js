// Lead magnet questionnaire: one question per screen, then the download.
const form = document.querySelector("[data-quiz]");
const steps = [...form.querySelectorAll("[data-step]")];
const count = form.querySelector("[data-quiz-count]");
const fill = form.querySelector("[data-quiz-fill]");
const backBtn = form.querySelector("[data-quiz-back]");
const nextBtn = form.querySelector("[data-quiz-next]");
const fine = form.querySelector("[data-quiz-fine]");
const submitError = form.querySelector("[data-submit-error]");
const done = document.querySelector("[data-quiz-done]");
const siteForm = document.querySelector("[data-site-form]");

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let current = 0;
let leadId = null;
let sending = false;

function show(index, { focus = true } = {}) {
  const leaving = steps[current];
  current = index;
  const step = steps[current];
  const last = current === steps.length - 1;

  steps.forEach((s) => { s.hidden = s !== step; });
  if (!reduceMotion && leaving !== step) {
    step.classList.remove("is-entering");
    void step.offsetWidth; // restart the animation
    step.classList.add("is-entering");
  }

  count.textContent = `Question ${current + 1} of ${steps.length}`;
  fill.style.width = `${((current + 1) / steps.length) * 100}%`;
  backBtn.hidden = current === 0;
  fine.hidden = !last;
  nextBtn.innerHTML = last
    ? 'Send me the guide <span class="btn__arrow" aria-hidden="true">→</span>'
    : 'Next <span class="btn__arrow" aria-hidden="true">→</span>';
  submitError.textContent = "";

  if (focus) {
    const field = step.querySelector(".quiz__input--lg");
    (field || step.querySelector("legend")).focus({ preventScroll: true });
  }
}

function setError(step, message, field) {
  step.querySelector("[data-step-error]").textContent = message;
  step.querySelectorAll("[aria-invalid]").forEach((el) => el.removeAttribute("aria-invalid"));
  if (field) {
    field.setAttribute("aria-invalid", "true");
    field.focus();
  }
}

// Returns true when the current step is answered.
function validate(step) {
  const choice = step.dataset.requiredChoice;
  if (choice) {
    const picked = step.querySelector(`input[name="${choice}"]:checked`);
    if (!picked) {
      setError(step, step.dataset.error, step.querySelector("input[type=radio]"));
      return false;
    }
    if (picked.value === "Other") {
      const other = step.querySelector("[data-other] input");
      if (!other.value.trim()) {
        setError(step, other.dataset.otherError, other);
        return false;
      }
    }
  } else {
    const input = step.querySelector(".quiz__input");
    const value = input.value.trim();
    if (!value) {
      setError(step, input.dataset.error, input);
      return false;
    }
    if (input.type === "email" && !EMAIL.test(value)) {
      setError(step, input.dataset.invalidError, input);
      return false;
    }
  }
  setError(step, "");
  return true;
}

function next() {
  if (!validate(steps[current])) return;
  if (current < steps.length - 1) show(current + 1);
  else submit();
}

// "Other" reveals its text field. Any answer clears the error.
form.addEventListener("change", (e) => {
  if (e.target.type !== "radio") return;
  const step = e.target.closest("[data-step]");
  const other = step.querySelector("[data-other]");
  other.hidden = e.target.value !== "Other";
  setError(step, "");
});

// A tap or click on a single-choice option moves on by itself. Keyboard users
// pick with the arrow keys and press Enter, so arrows never skip ahead.
form.addEventListener("pointerup", (e) => {
  const option = e.target.closest(".option");
  if (!option) return;
  const input = option.querySelector("input");
  setTimeout(() => {
    if (!input.checked) return;
    if (input.value === "Other") form.querySelector(`[data-step]:not([hidden]) [data-other] input`).focus();
    else if (steps[current].contains(input)) next();
  }, 220);
});

form.addEventListener("input", (e) => {
  if (e.target.matches(".quiz__input")) {
    e.target.removeAttribute("aria-invalid");
    e.target.closest("[data-step]").querySelector("[data-step-error]").textContent = "";
  }
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!sending) next();
});
backBtn.addEventListener("click", () => { if (current > 0) show(current - 1); });

async function post(payload) {
  const response = await fetch("/api/lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.ok) {
    const error = new Error(data.error || "request_failed");
    error.status = response.status;
    throw error;
  }
  return data;
}

async function submit() {
  const data = new FormData(form);
  const params = new URLSearchParams(location.search);
  const value = (name) => (data.get(name) || "").toString().trim();

  sending = true;
  nextBtn.disabled = true;
  backBtn.disabled = true;
  nextBtn.textContent = "Sending...";
  submitError.textContent = "";

  try {
    const result = await post({
      company: value("company"),
      businessType: value("businessType"),
      businessOther: value("businessOther"),
      struggle: value("struggle"),
      struggleOther: value("struggleOther"),
      complaint: value("complaint"),
      complaintOther: value("complaintOther"),
      firstName: value("firstName"),
      email: value("email"),
      pageUrl: location.href,
      utmSource: params.get("utm_source") || "",
      utmMedium: params.get("utm_medium") || "",
      utmCampaign: params.get("utm_campaign") || "",
    });
    leadId = result.id;
    finish(value("firstName"));
  } catch (error) {
    sending = false;
    nextBtn.disabled = false;
    backBtn.disabled = false;
    show(current, { focus: false });
    submitError.textContent = error.status
      ? "Something broke on my end, not yours. Give it another try in a moment."
      : "Couldn't reach the server. Check your connection and try again.";
  }
}

function finish(name) {
  form.hidden = true;
  done.hidden = false;
  const title = done.querySelector("[data-done-title]");
  title.textContent = `Done, ${name}. Your guide is ready.`;
  title.focus();
}

// Optional: attach their website to the same submission.
siteForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = siteForm.querySelector("input");
  const button = siteForm.querySelector("button");
  const error = siteForm.querySelector("[data-site-error]");
  const ok = siteForm.querySelector("[data-site-ok]");
  let site = input.value.trim();

  error.textContent = "";
  if (!site) {
    error.textContent = "Drop a link first. Or skip it, no pressure.";
    input.focus();
    return;
  }
  if (!/^https?:\/\//i.test(site)) site = `https://${site}`;
  if (!/^https?:\/\/[^\s.]+\.[^\s]{2,}/i.test(site)) {
    error.textContent = "That link looks a little off. Try something like yourbusiness.com.";
    input.focus();
    return;
  }

  button.disabled = true;
  button.textContent = "Sending...";
  try {
    await post({ action: "website", id: leadId, website: site });
    siteForm.querySelector(".quiz__site-row").hidden = true;
    ok.textContent = "Got it. I'll take a look and get back to you personally.";
  } catch (err) {
    error.textContent = err.status
      ? "That didn't save. Try again, or just email me the link."
      : "Couldn't reach the server. Check your connection and try again.";
    button.disabled = false;
    button.textContent = "Send";
  }
});

show(0, { focus: false });
