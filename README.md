# TremorTrackr

**TremorTrackr** is a comprehensive tremor monitoring system designed to help individuals with Parkinson's disease and other tremor-related conditions track and analyze their tremors in real-time. The system combines hardware sensors, data processing algorithms, and a web-based interface to provide accurate tremor frequency and power measurements.

## 🎯 Project Overview

TremorTrackr uses dual sensors (IMU and EMG) to measure hand and muscle movement, providing quantitative data about tremor characteristics. This enables users to track treatment effectiveness and monitor tremor patterns throughout the day.

### Key Features

- **Dual Sensor System**: Combines Inertial Measurement Unit (IMU) and Electromyography (EMG) sensors for comprehensive tremor analysis
- **Real-time Data Collection**: Wireless data transmission from Arduino to Flask server
- **Advanced Signal Processing**: Uses Butterworth filtering, Hilbert transforms, and Welch's method for accurate frequency analysis
- **Web-based Interface**: User-friendly dashboard for data visualization and interpretation
- **User Authentication**: Secure local authentication system with encrypted password storage
- **Data Visualization**: Real-time charts and historical data tracking

## 👥 Team

- **Daniel Zlotnick** - Software Engineering (Website, Sensor Development, Data Processing)
- **Lauren Fleming** - Biomedical Engineering (Concept Development, Device Design, Circuitry)
- **Angelina Otero** - Biomedical Engineering (Prototype Design, Device Design, Circuit)
- **Owen Powell** - Software Engineering (Website Design, Sensor Circuit, Sensor Code)

*Project Date: May 30, 2023*

## 📁 Project Structure

```
TremorTrackr/
├── TremorArduino/          # Arduino firmware and hardware code
│   └── api/
│       ├── api.ino         # Main Arduino code for sensor data collection
│       └── arduino_secrets.h  # WiFi credentials (not in repo)
│
├── TremorWebsite/          # Flask web application
│   ├── app.py              # Main Flask application and routes
│   ├── processor.py        # Signal processing algorithms
│   ├── requirements.txt    # Python dependencies
│   ├── vercel.json         # Vercel deployment configuration
│   ├── package.json        # Node.js configuration
│   ├── api/
│   │   └── index.py        # Vercel serverless function entry point
│   ├── templates/          # HTML templates (Jinja2)
│   │   ├── layout.html
│   │   ├── index.html
│   │   ├── home.html
│   │   ├── about.html
│   │   ├── procedure.html
│   │   ├── interpretation.html
│   │   ├── register.html
│   │   ├── signIn.html
│   │   └── faq.html
│   ├── static/
│   │   ├── css/
│   │   │   └── styles.css
│   │   ├── js/             # Frontend JavaScript files
│   │   │   ├── home.js
│   │   │   ├── register.js
│   │   │   ├── signIn.js
│   │   │   ├── signOut.js
│   │   │   ├── procedure.js
│   │   │   ├── interpretation.js
│   │   │   ├── faq.js
│   │   │   └── navbar.js
│   │   └── img/            # Images and assets
│   └── data/               # Data storage
│       ├── data.csv        # Processed data for visualization
│       ├── rawData.csv     # Raw sensor data
│       └── users.csv       # User authentication data
│
└── TremorDataAnalysis/     # Standalone data analysis scripts
    ├── tremorTracker.py    # Data processing and visualization
    └── TestData/
        └── mmc1.csv        # Sample test data
```

## 🔧 Hardware Components

### Required Hardware

- **Arduino Nano IoT 33** - Main microcontroller with WiFi capability
- **Adafruit LSM6DSOX** - 6-DOF IMU sensor (accelerometer + gyroscope)
- **EMG Sensor** - Electromyography sensor for muscle activity detection
- **WiFi Module** - Built into Arduino Nano IoT 33

### Circuit Configuration

- EMG sensor connected to analog pin A6
- IMU sensor connected via I2C (address 0x6B)
- WiFi connection for wireless data transmission

## 💻 Software Components

### Backend (Flask)

- **Flask 3.0.0** - Web framework
- **NumPy** - Numerical computations
- **SciPy** - Signal processing (filtering, FFT, Hilbert transforms)
- **Werkzeug 3.0.1** - WSGI utilities

### Frontend

- **HTML5/CSS3** - Web interface
- **JavaScript** - Client-side interactivity
- **Chart.js** - Data visualization (implied from usage)
- **Bootstrap** - UI framework (implied from CSS classes)

### Arduino Firmware

- **WiFiNINA** - WiFi connectivity
- **ArduinoJson** - JSON parsing
- **Adafruit LSM6DSOX** - IMU sensor library
- **SPI/Wire** - Communication protocols

## 🚀 Installation & Setup

### Prerequisites

- Python 3.8+
- Arduino IDE
- WiFi network access
- Arduino Nano IoT 33 board

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd TremorTrackr
   ```

2. **Install Python dependencies**
   ```bash
   cd TremorWebsite
   pip install -r requirements.txt
   ```

3. **Configure the Flask application**
   - The app runs on `127.0.0.1:5000` by default
   - Update server IP in Arduino code if needed

### Arduino Setup

1. **Install required libraries**
   - Open Arduino IDE
   - Install libraries via Library Manager:
     - WiFiNINA
     - ArduinoJson
     - Adafruit LSM6DSOX
     - Adafruit Unified Sensor

2. **Configure WiFi credentials**
   - Create `arduino_secrets.h` in `TremorArduino/api/`
   - Add your WiFi credentials:
     ```cpp
     #define SECRET_SSID "YourWiFiName"
     #define SECRET_PASS "YourWiFiPassword"
     ```

3. **Update server IP address**
   - In `api.ino`, update the server IP to match your Flask server:
     ```cpp
     IPAddress server(172,20,10,4); // Change to your server IP
     ```
   - Find your server IP using `ipconfig` (Windows) or `ifconfig` (Linux/Mac)

4. **Upload to Arduino**
   - Connect Arduino Nano IoT 33
   - Select board: "Arduino Nano 33 IoT"
   - Upload the sketch

## 📖 Usage

### Starting the Flask Server

```bash
cd TremorWebsite
python app.py
```

The server will start on `http://127.0.0.1:5000`

### Web Interface

1. **Home Page** (`/`) - Landing page with project overview
2. **Register** (`/register`) - Create a new user account
3. **Sign In** (`/signIn`) - Login to existing account
4. **Home Dashboard** (`/home`) - Main user dashboard
5. **Procedure** (`/procedure`) - Instructions for using the device
6. **Interpretation** (`/interpretation`) - View and analyze tremor data
7. **About** (`/about`) - Team information
8. **FAQ** (`/faq`) - Frequently asked questions

### Data Collection Workflow

1. **Connect Arduino**: Ensure Arduino is powered and connected to WiFi
2. **Sign In**: Login to the web application
3. **Start Collection**: Click "Start Data Collection" button
4. **Wear Device**: Place the sensor on your wrist/arm
5. **Collect Data**: System collects data in batches (1500 samples total)
6. **Stop Collection**: Click "Stop Data Collection" when finished
7. **View Results**: Navigate to Interpretation page to see analyzed data

### Data Processing

The system automatically processes collected data using:

1. **Butterworth Filtering**
   - EMG: 4th order, 20-400 Hz bandpass
   - IMU: 2nd order, 0.5-20 Hz bandpass

2. **Hilbert Transform**: Extracts EMG envelope

3. **Welch's Method**: Computes Power Spectral Density (PSD)

4. **Gaussian Interpolation**: Refines frequency estimation

5. **Weighted Averaging**: Combines EMG (25%) and IMU (75%) results

## 🔬 Technical Details

### Data Collection Parameters

- **Batch Size**: 15 samples per batch
- **Total Batches**: 100 batches
- **Total Samples**: 1500 samples per collection session
- **Sampling Rate**: Variable (calculated from collection time)

### Signal Processing Pipeline

1. **Raw Data Collection**: EMG and IMU (gyroscope) data
2. **Filtering**: Bandpass Butterworth filters
3. **EMG Envelope Extraction**: Hilbert transform + absolute value
4. **Detrending**: Remove DC component
5. **PSD Calculation**: Welch's method with Blackman window
6. **Frequency Estimation**: Gaussian interpolation for sub-bin accuracy
7. **Result Calculation**: Weighted combination of EMG and IMU results

### API Endpoints

- `GET /` - Home page
- `GET /home` - User dashboard
- `GET /about` - About page
- `GET /interpretation` - Data interpretation page
- `GET /procedure` - Procedure instructions
- `GET /register` - Registration page
- `GET /signIn` - Sign in page
- `GET /faq` - FAQ page
- `GET /data` - Returns JSON data from data.csv
- `POST /register_user` - Register new user
- `POST /login_user` - Authenticate user
- `GET /test?data=...` - Receive sensor data from Arduino
- `POST /test` - Firebase configuration (legacy)
- `SET /test` - Start/stop data collection
- `POST2 /test` - Sign out

## 🌐 Deployment

### Vercel Deployment

The project includes Vercel configuration for serverless deployment:

- **Runtime**: Python 3.12
- **Entry Point**: `api/index.py`
- **Max Lambda Size**: 15MB

To deploy:
```bash
vercel
```

### Local Development

For local development, run:
```bash
python app.py
```

## 📊 Data Analysis

The `TremorDataAnalysis` directory contains standalone scripts for offline data analysis:

```bash
cd TremorDataAnalysis
python tremorTracker.py
```

This script processes CSV data files and generates power spectral density plots.

## 🔒 Security

- **Password Hashing**: Uses PBKDF2-HMAC-SHA256 with 100,000 iterations
- **Salt Generation**: Unique salt per user using `secrets.token_hex()`
- **User ID**: SHA256 hash of email + salt
- **Local Storage**: User credentials stored in encrypted CSV format

## 📝 Data Format

### CSV Structure

**data.csv** (for visualization):
```csv
KEY,EMG,IMU
0,512,0.05
1,515,0.08
...
```

**users.csv** (authentication):
```csv
user_id,email,password_hash,salt,firstname,lastname,created_at
...
```

## 🐛 Troubleshooting

### Arduino Connection Issues

- Verify WiFi credentials in `arduino_secrets.h`
- Check server IP address matches Flask server
- Ensure Arduino and server are on same network
- Check serial monitor for connection status

### Flask Server Issues

- Verify all dependencies are installed
- Check port 5000 is not in use
- Ensure data directory exists and is writable

### Data Processing Issues

- Verify NumPy and SciPy are correctly installed
- Check data files are not corrupted
- Ensure sufficient data points collected (minimum samples required)

## 📄 License

This project was developed as an academic/research project. Please contact the team for usage permissions.

## 📧 Contact

For questions or contributions, please contact the development team members listed above.

---
