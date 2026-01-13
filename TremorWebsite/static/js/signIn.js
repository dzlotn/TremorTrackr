/*
  TremorTrackr
  Owen Powell, Daniel Zlotnick, Lauren Fleming, Angelina Otero
  5/30/23
  Handles the sign-in page and signing in the user
*/

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

// ---------------------- Sign-In User ---------------------------------------//
document.getElementById('signIn').onclick = function () {
    // Get user's email and password for sign in
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    // Attempt to sign user in with Firebase first, then fallback to local
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Create a user and store the user ID
            const user = userCredential.user;

            // Log sign-in date in DB
            // update will only add the last_login and won't overwrite anything
            let logDate = new Date();
            update(ref(db, 'users/' + user.uid + '/accountInfo'), {
                last_login: logDate,
            })
                .then(() => {
                    // User signed in!
                    // Get snapshot of all the user info
                    // login() function and stored in session or local storage
                    get(ref(db, 'users/' + user.uid + '/accountInfo')).then((snapshot) => {
                        if (snapshot.exists()) {
                            console.log(snapshot.val());
                            logIn(snapshot.val(), firebaseConfig)
                        } else {
                            console.log('User does not exist.');
                        }
                    })
                        .catch((error) => {
                            console.log(error)
                        })
                })
                .catch((error) => {
                    // Sign-in failed
                    console.error("Sign-in error:", error);
                    // Fallback to local auth
                    loginLocalUser(email, password);
                });
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error("Firebase error:", errorMessage);
            // Fallback to local auth
            loginLocalUser(email, password);
        });
}


// ---------------- Keep User Logged In ----------------------------------//
function logIn(user, fbcfg) {
    let keepLoggedIn = document.getElementById('keepLoggedInSwitch').ariaChecked;

    fbcfg.userID = user.uid;

    // Session storage is temporary (only active while browser open)
    // Info saved as a string (must convert JS object to string)
    // Session storage will be cleared with a signOut() function in home.js
    if (!keepLoggedIn) {
        sessionStorage.setItem('user', JSON.stringify(user));
        window.location = "home"; // Browser redirect to the home page

        // Send to app.py
        fetch('/test', {
            "method": "POST",
            "headers": { "Content-Type": "application/json" },
            "body": JSON.stringify(fbcfg)
        })
    }

    // Local storage is permanent (unless you signOut)
    else {
        localStorage.setItem('keepLoggedIn', 'yes')
        localStorage.setItem('user', JSON.stringify(user));
        window.location = "home"; // Browser redirect to the home page

        // Send to app.py
        fetch('/test', {
            "method": "POST",
            "headers": { "Content-Type": "application/json" },
            "body": JSON.stringify(fbcfg)
        })
    }
}

// --------------- Local User Login (Fallback) -----------------------------//

function loginLocalUser(email, password) {
    fetch('/login_user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: email,
            password: password
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const user = data.user;
            let keepLoggedIn = document.getElementById('keepLoggedInSwitch').ariaChecked;

            // Create fake Firebase config for compatibility
            const localConfig = {
                ...firebaseConfig,
                userID: user.uid
            };

            // Store user data
            if (!keepLoggedIn) {
                sessionStorage.setItem('user', JSON.stringify({
                    "uid": user.uid,
                    "email": user.email,
                    "firstname": user.firstname,
                    "lastname": user.lastname
                }));
            } else {
                localStorage.setItem('keepLoggedIn', 'yes');
                localStorage.setItem('user', JSON.stringify({
                    "uid": user.uid,
                    "email": user.email,
                    "firstname": user.firstname,
                    "lastname": user.lastname
                }));
            }

            // Send to app.py
            fetch('/test', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(localConfig)
            });

            window.location = "home"; // Browser redirect to the home page
        } else {
            console.error("Login failed:", data.error);
        }
    })
    .catch(error => {
        console.error("Local login error:", error);
    });
}
