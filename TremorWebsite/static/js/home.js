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
// ----------------------- Get User's Name ------------------------------

//Graph CSV data using chart.js
async function createAccelChart() {

fetch('/data')
  .then(response => response.json())
  .then(data => {
    const time = data.map(row => row.Time);
    const acceleration = data.map(row => row.Accel);
    const ctx = document.getElementById('accelChart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: time,
          datasets: [{
            data: acceleration,
            radius:0,
            borderColor: 'rgba(255, 99, 132, 1)',
            
          }]
        },
        options: {
          animation: {
            duration: 1000,
            easing: 'linear',
          },
          responsive: true,

          plugins:{
            legend: {
            display:false,   
            },
            title: {
                display: true,
                text: 'Resultant Acceleration over Time'
            }
        },
        
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Acceleration (m/s^2)'
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
    });
}
//Graph CSV data using chart.js
async function createEMGChart() {

    fetch('/data')
      .then(response => response.json())
      .then(data => {
        const time = data.map(row => row.Time);
        const EMG = data.map(row=>row.EMG)
        const ctx = document.getElementById('EMGChart').getContext('2d');
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
              labels: time,
              datasets: [{
                label: 'Voltage',
                data: EMG,
                radius:0,
                borderColor: 'rgba(37, 83, 123, 1)',
                
              }]
            },
            options: {
              responsive: true,
              plugins:{
                legend: {
                    display:false,   
                    },
                title: {
                    display: true,
                    text: 'EMG Voltage over Time'
                }
            },
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Voltage'
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
        });
    }
    async function createCalcChart() {

        fetch('/data')
          .then(response => response.json())
          .then(data => {
            const time = data.map(row => row.Time);
            const EMG = data.map(row=>row.EMG)
            const ctx = document.getElementById('EMGChart').getContext('2d');
            const chart = new Chart(ctx, {
                type: 'line',
                data: {
                  labels: time,
                  datasets: [{
                    label: 'Voltage',
                    data: EMG,
                    radius:0,
                    borderColor: 'rgba(37, 83, 123, 1)',
                    
                  }]
                },
                options: {
                  responsive: true,
                  plugins:{
                    legend: {
                        display:false,   
                        },
                    title: {
                        display: true,
                        text: 'EMG Voltage over Time'
                    }
                },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Voltage'
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
            });
        }

createAccelChart()
createEMGChart()
