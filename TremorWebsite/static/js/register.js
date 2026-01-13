/*
  TremorTrackr
  Owen Powell, Daniel Zlotnick, Lauren Fleming, Angelina Otero
  5/30/23
  Handles the register page and making accounts
*/

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


// ---------------- Register New Uswer --------------------------------//

document.getElementById('submitData').onclick = function () {
  const firstName = document.getElementById('firstName').value;
  console.log("Hello")
  const lastName = document.getElementById('lastName').value;
  const email = document.getElementById('userEmail').value;

  //Firebase will requrie a password of at least 6 characters
  const password = document.getElementById('userPass').value;

  // Validate user inputs
  if (!validation(firstName, lastName, email, password)) {
    return;
  }

  // Try Firebase first, then fallback to local auth
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in
      const user = userCredential.user;
      // Add user account info to realtime database
      //'Set' will create a new reference or completely replace an existing one
      //Each new user will be placed under the 'users' node
      set(ref(db, 'users/' + user.uid + '/accountInfo'), {
        uid: user.uid,     //save userId for home.js reference
        email: email,
        password: encryptPass(password),
        firstname: firstName,
        lastname: lastName
      })
        .then(() => {
          firebaseConfig.userID = user.uid;
          user.firstname = firstName;
          console.log(JSON.stringify(user))
          sessionStorage.setItem('user', JSON.stringify({
            "uid": user.uid,     //save userId for home.js reference
            "email": email,
            "password": encryptPass(password),
            "firstname": firstName,
            "lastname": lastName}));

          // Send to app.py
          fetch('/test', {
              "method": "POST",
              "headers": { "Content-Type": "application/json" },
              "body": JSON.stringify(firebaseConfig)
          })
          //data saved successfully

          window.location = "home"; // Browser redirect to the home page

        })
        .catch((error) => {
          console.error("Registration error:", error);
          // Fallback to local auth
          registerLocalUser(firstName, lastName, email, password);
        })



    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error("Firebase error:", errorMessage);
      // Fallback to local auth
      registerLocalUser(firstName, lastName, email, password);
    });

}


// --------------- Check for null, empty ("") or all spaces only ------------//
function isEmptyorSpaces(str) {
  return str === null || str.match(/^ *$/) !== null

}

// ---------------------- Validate Registration Data -----------------------//
function validation(firstName, lastName, email, password) {
  let fNameRegex = /^[a-zA-Z]+$/;
  let lNameRegex = /^[a-zA-Z]+$/;
  let emailRegex = /^\w+@(gmail|ctemc|yahoo){1}\.(com|org){1}$/

  if (isEmptyorSpaces(firstName) || isEmptyorSpaces(lastName) ||
    isEmptyorSpaces(email) || isEmptyorSpaces(password)) {
    console.error("Please complete all fields");
    return false;
  }
  if (!fNameRegex.test(firstName)) {
    console.error("The first name should only contain letters.");
    return false;
  }
  if (!lNameRegex.test(lastName)) {
    console.error("The last name should only contain letters.");
    return false;
  }
  if (!emailRegex.test(email)) {
    console.error("Please enter a valid email");
    return false;
  }
  return true;


}

// --------------- Password Encryption -------------------------------------//

function encryptPass(password) {
  let encrypted = CryptoJS.AES.encrypt(password, password)
  return encrypted.toString();
}

// --------------- Local User Registration (Fallback) ---------------------//

function registerLocalUser(firstName, lastName, email, password) {
  fetch('/register_user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: email,
      password: password,
      firstname: firstName,
      lastname: lastName
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Store user in session
      sessionStorage.setItem('user', JSON.stringify({
        "uid": data.user_id,
        "email": data.email,
        "password": encryptPass(password),
        "firstname": data.firstname,
        "lastname": data.lastname
      }));

      // Send to app.py (simulate Firebase config)
      const localConfig = {
        ...firebaseConfig,
        userID: data.user_id
      };
      fetch('/test', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(localConfig)
      });

      window.location = "home"; // Browser redirect to the home page
    } else {
      console.error("Local registration failed:", data.error);
    }
  })
  .catch(error => {
    console.error("Local registration error:", error);
  });
}
