from flask import Flask, render_template, request, jsonify
from datetime import datetime
import pyrebase
import csv
import threading
from processor import start_processing
import js2py
import os

# Initialize Flask
app = Flask(__name__)

# Initialize global variables
config = {}
key = 0
collect = False
EMG_all = []
IMU_all = []

# Set flask routes for all the web pages with jinja templates
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
    # Return a json of the user stored data file
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

# Flask method for handling GET, SET, and POST requests
# GET: handles incoming data from arduino
# SET: handles requests to switch from collecting and not collecting data
# POST: handles signing in
# POST2: handles signing out
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

        return 'Success', 200
    
    # POST2 request (Signing out)
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
        # Do not collect data if config empty (user not signed in)
        if (bool(config) == False):
            print("FB config is empty")

        # Do not collect data if the start data collection button has not been pressed
        elif collect == False:
            print("User stopped data collection")

        else:
            # Declare variables as globals
            global IMU_all, EMG_all

            # Get data from Arduino and parse
            incoming_data = request.args.get('data').split(",")

            # Check if data sent was an endpoint, if so, calculate values and start thread for data analysis
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

            # If data wasn't an endpoint, split up and parse the packet
            incoming_data = incoming_data[:-1]

            IMU = incoming_data[::2]
            EMG = incoming_data[1::2]

            # Add data points to the data arrays
            IMU_all += [float(x) for x in IMU]
            EMG_all += [int(x) for x in EMG]

            # Add first datapoint of packet to csv for use in chart.js graphs
            row = [key, int(EMG[0]), float(IMU[0])]
            filepath = 'data\data.csv'
            filepathdata = 'data\rawData.csv'
            directory = os.path.dirname(__file__)
            datafile = os.path.join(directory, filepath)
            datafileRaw = os.path.join(directory,filepathdata)
            with open(datafile, 'a', newline='') as csvfile:
                # Check if first data point, in which case csv should be deleted
                writer = csv.writer(csvfile)
                if key == 0:
                    csvfile.truncate(0)
                    writer.writerow(['KEY','EMG','IMU'])
                writer.writerow(row)
                csvfile.close()
            with open(datafileRaw, 'a', newline='') as csvfile2:
                # Check if first data point, in which case csv should be deleted
                writer = csv.writer(csvfile2)
                writer.writerow(row)
                csvfile.close()

            key += 1

        return 'Success'

# Starts up the Flask app on the desired ip address on port 5000
def run_flask():
    #Run app through port 5000
    app.run(debug=True, host='127.0.0.1', port=5000)

if __name__ == '__main__':
    run_flask()