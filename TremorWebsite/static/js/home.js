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
async function getData() {
    const response = await fetch('/TremorWebsite/data/data.csv');
    const data = await response.text(); //CSV in TEXT format
    const table = data.split('\n').slice(1);  //split by line and cut 0th row
    const xYears = []; //x-axis labels = year values
    const yTemps = []; //y-axis values
    const yNHTemps = [];
    const ySHTemps = [];

    //console.log(table);
    table.forEach(row => {                //operate on each row
        const columns = row.split(','); //split each row into col.
        const year = columns[0];        //assign year val
        xYears.push(year);              //push year value into  array xyears

        const temp = parseFloat(columns[1]);         //global temp. deviation
        yTemps.push(temp + 14);              //push temp values into array yTemps

        const nhTemp = parseFloat(columns[2]);      //NH temp
        yNHTemps.push(nhTemp+14)
        const shTemp = parseFloat(columns[3]);      //SH temp
        ySHTemps.push(shTemp+14)
    });
    return { xYears, yTemps, yNHTemps, ySHTemps };
}
async function createChart() {

    const data = await getData();                    //createchart() will wait until getData processesF 

    // Configured for chart.JS 3.x and above

    const ctx = document.getElementById('myChart');
    const myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.xYears,
            datasets: [{
                label: 'Combined Global Land-Surface Air and Sea-Surface Water Temperature in °C',
                data: data.yTemps,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            },
            {
                label: 'Combined N.H. Land-Surface Air and Sea-Surface Water Temperature in °C',
                data: data.yNHTemps,
                backgroundColor: 'rgba(1, 99, 132, 0.2)',
                borderColor: 'rgba(1, 99, 132, 1)',
                borderWidth: 1
            },
            {
                label: 'Combined S.H. Land-Surface Air and Sea-Surface Water Temperature in °C',
                data: data.ySHTemps,
                backgroundColor: 'rgba(1, 200, 132, 0.2)',
                borderColor: 'rgba(1, 200, 132, 1)',
                borderWidth: 1
            }]
        },

        options: {
            responsive: true,                   // Re-size based on screen size
            scales: {                           // x & y axes display options
                x: {
                    title: {
                        display: true,
                        text: 'Year',
                        font: {
                            size: 20
                        },
                    },
                    ticks:{
                        callback:function(val,index){
                            return index % 5 === 0 ? this.getLabelForValue(val) : '';
                        },
                        font:{
                            size:16
                        }
                    }
                    
                },
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Global Mean Temperatures',
                        font: {
                            size: 12
                        },
                    },
                    ticks:{
                        maxTicksLimit: data.yTemps.length/10,
                        font:{
                            size:12
                        },
                    }
                }
            },
            plugins: {                          // title and legend display options
                title: {
                    display: true,
                    text: 'Combined Land-Surface Air and Sea-Surface Water Temperature in °C',
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
                }
            }
        }
    });
}

createChart()
