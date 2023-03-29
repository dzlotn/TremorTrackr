// This JS file is for registering a new app user ---------------------------//

// ----------------- Firebase Setup & Initialization ------------------------//
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
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

// ----------------------- Start/Stop Data ------------------------------
document.getElementById("startData").onclick = function () {
  console.log("Starting Data Collection...");
  // Send to app.py
  fetch('/test', {
    "method": "SET",
    "headers": { "Content-Type": "application/json" },
    "body": JSON.stringify({collecting:"start"})
  })

  createCSVChart("accelChart", "Raw Acceleration", "Resultant Acceleration (m/s^2)");
  createCSVChart("EMGChart", "Raw Electromyography", "Signal (mV)");
}

document.getElementById("stopData").onclick = function () {
  console.log("Stopping Data Collection...");
  // Send to app.py
  fetch('/test', {
    "method": "SET",
    "headers": { "Content-Type": "application/json" },
    "body": JSON.stringify({collecting:"stop"})
  })
}


// ------------------------ Chart.js ----------------------------------
// Graph CSV data using chart.js
async function getCSVData() {
  const response = await fetch('/data');
  const data = await response.json()

  const xTime = data.map( item => { return parseInt(item.KEY) });
  const yEMG = data.map( item => { return parseFloat(item.EMG) });
  const yIMU = data.map( item => { return parseFloat(item.IMU) });

  return {xTime, yEMG, yIMU};
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
}