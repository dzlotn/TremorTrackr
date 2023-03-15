from flask import Flask, render_template, url_for, request, jsonify
from datetime import datetime
import pyrebase
import csv
import threading
from processor import start_processing
import os
from concurrent.futures import ThreadPoolExecutor,as_completed
import time
import pandas as pd
import numpy as np


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
    return render_template("register.html",js="js/register.js")

@app.route("/signIn")
def signIn():
    return render_template("signIn.html",js="js/signIn.js")

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
            # Get data from Arduino and parse
            IMU, EMG = request.args.get('data').split(",")
            
            # Update csv from values
            field_names = ['KEY','EMG','IMU']
            dict= {'KEY': key, 'EMG': int(EMG), 'IMU': float(IMU)}
            with open('TremorWebsite\data\data.csv', 'w') as csvfile:
                    writer = csv.DictWriter(csvfile, fieldnames = field_names)
                    writer.writerows(dict)

            # Every 3000ms, call processor to process chunk
            if key % 3000 == 0 and key != 0:
                t1 = threading.Thread(target=start_processing).start()

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

    # if os.path.exists(filename):
    #     os.remove(filename)

    # f = open(filename, "r")
    # f.write("EMG, IMU")
    # df = pd.read_csv('TremorWebsite\data\data.csv')
    # column = df.iloc[:, 0]
    # chunks = np.split(column, 7)
    # arrays = [chunk.to_numpy() for chunk in chunks]

    run_flask()