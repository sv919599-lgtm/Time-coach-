/* =========================================
   TIME COACH
   SV GROUP
   ANDROID APP READY
========================================= */


/* DATA */

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

const personNameInput =
  document.getElementById("personName");

const taskNameInput =
  document.getElementById("taskName");

const taskTimeInput =
  document.getElementById("taskTime");

const personMessage =
  document.getElementById("personMessage");

const routineList =
  document.getElementById("routineList");

const nextTask =
  document.getElementById("nextTask");

const currentTime =
  document.getElementById("currentTime");


/* LOAD */

personNameInput.value = personName;

renderRoutines();

updateNextTask();

updateClock();


/* SAVE PERSON */

document
  .getElementById("savePersonBtn")
  .addEventListener("click", savePerson);


function savePerson() {

  const name =
    personNameInput.value.trim();

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
    "✅ " + personName + " Save हो गया";

  speak(
    personName + " जी, नाम save हो गया है।"
  );
}


/* ADD ROUTINE */

document
  .getElementById("addRoutineBtn")
  .addEventListener("click", addRoutine);


function addRoutine() {

  const task =
    taskNameInput.value.trim();

  const time =
    taskTimeInput.value;

  if (!task) {
    alert("Task का नाम लिखें");
    return;
  }

  if (!time) {
    alert("समय चुनें");
    return;
  }


  const routine = {

    id: Date.now(),

    task: task,

    time: time

  };


  routines.push(routine);


  routines.sort(
    function(a, b) {

      return a.time.localeCompare(
        b.time
      );

    }
  );


  saveRoutines();

  taskNameInput.value = "";

  taskTimeInput.value = "";

  renderRoutines();

  updateNextTask();

  speak(
    "Routine save हो गया है।"
  );
}


/* SAVE */

function saveRoutines() {

  localStorage.setItem(
    "timeCoachRoutines",
    JSON.stringify(routines)
  );
}


/* DISPLAY */

function renderRoutines() {

  if (routines.length === 0) {

    routineList.innerHTML =
      '<div class="empty">अभी कोई routine नहीं है</div>';

    return;
  }


  routineList.innerHTML =
    routines
      .map(function(routine) {

        return `
          <div class="routine">

            <div class="routine-row">

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


/* DELETE */

function deleteRoutine(id) {

  routines =
    routines.filter(
      function(routine) {

        return routine.id !== id;

      }
    );


  saveRoutines();

  renderRoutines();

  updateNextTask();
}


/* NEXT TASK */

function updateNextTask() {

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


  for (
    let i = 0;
    i < routines.length;
    i++
  ) {

    const parts =
      routines[i].time.split(":");

    const minutes =
      Number(parts[0]) * 60 +
      Number(parts[1]);


    if (
      minutes >= currentMinutes
    ) {

      next = routines[i];

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


/* VOICE */

function speak(message) {

  if (
    !("speechSynthesis" in window)
  ) {

    alert(
      "इस device में voice support नहीं मिला।"
    );

    return;
  }


  window.speechSynthesis.cancel();


  const voice =
    new SpeechSynthesisUtterance(
      message
    );


  voice.lang = "hi-IN";

  voice.rate = 0.85;

  voice.pitch = 1;

  voice.volume = 1;


  window.speechSynthesis.speak(
    voice
  );
}


/* VOICE TEST */

document
  .getElementById("testVoiceBtn")
  .addEventListener(
    "click",
    function() {

      const name =
        personName || "आप";

      speak(
        name +
        " जी, Time Coach की voice test है।"
      );

    }
  );


/* REMINDER */

function checkReminder() {

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


  const today =
    now.getFullYear() +
    "-" +
    String(
      now.getMonth() + 1
    ).padStart(2, "0") +
    "-" +
    String(
      now.getDate()
    ).padStart(2, "0");


  if (
    current === lastReminderMinute
  ) {

    return;
  }


  lastReminderMinute =
    current;


  routines.forEach(
    function(routine) {

      if (
        routine.time !== current
      ) {

        return;
      }


      const key =
        routine.id +
        "_" +
        today;


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
        personName || "आप";


      const message =
        name +
        " जी, " +
        routine.task +
        " का time हो गया है।";


      speak(message);

    }
  );
}


/* CLOCK */

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


/* FORMAT TIME */

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


/* SECURITY */

function escapeHTML(text) {

  const div =
    document.createElement("div");

  div.textContent =
    text;

  return div.innerHTML;
}


/* OLD REMINDER CLEANUP */

function cleanupReminderData() {

  const today =
    new Date();

  const todayKey =
    today.getFullYear() +
    "-" +
    String(
      today.getMonth() + 1
    ).padStart(2, "0") +
    "-" +
    String(
      today.getDate()
    ).padStart(2, "0");


  const clean = {};


  Object.keys(
    spokenToday
  ).forEach(
    function(key) {

      if (
        key.endsWith(
          "_" + todayKey
        )
      ) {

        clean[key] =
          spokenToday[key];

      }

    }
  );


  spokenToday =
    clean;


  localStorage.setItem(
    "timeCoachSpokenToday",
    JSON.stringify(
      spokenToday
    )
  );
}


/* START */

cleanupReminderData();


/* CHECK EVERY SECOND */

setInterval(
  function() {

    updateClock();

    checkReminder();

  },
  1000
);


/* UPDATE NEXT TASK */

setInterval(
  function() {

    updateNextTask();

  },
  60000
);
