/* =========================================
   TIME COACH - SV GROUP
   ROUTINE + VOICE REMINDER
========================================= */

let routines = JSON.parse(
  localStorage.getItem("timeCoachRoutines") || "[]"
);

let personName =
  localStorage.getItem("timeCoachPerson") || "";

let lastReminderMinute = "";

let spokenToday = JSON.parse(
  localStorage.getItem("timeCoachSpokenToday") || "{}"
);

/* ELEMENTS */

const personNameInput = document.getElementById("personName");
const taskNameInput = document.getElementById("taskName");
const taskTimeInput = document.getElementById("taskTime");

const personMessage = document.getElementById("personMessage");
const savedPerson = document.getElementById("savedPerson");
const routineList = document.getElementById("routineList");
const nextTask = document.getElementById("nextTask");
const currentTime = document.getElementById("currentTime");

const savePersonBtn = document.getElementById("savePersonBtn");
const addRoutineBtn = document.getElementById("addRoutineBtn");
const testVoiceBtn = document.getElementById("testVoiceBtn");

/* INITIAL LOAD */

if (personNameInput) {
  personNameInput.value = personName;
}

if (personName && savedPerson) {
  savedPerson.textContent = "👋 Hello, " + personName;
}

renderRoutines();
updateNextTask();
updateClock();

/* SAVE PERSON */

if (savePersonBtn) {
  savePersonBtn.addEventListener("click", savePerson);
}

function savePerson() {
  const name = personNameInput?.value.trim();

  if (!name) {
    alert("पहले अपना नाम लिखें।");
    return;
  }

  personName = name;

  localStorage.setItem("timeCoachPerson", personName);

  if (personMessage) {
    personMessage.textContent = "✅ " + personName + " सेव हो गया!";
  }

  if (savedPerson) {
    savedPerson.textContent = "👋 Hello, " + personName;
  }

  speak(personName + " जी, आपका नाम सेव हो गया है।");
}

/* ADD ROUTINE */

if (addRoutineBtn) {
  addRoutineBtn.addEventListener("click", addRoutine);
}

function addRoutine() {
  const task = taskNameInput?.value.trim();
  const time = taskTimeInput?.value;

  if (!task) {
    alert("कृपया Routine का नाम लिखें।");
    return;
  }

  if (!time) {
    alert("कृपया समय चुनें।");
    return;
  }

  const routine = {
    id: Date.now(),
    task: task,
    time: time
  };

  routines.push(routine);

  routines.sort((a, b) => a.time.localeCompare(b.time));

  saveRoutines();

  taskNameInput.value = "";
  taskTimeInput.value = "";

  renderRoutines();
  updateNextTask();

  speak("आपका " + task + " वाला Routine सेव हो गया है।");
}

/* SAVE ROUTINES */

function saveRoutines() {
  localStorage.setItem(
    "timeCoachRoutines",
    JSON.stringify(routines)
  );
}

/* DISPLAY ROUTINES */

function renderRoutines() {
  if (!routineList) return;

  if (routines.length === 0) {
    routineList.innerHTML =
      '<p style="text-align:center;color:#aaa;padding:15px;">अभी कोई Routine नहीं है।</p>';
    return;
  }

  routineList.innerHTML = routines.map(routine => `
    <div class="routine-item task-item">
      <h3>${escapeHTML(routine.task)}</h3>
      <p>⏰ ${formatTime(routine.time)}</p>
      <button class="secondary" onclick="deleteRoutine(${Number(routine.id)})">
        🗑️ Delete
      </button>
    </div>
  `).join("");
}

/* DELETE ROUTINE */

function deleteRoutine(id) {
  if (!confirm("क्या आप यह Routine डिलीट करना चाहते हैं?")) {
    return;
  }

  routines = routines.filter(
    routine => Number(routine.id) !== Number(id)
  );

  saveRoutines();
  renderRoutines();
  updateNextTask();
}

window.deleteRoutine = deleteRoutine;

/* NEXT TASK */

function updateNextTask() {
  if (!nextTask) return;

  if (routines.length === 0) {
    nextTask.textContent = "अभी कोई Routine नहीं है";
    return;
  }

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const upcoming = routines.find(routine => {
    const [hour, minute] = routine.time.split(":").map(Number);
    return hour * 60 + minute >= currentMinutes;
  });

  if (!upcoming) {
    nextTask.textContent = "आज का Routine पूरा हो गया";
    return;
  }

  nextTask.textContent =
    formatTime(upcoming.time) + " — " + upcoming.task;
}

/* VOICE */

function speak(message) {
  if (!("speechSynthesis" in window)) {
    alert("आपके फोन में Voice Support उपलब्ध नहीं है।");
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(message);

  utterance.lang = "hi-IN";
  utterance.rate = 0.85;
  utterance.pitch = 1;
  utterance.volume = 1;

  window.speechSynthesis.speak(utterance);
}

/* TEST VOICE */

if (testVoiceBtn) {
  testVoiceBtn.addEventListener("click", () => {
    const name = personName || "आप";
    speak(name + " जी, Time Coach की Voice Test है।");
  });
}

/* ROUTINE REMINDER */

function checkReminder() {
  const now = new Date();

  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");

  const current = hour + ":" + minute;

  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0")
  ].join("-");

  if (current === lastReminderMinute) return;

  lastReminderMinute = current;

  routines.forEach(routine => {
    if (routine.time !== current) return;

    const key = routine.id + "_" + today;

    if (spokenToday[key]) return;

    spokenToday[key] = true;

    localStorage.setItem(
      "timeCoachSpokenToday",
      JSON.stringify(spokenToday)
    );

    const name = personName || "आप";

    speak(
      name + " जी, " + routine.task + " का समय हो गया है।"
    );
  });
}

/* CLOCK */

function updateClock() {
  if (!currentTime) return;

  currentTime.textContent = new Date().toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    }
  );
}

/* FORMAT TIME */

function formatTime(time) {
  const [hours, minutes] = time.split(":").map(Number);

  const ampm = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;

  return hour12 + ":" + String(minutes).padStart(2, "0") + " " + ampm;
}

/* SAFE HTML */

function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = String(text);
  return div.innerHTML;
}

/* CLEAN OLD REMINDER DATA */

function cleanupReminderData() {
  const now = new Date();

  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0")
  ].join("-");

  const clean = {};

  Object.keys(spokenToday).forEach(key => {
    if (key.endsWith("_" + today)) {
      clean[key] = spokenToday[key];
    }
  });

  spokenToday = clean;

  localStorage.setItem(
    "timeCoachSpokenToday",
    JSON.stringify(spokenToday)
  );
}

/* START APP */

cleanupReminderData();

setInterval(() => {
  updateClock();
  checkReminder();
}, 1000);

setInterval(updateNextTask, 60000);
