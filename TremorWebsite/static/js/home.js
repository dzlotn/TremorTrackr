// This JS file is for registering a new app user ---------------------------//

// ----------------- Firebase Setup & Initialization ------------------------//
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import 'https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns/dist/chartjs-adapter-date-fns.bundle.min.js';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getDatabase, ref, set, update, child, get } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

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
// Initialize authentication
const auth = getAuth()
// return instance of yuor app's firebase real time database (FRD)
const db = getDatabase(app)
let currentUser = null;

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


// Charts and data
let collecting = false
let IMUchart = null
let EMGchart = null

// ----------------------- Start/Stop Data ------------------------------
document.getElementById("startData").onclick = function () {
  console.log("Starting Data Collection...");
  // Send to app.py
  fetch('/test', {
    "method": "SET",
    "headers": { "Content-Type": "application/json" },
    "body": JSON.stringify({ collecting: "start" })
  })
  getUsername()
  createCSVChart("accelChart", "Raw Acceleration", "Resultant Acceleration (m/s^2)");
  createCSVChart("EMGChart", "Raw Electromyography", "Signal (mV)");
  collecting = true
  //createChart(currentUser.uid);

}

document.getElementById("stopData").onclick = function () {
  console.log("Stopping Data Collection...");
  // Send to app.py
  fetch('/test', {
    "method": "SET",
    "headers": { "Content-Type": "application/json" },
    "body": JSON.stringify({ collecting: "stop" })
  })

  collecting = false
}


// Update charts every couple seconds
let delay = 200;
setInterval(async function() {
  if (collecting) {
    const data = await getCSVData();
    IMUchart.data.labels = data.xTime;
    IMUchart.data.datasets[0].data = data.yIMU;
    EMGchart.data.labels = data.xTime;
    EMGchart.data.datasets[0].data = data.yEMG;
    
    
    IMUchart.update('none');
    EMGchart.update('none');
  }
}, delay);


// ------------------------ Chart.js ----------------------------------
// Graph CSV data using chart.js
async function getCSVData() {
  const response = await fetch('/data');
  const data = await response.json()

  const xTime = data.map(item => { return parseInt(item.KEY) });
  const yEMG = data.map(item => { return parseFloat(item.EMG) });
  const yIMU = data.map(item => { return parseFloat(item.IMU) });

  return { xTime, yEMG, yIMU };
}

// Graph data in CSV data file
async function createCSVChart(id, title, scale) {
  const data = await getCSVData();
  console.log(data);
  const ctx = document.getElementById(id).getContext('2d');
  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.xTime,
      datasets: [{
        data: ((id === "accelChart") ? data.yIMU : data.yEMG),
        radius: 0,
        borderColor: 'rgba(255, 99, 132, 1)',
      }]
    },
    options: {
      animation: {
        duration: 1000,
        easing: 'linear',
      },
      responsive: true,

      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: title
        }
      },

      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: scale
          }
        },
        x: {
          title: {
            display: true,
            text: 'Time (ms)'
          }
        },


      }
    }
  });
  (id === "accelChart") ? IMUchart = chart : EMGchart = chart
}
async function getDataSet(userID) {
  const dataArray = [];

  const dataRef = ref(db, `users/${userID}/data`);
  const snapshot = await get(dataRef);

  if (!snapshot.exists()) {
    setError("error-chart", "No data found");
    return dataArray;
  }

  snapshot.forEach((childSnapshot) => {
    const key = childSnapshot.key;
    const value = childSnapshot.val();
    dataArray.push({ x: key, TDF: value });
  });

  return dataArray;
}



// Function to create a Chart.js chart with the retrieved data
async function createChart(userID) {
  const chartData = await getDataSet(userID);
  console.log(chartData);

  if (chartData.length === 0) {
    setError("error-chart", "No data found");
    return;
  }

  const ctx = document.getElementById("calcChart").getContext("2d");

  new Chart(ctx, {
    type: "line",
    data: {
      datasets: [
        {
          label: "Tremor Dominant Frequency",
          data: chartData,
          borderColor: "gray",
          backgroundColor: "rgba(50, 0, 0, 1)",
          pointRadius: 2,
          pointHoverRadius: 6,
          pointBackgroundColor: "gray",
        },
      ],
    },
    options: {
      title: {
        display: true,
        text: "Tremor Dominant Frequency over Time",
        fontSize: 20,
        fontColor: "black",
      },
      legend: {
        display: false,
      },
      scales: {
        xAxes: [
          {
            type: "time",
            time: {
              displayFormats: {
                minute: "MMM DD, YYYY hh:mm:ss",
              },
            },
            ticks: {
              fontColor: "black",
            },
            gridLines: {
              color: "gray",
            },
          },
        ],
        yAxes: [{
          type: 'linear',
          ticks: {
            fontColor: 'black',
            fontSize: 13,
            min: 0, // Set the minimum value to 0
            max: 200, // Set the maximum value to 200
          },
          gridLines: {
            color: 'grey',
            lineWidth: 0.5,
          },
          scaleLabel: {
            display: true,
            labelString: 'TDF (hz)',
            fontColor: 'black',
            fontSize: 16,
          },
        }]
        
      },
    },
  });
}
