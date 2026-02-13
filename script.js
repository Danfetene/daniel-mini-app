const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();               // full height
tg.MainButton.setParams({ text: "SUBMIT FORM" });
tg.MainButton.show();
tg.MainButton.onClick(() => document.getElementById("user-form").dispatchEvent(new Event("submit")));

const form = document.getElementById("user-form");
const statusEl = document.getElementById("status");
const greeting = document.getElementById("greeting");

const user = tg.initDataUnsafe?.user;
if (user) {
  greeting.textContent = `Hello, ${user.first_name || "friend"}!`;
}

// Theme sync
function applyTheme() {
  document.documentElement.style.setProperty("--tg-theme-bg-color", tg.themeParams.bg_color);
  document.documentElement.style.setProperty("--tg-theme-text-color", tg.themeParams.text_color);
  // ... add more if needed
}
applyTheme();
tg.onEvent("themeChanged", applyTheme);

// Load saved draft
const STORAGE_KEY = "AIzaSyCB11eevxR7iulC-iWgv5lBjJ-hnMpxKyA";
tg.CloudStorage.getItem(STORAGE_KEY, (err, value) => {
  if (!err && value) {
    try {
      const data = JSON.parse(value);
      Object.keys(data).forEach(key => {
        const el = document.getElementById(key);
        if (el) el.value = data[key];
      });
      document.getElementById("agree").checked = data.agree === "on";
    } catch {}
  }
});

// Clear form
document.getElementById("clear-btn").onclick = () => {
  form.reset();
  tg.CloudStorage.removeItem(STORAGE_KEY);
  statusEl.classList.add("hidden");
};

// Real-time validation + save draft on change
form.addEventListener("input", () => {
  saveDraft();
  clearErrors();
});

function saveDraft() {
  const data = new FormData(form);
  const obj = {};
  for (let [k, v] of data) obj[k] = v;
  tg.CloudStorage.setItem(STORAGE_KEY, JSON.stringify(obj), () => {});
}

function showError(input, msg) {
  const errEl = input.nextElementSibling;
  if (errEl) errEl.textContent = msg;
  input.style.borderColor = "var(--destructive)";
}

function clearErrors() {
  document.querySelectorAll(".error").forEach(el => el.textContent = "");
  document.querySelectorAll("input, select").forEach(el => el.style.borderColor = "");
}

// Submit
form.onsubmit = async (e) => {
  e.preventDefault();
  clearErrors();

  let valid = true;

  const name = document.getElementById("name");
  if (name.value.trim().length < 2) {
    showError(name, "Name is too short");
    valid = false;
  }

  const age = document.getElementById("age");
  if (age.value < 13 || age.value > 120) {
    showError(age, "Age must be 13–120");
    valid = false;
  }

  const email = document.getElementById("email");
  if (!email.value.includes("@") || email.value.length < 6) {
    showError(email, "Invalid email");
    valid = false;
  }

  const country = document.getElementById("country");
  if (!country.value) {
    showError(country, "Please select country");
    valid = false;
  }

  const agree = document.getElementById("agree");
  if (!agree.checked) {
    showError(agree, "You must agree to terms");
    valid = false;
  }

  if (!valid) {
    tg.HapticFeedback.notificationOccurred("error");
    return;
  }

  // Success
  tg.HapticFeedback.notificationOccurred("success");
  statusEl.textContent = "Thank you! Data saved.";
  statusEl.classList.remove("hidden");

  tg.MainButton.hide();

  // Optional: send to bot / your server
  // tg.sendData(JSON.stringify(Object.fromEntries(new FormData(form))));

  // Clear after submit (or keep – your choice)
  // form.reset();
  // tg.CloudStorage.removeItem(STORAGE_KEY);
};

// Back button closes app
tg.BackButton.show();
tg.BackButton.onClick(() => tg.close());