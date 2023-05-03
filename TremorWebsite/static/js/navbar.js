// ----------------- Navbar button changes --------------------------------------//

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

// Global variables
let currentUser = null
let signIn = document.getElementById('signIn-nav');
let register = document.getElementById('register-nav')

// Change the "signin" and "register" buttons to name and signout
getUsername()
if (currentUser != null) {
    signIn.innerText = currentUser.firstname
    signIn.href = '#'
    register.innerText = 'Sign Out'
    register.href = '/'
    register.onclick = function() {
        logOut();
    }
}


//console.log(sessionStorage.getItem('user'))

function logOut() {
    sessionStorage.setItem('user', null)
    fetch('/test', {
        "method": "POST2",
        "headers": { "Content-Type": "application/json" }
    })
}

function getUsername() {
    // // Grab the value for the 'keep logged in' switch
    // let keepLoggedIn = localStorage.getItem('keepLoggedIn');

    // // Grab user information passed from signIn.js
    // if (keepLoggedIn == 'yes') {
    //     currentUser = JSON.parse(localStorage.getItem('user'));
    // } else {
    //     currentUser = JSON.parse(sessionStorage.getItem('user'));
    // }
    currentUser = JSON.parse(sessionStorage.getItem('user'));
}