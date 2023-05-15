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
EMG_all = []
IMU_all = []


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
    return render_template("procedure.html", js="js/procedure.js")


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

@app.route("/faq")
def faq():
    return render_template("faq.html", js="js/faq.js")

@app.route("/signIn")
def signIn():
    return render_template("signIn.html", js="js/signIn.js")


@app.route("/test", methods=["GET", "POST", "SET", "POST2"])
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
    
    # Signing out
    elif request.method == "POST2":
        print("logging out")
        config = ''
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
            # Declare variables as globals
            global IMU_all, EMG_all

            # Get data from Arduino and parse
            incoming_data = request.args.get('data').split(",")

            # Check if data sent was an endpoint
            if (incoming_data[0] == "END"):
                time = int(incoming_data[1]) / 1000.0
                freq = int(len(IMU_all) / time)
                print(int(incoming_data[1]))
                print(time)
                print(len(IMU_all))
                print(freq)
                t1 = threading.Thread(target=start_processing(EMG_all, IMU_all, freq, db, userID, key)).start()
                IMU_all, EMG_all = [], []
                key = 0

                return 'Success'

            incoming_data = incoming_data[:-1]

            IMU = incoming_data[::2]
            EMG = incoming_data[1::2]

            IMU_all += [float(x) for x in IMU]
            EMG_all += [int(x) for x in EMG]

            row = [key, int(EMG[0]), float(IMU[0])]
            filepath = 'data\data.csv'
            directory = os.path.dirname(__file__)
            datafile = os.path.join(directory, filepath)
            with open(datafile, 'a', newline='') as csvfile:
                # Check if first data point, in which case csv should be deleted
                writer = csv.writer(csvfile)
                if key == 0:
                    csvfile.truncate(0)
                    writer.writerow(['KEY','EMG','IMU'])
                writer.writerow(row)
                csvfile.close()

            key += 1

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
