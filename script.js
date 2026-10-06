/* ========================================
   TIME COACH
   SV GROUP
   SIMPLE DAILY ROUTINE
======================================== */


/* ========================================
   DATA
======================================== */

let routines = JSON.parse(
  localStorage.getItem("timeCoachRoutines") || "[]"
);


/* ========================================
   SAVE PERSON
======================================== */

window.savePerson = function () {

  const input =
    document.getElementById("personName");

  if (!input) {
    return;
  }

  const name =
    input.value.trim();

  if (!name) {
    alert("कृपया नाम डालें");
    return;
  }

  localStorage.setItem(
    "timeCoachPerson",
    name
  );

  const saved =
    document.getElementById("savedPerson");

  if (saved) {
    saved.textContent =
      "👋 Hello, " + name;
  }

  alert("नाम Save हो गया ✅");
};


/* ========================================
   LOAD PERSON
======================================== */

function loadPerson() {

  const name =
    localStorage.getItem(
      "timeCoachPerson"
    );

  if (!name) {
    return;
  }

  const input =
    document.getElementById("personName");

  if (input) {
    input.value = name;
  }

  const saved =
    document.getElementById("savedPerson");

  if (saved) {
    saved.textContent =
      "👋 Hello, " + name;
  }
}


/* ========================================
   SHOW ADD ROUTINE
======================================== */

window.showAddRoutine = function () {

  const card =
    document.getElementById(
      "addRoutineCard"
    );

  if (card) {
    card.style.display = "block";
  }

  const input =
    document.getElementById(
      "routineName"
    );

  if (input) {
    input.focus();
  }
};


/* ========================================
   HIDE ADD ROUTINE
======================================== */

window.hideAddRoutine = function () {

  const card =
    document.getElementById(
      "addRoutineCard"
    );

  if (card) {
    card.style.display = "none";
  }

  const name =
    document.getElementById(
      "routineName"
    );

  const time =
    document.getElementById(
      "routineTime"
    );

  if (name) {
    name.value = "";
  }

  if (time) {
    time.value = "";
  }
};


/* ========================================
   SAVE ROUTINE
======================================== */

window.saveRoutine = function () {

  const nameInput =
    document.getElementById(
      "routineName"
    );

  const timeInput =
    document.getElementById(
      "routineTime"
    );

  if (!nameInput || !timeInput) {
    return;
  }

  const name =
    nameInput.value.trim();

  const time =
    timeInput.value;

  if (!name) {
    alert("काम का नाम डालें");
    return;
  }

  if (!time) {
    alert("समय चुनें");
    return;
  }

  const task = {

    id: Date.now(),

    name: name,

    time: time

  };

  routines.push(task);

  routines.sort(function (a, b) {

    return a.time.localeCompare(
      b.time
    );

  });

  localStorage.setItem(
    "timeCoachRoutines",
    JSON.stringify(routines)
  );

  nameInput.value = "";

  timeInput.value = "";

  const card =
    document.getElementById(
      "addRoutineCard"
    );

  if (card) {
    card.style.display = "none";
  }

  renderRoutines();

  updateNextRoutine();

  alert("Routine Save हो गया ✅");
};


/* ========================================
   DELETE ROUTINE
======================================== */

window.deleteRoutine = function (id) {

  const confirmDelete =
    confirm(
      "क्या यह routine delete करना है?"
    );

  if (!confirmDelete) {
    return;
  }

  routines =
    routines.filter(function (task) {

      return task.id !== id;

    });

  localStorage.setItem(
    "timeCoachRoutines",
    JSON.stringify(routines)
  );

  renderRoutines();

  updateNextRoutine();
};


/* ========================================
   DISPLAY ROUTINES
======================================== */

function renderRoutines() {

  const list =
    document.getElementById(
      "routineList"
    );

  if (!list) {
    return;
  }

  list.innerHTML = "";

  if (routines.length === 0) {

    list.innerHTML =
      '<p class="empty">No routine added yet</p>';

    return;
  }

  routines.forEach(function (task) {

    const div =
      document.createElement("div");

    div.className =
      "routine-item";

    div.innerHTML = `

      <div class="routine-info">

        <div class="routine-name">
          ${task.name}
        </div>

        <div class="routine-time">
          ⏰ ${formatTime(task.time)}
        </div>

      </div>

      <button
        class="delete-btn"
        onclick="deleteRoutine(${task.id})"
      >
        🗑️ Delete
      </button>

    `;

    list.appendChild(div);

  });

  updateNextRoutine();
}


/* ========================================
   FORMAT TIME
======================================== */

function formatTime(time) {

  const parts =
    time.split(":");

  let hour =
    parseInt(parts[0], 10);

  const minute =
    parts[1];

  let ampm = "AM";

  if (hour >= 12) {
    ampm = "PM";
  }

  if (hour === 0) {

    hour = 12;

  }
  else if (hour > 12) {

    hour = hour - 12;

  }

  return (
    hour +
    ":" +
    minute +
    " " +
    ampm
  );
}


/* ========================================
   NEXT ROUTINE
======================================== */

function updateNextRoutine() {

  const box =
    document.getElementById(
      "nextTask"
    );

  if (!box) {
    return;
  }

  if (routines.length === 0) {

    box.textContent =
      "No task scheduled";

    return;
  }

  const now =
    new Date();

  const currentMinutes =
    now.getHours() * 60 +
    now.getMinutes();

  let nextTask = null;

  for (
    let i = 0;
    i < routines.length;
    i++
  ) {

    const parts =
      routines[i].time.split(":");

    const taskMinutes =
      parseInt(parts[0], 10) * 60 +
      parseInt(parts[1], 10);

    if (
      taskMinutes >=
      currentMinutes
    ) {

      nextTask =
        routines[i];

      break;
    }

  }

  if (!nextTask) {

    box.innerHTML =
      "🌙 आज का routine पूरा हो गया";

    return;
  }

  box.innerHTML = `

    <strong>
      ${nextTask.name}
    </strong>

    <br>

    <span>
      ⏰ ${formatTime(nextTask.time)}
    </span>

  `;
}


/* ========================================
   ENABLE NOTIFICATIONS
======================================== */

window.enableNotifications = function () {

  if (!("Notification" in window)) {

    alert(
      "इस browser में notification support नहीं है।"
    );

    return;
  }

  Notification
    .requestPermission()
    .then(function (permission) {

      if (
        permission === "granted"
      ) {

        alert(
          "Reminder चालू हो गया ✅"
        );

      }
      else {

        alert(
          "Notification की permission नहीं मिली।"
        );

      }

    })
    .catch(function () {

      alert(
        "Notification चालू नहीं हो पाया।"
      );

    });
};


/* ========================================
   SIMPLE DEFAULT VOICE
======================================== */

function speakTimeCoach(message) {

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

    /*
       कोई selected voice नहीं।
       Phone की default voice इस्तेमाल होगी।
    */

    speech.lang = "hi-IN";

    speech.volume = 1;

    speech.rate = 0.75;

    speech.pitch = 1;

    speech.onstart = function () {

      console.log(
        "Time Coach voice started"
      );

    };

    speech.onend = function () {

      console.log(
        "Time Coach voice finished"
      );

    };

    speech.onerror = function (event) {

      console.log(
        "Time Coach voice error:",
        event.error
      );

    };

    window.speechSynthesis.speak(
      speech
    );

    /*
       कुछ Android phones में speech
       pause हो सकती है।
    */

    setTimeout(function () {

      try {

        window.speechSynthesis.resume();

      }
      catch (error) {

        console.log(error);

      }

    }, 100);

  }
  catch (error) {

    console.log(
      "Speech error:",
      error
    );

  }
}


/* ========================================
   TEST VOICE
======================================== */

window.testVoice = function () {

  if (
    !("speechSynthesis" in window)
  ) {

    alert(
      "इस phone में voice support नहीं मिला"
    );

    return;
  }

  const person =
    localStorage.getItem(
      "timeCoachPerson"
    ) || "Rahul";

  const message =
    person +
    " ji, Time Coach ready hai.";

  speakTimeCoach(message);
};


/* ========================================
   LOCAL DATE
======================================== */

function getTodayDate() {

  const now =
    new Date();

  const year =
    now.getFullYear();

  const month =
    String(
      now.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      now.getDate()
    ).padStart(2, "0");

  return (
    year +
    "-" +
    month +
    "-" +
    day
  );
}


/* ========================================
   CHECK CURRENT TIME
======================================== */

function checkRoutineReminder() {

  if (routines.length === 0) {
    return;
  }

  const now =
    new Date();

  const currentTime =
    String(
      now.getHours()
    ).padStart(2, "0")
    +
    ":"
    +
    String(
      now.getMinutes()
    ).padStart(2, "0");

  routines.forEach(function (task) {

    if (
      task.time ===
      currentTime
    ) {

      const today =
        getTodayDate();

      const reminderKey =
        "routineReminder_" +
        task.id +
        "_" +
        today;

      if (
        localStorage.getItem(
          reminderKey
        ) !== "done"
      ) {

        showReminder(task);

        localStorage.setItem(
          reminderKey,
          "done"
        );

      }

    }

  });
}


/* ========================================
   SHOW REMINDER
======================================== */

function showReminder(task) {

  const person =
    localStorage.getItem(
      "timeCoachPerson"
    ) || "Rahul";

  const parts =
    task.time.split(":");

  let hour =
    parseInt(parts[0], 10);

  const minute =
    parseInt(parts[1], 10);

  let ampm = "AM";

  if (hour >= 12) {
    ampm = "PM";
  }

  if (hour === 0) {

    hour = 12;

  }
  else if (hour > 12) {

    hour = hour - 12;

  }

  let timeText;

  if (minute === 0) {

    timeText =
      hour +
      " baj gaya hai";

  }
  else {

    timeText =
      hour +
      " bajkar " +
      minute +
      " minute ho gaye hain";

  }

  const message =
    person +
    " ji, " +
    timeText +
    ". " +
    task.name +
    " ka time ho gaya hai.";

  /* =====================================
     🔊 VOICE
  ===================================== */

  speakTimeCoach(message);


  /* =====================================
     📱 REMINDER CARD
  ===================================== */

  const oldCard =
    document.getElementById(
      "timeCoachReminder"
    );

  if (oldCard) {
    oldCard.remove();
  }

  const card =
    document.createElement("div");

  card.id =
    "timeCoachReminder";

  card.innerHTML = `

    <div style="
      position:fixed;
      top:50%;
      left:50%;
      transform:translate(-50%,-50%);
      width:85%;
      max-width:360px;
      background:#111;
      color:#fff;
      padding:28px 20px;
      border-radius:20px;
      text-align:center;
      z-index:99999;
      box-shadow:0 10px 40px rgba(0,0,0,0.5);
      border:2px solid #d4af37;
    ">

      <div style="
        font-size:42px;
        margin-bottom:10px;
      ">
        ⏰
      </div>

      <h2 style="
        color:#d4af37;
        margin:5px 0 15px;
      ">
        TIME COACH
      </h2>

      <div style="
        font-size:20px;
        margin-bottom:8px;
      ">
        ${person} ji
      </div>

      <div style="
        font-size:18px;
        margin-bottom:8px;
      ">
        ${timeText}
      </div>

      <div style="
        font-size:22px;
        font-weight:bold;
        margin:15px 0 25px;
      ">
        ${task.name}
      </div>

      <button
        onclick="
          document
          .getElementById(
            'timeCoachReminder'
          )
          .remove()
        "
        style="
          width:100%;
          padding:14px;
          border:none;
          border-radius:12px;
          background:#d4af37;
          color:#111;
          font-size:18px;
          font-weight:bold;
        "
      >
        OK ✓
      </button>

    </div>

  `;

  document.body.appendChild(card);


  /* =====================================
     🔔 NOTIFICATION
  ===================================== */

  if (
    "Notification" in window &&
    Notification.permission === "granted"
  ) {

    try {

      new Notification(
        "⏱️ Time Coach",
        {
          body: message
        }
      );

    }
    catch (error) {

      console.log(
        "Notification error:",
        error
      );

    }

  }

}


/* ========================================
   START APP
======================================== */

window.addEventListener(
  "DOMContentLoaded",
  function () {

    loadPerson();

    renderRoutines();

    updateNextRoutine();

    checkRoutineReminder();

  }
);


/* ========================================
   CHECK EVERY SECOND
======================================== */

setInterval(
  function () {

    updateNextRoutine();

    checkRoutineReminder();

  },
  1000
);
