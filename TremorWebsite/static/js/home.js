// ----------------- Firebase Setup & Initialization ------------------------//
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } 
from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";

import { getDatabase, ref, set, update, child, get, remove } 
from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBFAJTz0ORWNa4XWc5V5VPSkj4h2_lrM2s",
    authDomain: "wearable-sensor-project.firebaseapp.com",
    databaseURL: "https://wearable-sensor-project-default-rtdb.firebaseio.com",
    projectId: "wearable-sensor-project",
    storageBucket: "wearable-sensor-project.appspot.com",
    messagingSenderId: "657322824284",
    appId: "1:657322824284:web:dc883d616173145cc00c99"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Authentication
const auth = getAuth();

// Return instance of the app's FRD
const db = getDatabase(app);

let currentUser = null;                               // Initialize currentUser to null



// ----------------------- Get User's Name ------------------------------
function getUsername() {
  // Grab the value for the 'keep logged in' switch
  let keepLoggedIn = localStorage.getItem('keepLoggedIn');

  // Grab user information passed from signIn.js
  if (keepLoggedIn == 'yes') {
    currentUser = JSON.parse(localStorage.getItem('user'));
  } else {
    currentUser = JSON.parse(sessionStorage.getItem('user'));
  }
}


// Sign-out function that will remove user info from local/session storage and
// sign-out from FRD
function signOutUser() {
  sessionStorage.removeItem('user');        // Clear session storage
  localStorage.removeItem('user');          // Clear local stoage
  localStorage.removeItem('keepLoggedIn');

  signOut(auth).then(() => {
    // Sign-out successful.
  }).catch((error) => {
    // An error happened.
  });

  window.location = 'home.html'
}


// --------------------------- Home Page Loading -----------------------------
window.onload = function() {
  getUsername();

  
  // Create chart
  createChart(currentUser.uid);

  // Update data
  document.getElementById('set').onclick = function() {
    const date = document.getElementById('date').value;
    const trail = document.getElementById('trail').value;
    const distance = document.getElementById('distance').value;
    const userID = currentUser.uid;

    console.log(date, trail, distance);

    if (validate(date, trail, distance)) {
      updateData(userID, date, trail, distance);
    }
  }

  // Get data
  document.getElementById('get').onclick = function() {
    const date = document.getElementById('date-get').value;
    const trail = document.getElementById('trail-get').value;
    const userID = currentUser.uid;

    console.log(date, trail);

    if (validateGet(date, trail)) {
      getData(userID, date, trail);
    }
  }

  // Remove data
  document.getElementById('remove').onclick = function() {
    const date = document.getElementById('date-get').value;
    const trail = document.getElementById('trail-get').value;
    const userID = currentUser.uid;

    console.log(date, trail);

    if (validateGet(date, trail)) {
      removeData(userID, date, trail);
    }
  }
}


// ------------------------- Update data in database --------------------------
function updateData(userID, date, trail, distance) {
  // Must use brackets around variable name to use as a key
  update(ref(db, 'users/' + userID + '/data/' + trail), {
    [date]: distance
  })
  .then(() => {
    alert('Data updated successfully.');
  })
  .catch((error) => {
    alert('There was an error. Error: ' + error);
  })
}

//--------------------------- Get data in database -------------------------
function getData(userID, date, trail) {
  let milesVal = document.getElementById('distance-get');

  const dbref = ref(db); // Firebase parameter required for 'get'

  // Provide the path through the nodes to the data
  get(child(dbref, 'users/' + userID + '/data/' + trail)).then((snapshot) => {
    if (snapshot.exists()) {
      milesVal.innerHTML = "Miles Ridden: " + snapshot.val()[date];
      console.log(snapshot.val()[date])
    } else {
      alert('No data found');
    }
  })
  .catch((error) => {
    alert(error);
  })
}


// ---------------------------Get a user's entire data set for the graph --------------------------
async function getDataSet(userID) {
  const trails = [];
  const rides = [];

  const dbref = ref(db);

  // Wait for all data to be pulled from the FRD
  // Provide path through the nodes to the data
  await get(child(dbref, 'users/' + userID + '/data')).then((snapshot) => {
    if (snapshot.exists()) {
      console.log(snapshot.val());

      snapshot.forEach(child => {
        // Push values to arrays
        trails.push(child.key);
        val.push([]);

        // Iterate through all children of a trail
        
      });
    } else {
      alert('No data found')
    }
  })
  .catch((error) => {
    alert('unsuccessful, error ' + error);
  });

  return {trails, val};
}

// --------------------Get a trail's data for the table ----------------------


// -------------------------Delete a day's data from FRD ---------------------
function removeData(userID, date, trail) {
  remove(ref(db, 'users/' + userID + '/data/' + trail + '/' + date)).then(() => {
    alert('Data removed successfully');
  })
  .catch((error) => {
    alert(error)
  })
}





//------------------------- Validate set & get data options ------------------------//
function validate(date, trail, distance) {
  if (isEmptyorSpaces(date) || isEmptyorSpaces(trail) 
    || isEmptyorSpaces(distance)) {
      alert("Please complete all fields.");
      return false;
  }

  if (!isNumeric(distance)) {
    alert("The distance must be a number")
    return false;
  }

  return true;
}

function validateGet(date, trail) {
  if (isEmptyorSpaces(date) || isEmptyorSpaces(trail)) {
      alert("Please complete all fields.");
      return false;
  }

  return true;
}

// -------------- Check if a string is a number ---------------------- //
function isNumeric(str) { // we only process strings!  
  return !isNaN(str) && !isNaN(parseFloat(str))
}

// --------------- Check for null, empty ("") or all spaces only ------------//
function isEmptyorSpaces(str){
  return str === null || str.match(/^ *$/) !== null
}






// ----------------------------- Chart.js ----------------------------------//
async function createChart(uid) {
  const data = await getDataSet(uid);

  const colors = ["#A93226", "#2471A3", "#1E8449", "#D4AC0D", "#AF601A", "#6C3483", "#148F77", "#34495E"]

  const datasets = []
  for (let i = 0; i < data.trails.length; i++) {
    datasets.push({label: data.trails[i], 
                    data: data.rides[i],
                    borderColor: colors[i % 8],
                    backgroundColor: colors[i % 8] + "55",
                    borderWidth: 3,
                    hoverBorderWidth: 3,
                    pointRadius: 6,
                    pointHoverRadius: 10
                  })
  }

  const ctx = document.getElementById('milesChart');
  const myChart = new Chart(ctx, {
  type: 'scatter',
  data: {
      datasets: datasets
  },
  options: {
    responsive: true,                   // Re-size based on screen size
    scales: {                           // x & y axes display options
        x: {
            type: 'time',
            title: {
                display: true,
                text: 'Date',
                font: {
                    size: 20
                },
            },
            ticks: {
              stepSize: 1,
              font: {
                  size: 13
              }
            },
            time: {
              unit: "day",
              displayFormats: {
                 'millisecond': 'MMM DD',
                 'second': 'MMM DD',
                 'minute': 'MMM DD',
                 'hour': 'MMM DD',
                 'day': 'MMM DD',
                 'week': 'MMM DD',
                 'month': 'MMM DD',
                 'quarter': 'MMM DD',
                 'year': 'MMM DD',
              }
            }
        },
        y: {
            beginAtZero: true,
            title: {
                display: true,
                text: 'Miles Ridden',
                font: {
                    size: 20
                },
            }
        }
    },
    plugins: {                          // title and legend display options
        title: {
            display: true,
            text: 'Your Rides',
            font: {
                size: 24
            },
            padding: {
                top: 10,
                bottom: 30
            }
        },
        legend: {
            position: 'top'
        },
        tooltip: {
          callbacks: {
            label: function(ctx) {
              console.log(ctx);
              const label = ctx.dataset.label;
              const val = ctx.parsed.y + " mi";
              const date = ctx.label.slice(0,-13);
              return [label, val, date];
            }
          }
        }
    }
}
});
}