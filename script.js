/* =========================================
   TIME COACH
   SV GROUP
   FINAL VERSION
========================================= */


/* =========================================
   DATA
========================================= */

let routines = JSON.parse(
  localStorage.getItem("timeCoachRoutines") || "[]"
);

let personName =
  localStorage.getItem("timeCoachPerson") || "";

let lastCheckedMinute = "";

let spokenToday = {};

try {
  spokenToday = JSON.parse(
    localStorage.getItem("timeCoachSpokenToday") || "{}"
  );
} catch (error) {
  spokenToday = {};
}


/* =========================================
   ELEMENTS
========================================= */

const personInput =
  document.getElementById("personName");

const taskInput =
  document.getElementById("taskName");

const timeInput =
  document.getElementById("taskTime");

const routineList =
  document.getElementById("routineList");

const nextTask =
  document.getElementById("nextTask");

const personMessage =
  document.getElementById("personMessage");

const currentTime =
  document.getElementById("currentTime");

const statusText =
  document.getElementById("statusText");


/* =========================================
   LOAD PERSON
========================================= */

function loadPerson() {

  if (personInput) {
    personInput.value = personName;
  }

}


/* =========================================
   SAVE PERSON
========================================= */

function savePerson() {

  const name =
    personInput.value.trim();

  if (!name) {

    alert("पहले नाम लिखें");

    return;
  }

  personName = name;

  localStorage.setItem(
    "timeCoachPerson",
    personName
  );

  personMessage.textContent =
    "✅ " + personName + " का नाम Save हो गया";

  speak(
    "नाम save हो गया"
  );

}


/* =========================================
   ADD ROUTINE
========================================= */

function addRoutine() {

  const task =
    taskInput.value.trim();

  const time =
    timeInput.value;

  if (!task) {

    alert("Task का नाम लिखें");

    return;
  }

  if (!time) {

    alert("समय चुनें");

    return;
  }

  const newRoutine = {

    id:
      Date.now(),

    task:
      task,

    time:
      time

  };

  routines.push(newRoutine);

  routines.sort(
    (a, b) =>
      a.time.localeCompare(b.time)
  );

  saveRoutines();

  taskInput.value = "";
  timeInput.value = "";

  renderRoutines();

  updateNextRoutine();

}


/* =========================================
   SAVE ROUTINES
========================================= */

function saveRoutines() {

  localStorage.setItem(
    "timeCoachRoutines",
    JSON.stringify(routines)
  );

}


/* =========================================
   DELETE ROUTINE
========================================= */

function deleteRoutine(id) {

  routines =
    routines.filter(
      routine =>
        routine.id !== id
    );

  saveRoutines();

  renderRoutines();

  updateNextRoutine();

}


/* =========================================
   DISPLAY ROUTINES
========================================= */

function renderRoutines() {

  if (!routineList) return;

  if (routines.length === 0) {

    routineList.innerHTML =
      '<div class="empty">अभी कोई routine नहीं है</div>';

    return;
  }

  routineList.innerHTML =
    routines
      .map(routine => {

        return `
          <div class="routine">

            <div class="routine-top">

              <div class="routine-name">
                ${escapeHTML(routine.task)}
              </div>

              <div class="routine-time">
                ${formatTime(routine.time)}
              </div>

            </div>

            <button
              class="delete-btn"
              onclick="deleteRoutine(${routine.id})"
            >
              🗑️ Delete
            </button>

          </div>
        `;

      })
      .join("");

}


/* =========================================
   NEXT ROUTINE
========================================= */

function updateNextRoutine() {

  if (!nextTask) return;

  if (routines.length === 0) {

    nextTask.textContent =
      "अभी कोई routine नहीं है";

    return;
  }

  const now =
    new Date();

  const currentMinutes =
    now.getHours() * 60 +
    now.getMinutes();

  let next = null;

  for (const routine of routines) {

    const parts =
      routine.time.split(":");

    const minutes =
      Number(parts[0]) * 60 +
      Number(parts[1]);

    if (minutes >= currentMinutes) {

      next = routine;

      break;
    }

  }

  if (!next) {

    nextTask.textContent =
      "आज का routine पूरा हो गया";

    return;
  }

  nextTask.textContent =
    formatTime(next.time) +
    " — " +
    next.task;

}


/* =========================================
   VOICE
========================================= */

function speak(message) {

  if (
    !("speechSynthesis" in window)
  ) {

    return;
  }

  try {

    window.speechSynthesis.cancel();

    const speech =
      new SpeechSynthesisUtterance(
        message
      );

    speech.lang = "hi-IN";

    speech.rate = 0.85;

    speech.pitch = 1;

    speech.volume = 1;

    window.speechSynthesis.speak(
      speech
    );

  } catch (error) {

    console.log(
      "Voice error:",
      error
    );

  }

}


/* =========================================
   ROUTINE REMINDER
========================================= */

function checkRoutineReminder() {

  const now =
    new Date();

  const hour =
    String(
      now.getHours()
    ).padStart(2, "0");

  const minute =
    String(
      now.getMinutes()
    ).padStart(2, "0");

  const current =
    hour + ":" + minute;

  const date =
    now.toISOString()
      .slice(0, 10);


  /*
    Same minute ko baar-baar
    speak hone se rokna
  */

  if (
    current === lastCheckedMinute
  ) {

    return;
  }

  lastCheckedMinute =
    current;


  routines.forEach(
    routine => {

      if (
        routine.time !== current
      ) {

        return;
      }

      const key =
        routine.id +
        "_" +
        date;


      /*
        Aaj is routine ka
        reminder already diya?
      */

      if (
        spokenToday[key]
      ) {

        return;
      }

      spokenToday[key] = true;

      localStorage.setItem(
        "timeCoachSpokenToday",
        JSON.stringify(
          spokenToday
        )
      );


      const name =
        personName ||
        "Aap";


      const message =
        name +
        " ji, " +
        formatTime(routine.time) +
        " par " +
        routine.task +
        " ka time ho gaya hai.";


      speak(message);

      showNotification(
        routine.task,
        message
      );

    }
  );

}


/* =========================================
   NOTIFICATION
========================================= */

async function enableNotifications() {

  if (
    !("Notification" in window)
  ) {

    alert(
      "Is phone/browser mein notification support nahi mila."
    );

    return;
  }


  const permission =
    await Notification.requestPermission();


  if (
    permission === "granted"
  ) {

    alert(
      "✅ Notification ON ho gaya"
    );

  } else {

    alert(
      "Notification permission nahi mili."
    );

  }

}


/* =========================================
   SHOW NOTIFICATION
========================================= */

function showNotification(
  task,
  message
) {

  if (
    !("Notification" in window)
  ) {

    return;
  }

  if (
    Notification.permission !==
    "granted"
  ) {

    return;
  }

  try {

    new Notification(
      "⏱️ Time Coach",
      {
        body: message,
        icon: "icon.png",
        tag:
          "time-coach-" +
          task
      }
    );

  } catch (error) {

    console.log(
      "Notification error:",
      error
    );

  }

}


/* =========================================
   TEST VOICE
========================================= */

function testVoice() {

  const name =
    personName ||
    "Aap";

  speak(
    name +
    " ji, ye Time Coach ki voice test hai."
  );

}


/* =========================================
   FORMAT TIME
========================================= */

function formatTime(time) {

  const parts =
    time.split(":");

  let hour =
    Number(parts[0]);

  const minute =
    parts[1];

  const ampm =
    hour >= 12
      ? "PM"
      : "AM";

  hour =
    hour % 12;

  if (hour === 0) {
    hour = 12;
  }

  return (
    hour +
    ":" +
    minute +
    " " +
    ampm
  );

}


/* =========================================
   CURRENT CLOCK
========================================= */

function updateClock() {

  const now =
    new Date();

  currentTime.textContent =
    now.toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      }
    );

}


/* =========================================
   CLEAN OLD REMINDERS
========================================= */

function cleanOldReminderData() {

  const today =
    new Date()
      .toISOString()
      .slice(0, 10);

  const cleaned = {};

  Object.keys(
    spokenToday
  ).forEach(key => {

    if (
      key.endsWith(
        "_" + today
      )
    ) {

      cleaned[key] =
        spokenToday[key];

    }

  });

  spokenToday =
    cleaned;

  localStorage.setItem(
    "timeCoachSpokenToday",
    JSON.stringify(
      spokenToday
    )
  );

}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(text) {

  const div =
    document.createElement("div");

  div.textContent =
    text;

  return div.innerHTML;

}


/* =========================================
   BUTTON EVENTS
========================================= */

document
  .getElementById(
    "savePersonBtn"
  )
  .addEventListener(
    "click",
    savePerson
  );


document
  .getElementById(
    "addRoutineBtn"
  )
  .addEventListener(
    "click",
    addRoutine
  );


document
  .getElementById(
    "notificationBtn"
  )
  .addEventListener(
    "click",
    enableNotifications
  );


document
  .getElementById(
    "testVoiceBtn"
  )
  .addEventListener(
    "click",
    testVoice
  );


/* =========================================
   SERVICE WORKER
========================================= */

if (
  "serviceWorker" in navigator
) {

  window.addEventListener(
    "load",
    function () {

      navigator.serviceWorker
        .register("sw.js")
        .then(
          registration => {

            console.log(
              "Service Worker registered",
              registration
            );

          }
        )
        .catch(
          error => {

            console.log(
              "Service Worker error:",
              error
            );

          }
        );

    }
  );

}


/* =========================================
   START
========================================= */

loadPerson();

renderRoutines();

updateNextRoutine();

updateClock();

cleanOldReminderData();


/* =========================================
   RUN EVERY SECOND
========================================= */

setInterval(
  function () {

    updateClock();

    checkRoutineReminder();

  },
  1000
);


/* =========================================
   UPDATE NEXT TASK EVERY MINUTE
========================================= */

setInterval(
  function () {

    updateNextRoutine();

  },
  60000
);
