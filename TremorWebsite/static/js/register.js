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
          alert(error)
        })



    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      alert(errorMessage)
      // ..
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
  let emailRegex = /^[a-zA-Z0-9]+@ctemc\.org$/;

  if (isEmptyorSpaces(firstName) || isEmptyorSpaces(lastName) ||
    isEmptyorSpaces(email) || isEmptyorSpaces(password)) {
    alert("Please complete all fields ")
    return false;
  }
  if (!fNameRegex.test(firstName)) {
    alert("The first name should only contain letters.")
    return false;
  }
  if (!lNameRegex.test(lastName)) {
    alert("The last name should only contain letters.")
    return false;
  }
  if (!emailRegex.test(email)) {
    alert("Please enter a valid email")
    return false;
  }
  return true;


}

// --------------- Password Encryption -------------------------------------//

function encryptPass(password) {
  let encrypted = CryptoJS.AES.encrypt(password, password)
  return encrypted.toString();
}
