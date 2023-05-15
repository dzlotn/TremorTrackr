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
let freqchart = null
let powerchart = null

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
  createCSVChart("EMGChart", "Raw Electromyography", "Signal (V)");
  collecting = true
  createfreqChart(currentUser.uid);
  createPowerChart(currentUser.uid);

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

// --------------------- Get Previous Days ------------------
document.getElementById("getHistory").onclick = async function () {
  getUsername()
  let date = document.getElementById("historyDate").value
  const avgFrequency = document.getElementById("historyFreq")
  const avgPower = document.getElementById("historyPower")

  date = date.slice(8,10)+'-'+date.slice(5,7)+'-'+date.slice(0,4)
  const result = await getHistory(currentUser.uid, date)

  if (!result) {
    alert(`No data for ${date} found`)
    return
  }
  
  avgFrequency.innerHTML = "Average Frequency: " + result.frequency
  avgPower.innerHTML = "Average Power: " + result.power
}


// ------------- Update charts every couple seconds ---------
let delay = 1000;
setInterval(async function () {
  if (collecting) {
    console.log(freqchart.data.datasets[0].data )
    const data = await getCSVData();
    IMUchart.data.labels = data.xTime;
    IMUchart.data.datasets[0].data = data.yIMU;
    EMGchart.data.labels = data.xTime;
    EMGchart.data.datasets[0].data = data.yEMG;

    IMUchart.update('none');
    EMGchart.update('none');
    const fdata = await getDataSet(currentUser.uid, "frequency");
    const pdata = await getDataSet(currentUser.uid, "power");
    freqchart.data.datasets[0].data = fdata;
    powerchart.data.datasets[0].data = pdata;

   
    freqchart.update('none');
    powerchart.update('none');
  }
}, delay);


// ------------------------ Chart.js ----------------------------------
// Graph CSV data using chart.js
async function getCSVData() {
  const response = await fetch('/data');
  const data = await response.json()

  const xTime = data.map(item => { return parseInt(item.KEY) * 20}); // x20 approximates ms between each csv data point
  const yEMG = data.map(item => { return (parseFloat(item.EMG) * 5) / 1023 });
  const yIMU = data.map(item => { return parseFloat(item.IMU) });

  return { xTime, yEMG, yIMU };
}

// Graph data in CSV data file
async function createCSVChart(id, title, scale) {
  const data = await getCSVData();
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
          beginAtZero: true,

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
async function getDataSet(userID, datatype) {
  const maxHistory = 120; // Age in seconds of a datapoint until it won't show
  const now = new moment();
  const date = now.format('DD-MM-YYYY')

  const dataArray = [];

  const dataRef = ref(db, `users/${userID}/data/${date}/${datatype}`);
  const snapshot = await get(dataRef);

  snapshot.forEach((childSnapshot) => {
    
    const key = childSnapshot.key;
    const value = childSnapshot.val();
    if ((now.diff(moment(key, "DD-MM-yyyy HH:mm:ss"), "seconds")) < maxHistory) {
      dataArray.push({ x: key, y: value })
    }
  });

  return dataArray
}

async function getHistory(userID, date) {
  let freqArray = [];
  let powerArray = [];

  const fdataRef = ref(db, `users/${userID}/data/${date}/frequency`);
  const fsnapshot = await get(fdataRef);
  fsnapshot.forEach((childSnapshot) => {
    freqArray.push(childSnapshot.val());
  });

  const pdataRef = ref(db, `users/${userID}/data/${date}/power`);
  const psnapshot = await get(pdataRef);
  psnapshot.forEach((childSnapshot) => {
    powerArray.push(childSnapshot.val());
  });

  if (freqArray.length === 0 || powerArray.length === 0) {
    return null
  }

  const freqAverage = freqArray.reduce((a, b) => a + b) / freqArray.length
  const powerAverage = powerArray.reduce((a, b) => a + b) / powerArray.length

  return {frequency: freqAverage, power: powerAverage}
}

// Function to create a Chart.js tremor dominant frequency graph with the retrieved data
async function createfreqChart(userID) {
  const chartData = await getDataSet(userID, 'frequency');

  const ctx = document.getElementById("calcChart").getContext("2d");
  const chart = new Chart(ctx, {
    type: "line",
    data: {
      datasets: [
        {
          data: chartData,
          borderColor: 'rgba(255, 99, 132, 1)',
        },
      ],
    },
    options: {
      responsive: true,                  
      animation: {
        duration: 1000,
        easing: 'linear',
      },
      scales: {                     

        x: {
          type: 'time',
          time: {
            unit: 'second',
            displayFormats: {
              second: 'mm'
            },
            parser: 'dd-MM-yyyy HH:mm:ss'
          },
          ticks: {
            source: 'data',
            beginAtZero: true,

    
          },
        
          title: {
            display: true,
            text: 'Time (min)'
          }
          
        },
        y: {
          title: {
            display: true,
            text: 'Tremor Dominant Frequency (Hz)',
          },
          

        }
      },
      plugins: {                        
        title: {
          display: true,
          text: 'Tremor Dominant Frequency over Time',
          padding: {
            top: 10,
            bottom: 30
          }
        },
        legend: {
          display: false,
        },

      }
    }
  });
  freqchart = chart
}

// Function to create a Chart.js tremor power graph with the retrieved data

async function createPowerChart(userID) {
  const chartData = await getDataSet(userID, 'power');

  const ctx = document.getElementById("powerChart").getContext("2d");
  const chart = new Chart(ctx, {
    type: "line",
    data: {
      // labels: chartData.keyArray,
      datasets: [
        {
          data: chartData,
          borderColor: 'rgba(255, 99, 132, 1)',
        },
      ],
    },
    options: {
      responsive: true,                  
      animation: {
        duration: 1000,
        easing: 'linear',
      },
      scales: {                           

        x: {
          type: 'time',
          time: {
            unit: 'second',
            displayFormats: {
              second: 'mm'
            },
            parser: 'dd-MM-yyyy HH:mm:ss'
          },
          ticks: {
            source: 'data',
            beginAtZero: true,

    
          },
        
          title: {
            display: true,
            text: 'Time (min)'
          }
          
        },
        y: {
          title: {
            display: true,
            text: 'Tremor Power (dB/Hz)',
          },

        }
      },
      plugins: {                        
        title: {
          display: true,
          text: 'Tremor Power over Time',
          padding: {
            top: 10,
            bottom: 30
          }
        },
        legend: {
          display: false,
        },

      }
    }
  });
  powerchart = chart
}