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
    "body": JSON.stringify({collecting:"start"})
  })

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
    "body": JSON.stringify({collecting:"stop"})
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
  (id === "accelChart") ? IMUchart = chart : EMGchart = chart
}



async function createChart(uid) {
  const data = await getDataSet(uid);
  console.log(data);
  const mainColor = "#FFFFFF";

  let datasets = null;
  datasets = parseData(data)
  
const ctx = document.getElementById('calcChart');
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
              color: mainColor,
              text: 'Date',
              font: {
                  size: 20
              },
          },
          ticks: {
            color: mainColor,
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
          },
          grid: {
            color: mainColor
          }
      },
      y: {
          beginAtZero: true,
          title: {
              color: mainColor,
              display: true,
              text: 'Miles Ridden',
              font: {
                  size: 20
              },
          },
          ticks: {
            color: mainColor
          },
          grid: {
            color: mainColor
          }
      }
  },
  plugins: {                          // title and legend display options
      title: {
          display: true,
          color: mainColor,
          text: 'Your Rides',
          font: {
              size: 30
          },
          padding: {
              top: 10,
              bottom: 30
          }
      },
      legend: {
          position: 'top',
          labels: {
            color: mainColor
          }
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

globChart = myChart;
}
function parseData(data) {
  const colors = ["#C93226", "#2471C3", "#1EB449", "#D4AC0D", "#AF601A", "#6C3483", "#148F77", "#34495E"]
  const datasets = []
  for (let i = 0; i < data.trails.length; i++) {
    datasets.push({label: data.trails[i], 
                    data: data.rides[i],
                    borderColor: colors[i % 8],
                    backgroundColor: colors[i % 8] + "99",
                    borderWidth: 3,
                    hoverBorderWidth: 3,
                    pointRadius: 8,
                    pointHoverRadius: 10
                  })
  }
  return datasets;
}
