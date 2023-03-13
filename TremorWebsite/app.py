from flask import Flask, render_template, url_for, request, jsonify
from datetime import datetime
import pyrebase

app = Flask(__name__)

config = {}
key = 0

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/home")
def home():
    return render_template("home.html")

@app.route("/about")
def about():
    return render_template("about.html")

@app.route("/interpretation")
def interpretation():
    return render_template("interpretation.html")

@app.route("/procedure")
def procedure():
    return render_template("procedure.html")

@app.route("/register")
def register():
    return render_template("register.html")

@app.route("/signIn")
def signIn():
    return render_template("signIn.html")

@app.route("/test", methods=["GET", "POST"])
def test():
    global config, userID, db, timeStamp, key
    
    # POST request (FB configuration sent from login.js)
    if request.method == "POST":
        # Receive FB credentials, pop uid and assign to userID
        config = request.get_json()
        userID = config.pop("userID")

        print("UserID: " + userID, flush = True)
        print(config, flush = True)

        # Initialize firebase connection
        firebase = pyrebase.initialize_app(config)

        # Create database object
        db = firebase.database() # root node

        # Timestamp
        timeStamp = datetime.now().strftime("%d-%m-%Y %H:%M:%S")

        # db.child('users/' + userID + '/data/' + timeStamp).update({'testKey2':'testValue'})

        return 'Success', 200
    
    else:
        # Code to GET data from Arduino will go here
        if(bool(config) == False):
            print("FB config is empty")

        else:
            # Take parameters from Arduino request & assign value to variable "value"

            value = request.args.get('distance')

            print("Distance: " + value, flush = True)

            db.child('users/' + userID + '/data/' + timeStamp).update({key:value})

            key += 1

        return 'Success'
    
    # GET Request

# Driver Function
if __name__ == "__main__":

    #Run app through port 5000 on 
    app.run(debug=True, host='172.20.10.4', port=5000)

if __name__ == '__main__':
    app.run(debug=True)