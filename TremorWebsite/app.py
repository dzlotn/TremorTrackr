'''
  TremorTrackr
  Owen Powell, Daniel Zlotnick, Lauren Fleming, Angelina Otero
  5/30/23
  This is the main file which should be ran to start the entire program
  It handles Flask and all the HTTP requests that Flask gets
'''

from flask import Flask, render_template, request, jsonify
from datetime import datetime
# import pyrebase
import csv
import threading
from processor import start_processing
import os
import hashlib
import secrets

# Initialize Flask
app = Flask(__name__, static_folder='static', static_url_path='/static')

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
    directory = os.path.dirname(__file__)
    datafile = os.path.join(directory, 'data', 'data.csv')
    with open(datafile) as csvfile:
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

# Route to serve static files (for Vercel deployment)
@app.route("/static/<path:filename>")
def serve_static(filename):
    return app.send_static_file(filename)

# Local authentication routes (fallback when Firebase is not available)
@app.route("/register_user", methods=["POST"])
def register_user():
    """Register a new user locally using encrypted CSV storage"""
    try:
        data = request.get_json()
        email = data.get('email', '').lower().strip()
        password = data.get('password', '')
        firstname = data.get('firstname', '')
        lastname = data.get('lastname', '')

        if not all([email, password, firstname, lastname]):
            return jsonify({'success': False, 'error': 'All fields required'}), 400

        # Create users directory if it doesn't exist
        directory = os.path.dirname(__file__)
        users_dir = os.path.join(directory, 'data')
        os.makedirs(users_dir, exist_ok=True)
        users_file = os.path.join(users_dir, 'users.csv')

        # Check if user already exists
        if os.path.exists(users_file):
            with open(users_file, 'r', newline='') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    if row.get('email', '').lower() == email:
                        return jsonify({'success': False, 'error': 'User already exists'}), 400

        # Hash password with salt
        salt = secrets.token_hex(16)
        password_hash = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000).hex()

        # Generate user ID
        user_id = hashlib.sha256((email + salt).encode()).hexdigest()[:16]

        # Write to CSV
        file_exists = os.path.exists(users_file)
        with open(users_file, 'a', newline='') as f:
            fieldnames = ['user_id', 'email', 'password_hash', 'salt', 'firstname', 'lastname', 'created_at']
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            if not file_exists:
                writer.writeheader()
            writer.writerow({
                'user_id': user_id,
                'email': email,
                'password_hash': password_hash,
                'salt': salt,
                'firstname': firstname,
                'lastname': lastname,
                'created_at': datetime.now().isoformat()
            })

        return jsonify({
            'success': True,
            'user_id': user_id,
            'email': email,
            'firstname': firstname,
            'lastname': lastname
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route("/login_user", methods=["POST"])
def login_user():
    """Login user using local CSV storage"""
    try:
        data = request.get_json()
        email = data.get('email', '').lower().strip()
        password = data.get('password', '')

        if not email or not password:
            return jsonify({'success': False, 'error': 'Email and password required'}), 400

        directory = os.path.dirname(__file__)
        users_file = os.path.join(directory, 'data', 'users.csv')

        if not os.path.exists(users_file):
            return jsonify({'success': False, 'error': 'Invalid credentials'}), 401

        # Check user credentials
        with open(users_file, 'r', newline='') as f:
            reader = csv.DictReader(f)
            for row in reader:
                if row.get('email', '').lower() == email:
                    salt = row.get('salt', '')
                    stored_hash = row.get('password_hash', '')

                    # Verify password
                    password_hash = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000).hex()

                    if password_hash == stored_hash:
                        return jsonify({
                            'success': True,
                            'user': {
                                'uid': row.get('user_id', ''),
                                'email': row.get('email', ''),
                                'firstname': row.get('firstname', ''),
                                'lastname': row.get('lastname', '')
                            }
                        }), 200

        return jsonify({'success': False, 'error': 'Invalid credentials'}), 401
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

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
        # firebase = pyrebase.initialize_app(config)

        # Create database object
        # db = firebase.database()  # root node

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
            directory = os.path.dirname(__file__)
            datafile = os.path.join(directory, 'data', 'data.csv')
            datafileRaw = os.path.join(directory, 'data', 'rawData.csv')
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

# For Vercel deployment - ensure app is available
__all__ = ['app']