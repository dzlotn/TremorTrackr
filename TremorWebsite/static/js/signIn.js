
// ----------------- Firebase Setup & Initialization ------------------------//
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries
  import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
  import { getDatabase, ref, update,get } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

  // Your web app's Firebase configuration
  const firebaseConfig = {
    //Import firebase stuff
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  // Initialize authentication
  const auth = getAuth()
  // return instance of yuor app's firebase real time database (FRD) 
  const db = getDatabase(app)
  //Create variable for error message div
  var err = document.getElementById("error")

// ---------------------- Sign-In User ---------------------------------------//
document.getElementById('signIn').onclick = function(){
    //get the users email and password for sign in
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    // Get the input field


    //Attempt to sign user in
    signInWithEmailAndPassword(auth,email,password)
    .then((userCredential) =>{
        //create a user and store the user ID
        const user= userCredential.user;
        //log sign-in date in DB
        //update will only add the last_login info and won't overwrite anything else
        let logDate = new Date();
        update(ref(db,'users/'+user.uid + '/accountInfo'), {
            last_login:logDate,

        })
        .then(() => {
            //user signed in!
         
            //get snapshot of all the user info and pass it to the login() function
            // and stored in saession or local storage
            get(ref(db, 'users/'+user.uid + '/accountInfo')).then((snapshot)=>{
                if (snapshot.exists()){
                    console.log(snapshot.val());
                    logIn(snapshot.val())
                }
                else{
                    console.log("User does not exist.")
                }
            })
            .catch((error)=>{
                console.log(error);
            });
        })
        .catch(()=>{
            //Sign-in failed...
            alert(error);

        });
    })
    .catch((error)=>{
        err.style.color = "red"
    });

}
// ---------------- Keep User Logged In ----------------------------------//
function logIn(user){
    let keepLoggedIn = document.getElementById('keepLoggedInSwitch').ariaChecked;

    //session storage is temporary (only active while browser open)
    //information is saved as a string(must convert JS object to string)
    //session storage will be cleared with a signOut() function in the home.js
    if(!keepLoggedIn){
        sessionStorage.setItem('user', JSON.stringify(user));
        window.location = "tracker.html"; //browser redirect to home page

    }
    //local storage is permanent(unless you signOut)
    else{
        localStorage.setItem('keepLoggedIn','yes')
        localStorage.setItem('user', JSON.stringify(user));
        window.location = "tracker.html"; //browser redirect to home page
    }


}

