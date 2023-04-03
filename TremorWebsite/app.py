from flask import Flask, render_template, request, jsonify
from datetime import datetime
import pyrebase
import csv
import threading
from processor import start_processing
import js2py
import os


app = Flask(__name__)

config = {}
key = 0
collect = False


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/home")
def home():
    return render_template("home.html", js="js/home.js")


@app.route("/about")
def about():
    return render_template("about.html")


@app.route("/interpretation")
def interpretation():
    return render_template("interpretation.html",js="js/interpretation.js")

@app.route("/procedure")
def procedure():
    return render_template("procedure.html")


@app.route('/data')
def data():
    with open('TremorWebsite\data\data.csv') as csvfile:
        reader = csv.reader(csvfile, delimiter=",")
        headers = next(reader)
        data = []
        for row in reader:
            data.append(dict(zip(headers, row)))
    return jsonify(data)


@app.route("/register")
def register():
    return render_template("register.html", js="js/register.js")


@app.route("/signIn")
def signIn():
    return render_template("signIn.html", js="js/signIn.js")


@app.route("/test", methods=["GET", "POST", "SET"])
def test():
    global config, userID, db, timeStamp, key, collect

    # POST request (FB configuration sent from login.js)
    if request.method == "POST":
        # Receive FB credentials, pop uid and assign to userID
        config = request.get_json()
        userID = config.pop("userID")

        print("UserID: " + userID, flush=True)
        print(config, flush=True)

        # Initialize firebase connection
        firebase = pyrebase.initialize_app(config)

        # Create database object
        db = firebase.database()  # root node

        # Timestamp
        timeStamp = datetime.now().strftime("%d-%m-%Y %H:%M:%S")

        # db.child('users/' + userID + '/data/' + timeStamp).update({'testKey2':'testValue'})
        # t1 = threading.Thread(
        #     target=start_processing(db, userID, 3000)).start()
        return 'Success', 200

    # SET request (Set data collection or not)
    elif request.method == "SET":
        c = request.get_json().pop("collecting")
        if c == "start":
            collect = True
        if c == "stop":
            collect = False
        print(collect)
        return 'Success', 200

    # GET request (Get data from Arduino)
    else:
        # Code to GET data from Arduino will go here
        if (bool(config) == False):
            print("FB config is empty")

        elif collect == False:
            print("User stopped data collection")

        else:
            # Get data from Arduino and parse
            IMU, EMG = request.args.get('data').split(",")

            # Update csv from values
            field_names = ['KEY','EMG','IMU']
            row = [key, int(EMG), float(IMU)]
            filepath = 'data\data.csv'
            directory = os.path.dirname(__file__)
            datafile = os.path.join(directory, filepath)
            with open(datafile, 'a', newline='') as csvfile:
                writer = csv.writer(csvfile)
                writer.writerow(row)
                csvfile.close()

            # Every 3000ms after 1500ms, call processor to process chunk and reset the raw data graphs
            if  key % 1000 == 0 and key != 0:
                t1 = threading.Thread(target=start_processing(db, userID,key)).start()
                #js2py.run_file("TremorWebsite\static\js\home.js") 
                
            key += 1 # Update key

        return 'Success'

    # GET Request

# Flask Driver Function


def run_flask():
    #Run app through port 5000 on 
    app.run(debug=True, host='127.0.0.1', port=5000)


if __name__ == '__main__':
    # Create temp csv files
    filename = 'TremorWebsite\data\data.csv'

    run_flask()
