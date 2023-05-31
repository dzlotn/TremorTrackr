// Library Inclusions
#include <SPI.h>              // Wireless comms between sensor(s) and Arduino Nano IoT
#include <WiFiNINA.h>         // Used to connect Nano IoT to network
#include <ArduinoJson.h>      // Used for HTTP Request
#include "arduino_secrets.h"  // Used to store private network info
#include <Wire.h>             // Used for I2C
#include <Adafruit_LSM6DSOX.h>

// Define global variables and constants for the circuit & sensor
const int batchSize = 15;
const int totalBatches = 100;
int32_t accelerometer[3];
double resultant;
const int EMG_SIG = A6;
int muscle;
Adafruit_LSM6DSOX sox;
float resultants[batchSize * totalBatches];
int muscles[batchSize * totalBatches];
int batchIndex = 0;
unsigned long batchTime = 0;
unsigned long batchStartTime = 0;


// Global variables related to WiFi
char ssid[] = SECRET_SSID;    // your network SSID (name)
char pass[] = SECRET_PASS;    // your network password (use for WPA, or use as key for WEP)
int keyIndex = 0;             // your network key index number (needed only for WEP)
int status = WL_IDLE_STATUS;

// Initialize the Wifi client library
WiFiClient client;

IPAddress server(172,20,10,4); // for localhost server (server IP address can be found with ipconfig or ifconfig)

unsigned long lastConnectionTime = 0;
const unsigned long postingInterval = 40; // delay between updates, in milliseconds (10L * 50L is around 1 second between requests)

void setup(){
  Serial.begin(9600); // Start serial monitor

  // Pin INPUTS/OUTPUT
  pinMode(EMG_SIG, INPUT);
  pinMode(LED_BUILTIN, OUTPUT);

  // Attempt to establish an I2C connection with IMU sensor
  if (!sox.begin_I2C(0x6B)) {
    Serial.println("Failed to connect to IMU (bad solder?)");
  }

  // Check for the WiFi module:
  if (WiFi.status() == WL_NO_MODULE) {
    Serial.println("Communication with WiFi module failed!"); // don't continue
    while (true);
  }

  // Check if firmware is outdated
  String fv = WiFi.firmwareVersion(); 
  if (fv < WIFI_FIRMWARE_LATEST_VERSION) {
    Serial.println("Please upgrade the firmware");
  }
  
  // Attempt to connect to Wifi network:
  while (status != WL_CONNECTED) {
    Serial.print("Attempting to connect to SSID: ");
    Serial.println(ssid); // Connect to WPA/WPA2 network. Change this line if using open or WEP network:
    status = WiFi.begin(ssid, pass);
    delay(500); // wait 1 second for connection
    digitalWrite(LED_BUILTIN, HIGH);
    delay(500);
    digitalWrite(LED_BUILTIN, LOW);
  }

  printWifiStatus(); // Print the wifi status now that you're connected
}

void loop(){

  StaticJsonDocument<200> doc;

  // If there's incoming data from the net connection, append each character to a variable
  String response = "";
  while (client.available()) {
    char c = client.read();
    response += (c);
  }

  // Print out non-empty responses to serial monitor
  if (response != "") {
    Serial.println(response);
  }

  // Start batch timer if it's the start of a batch
  if (batchIndex == 0) {
    batchStartTime = millis();
  }

  // Collect data
  emg();
  imu();
  batchIndex += 1;

  // If done with all the batches, send data over
  if (batchIndex == batchSize * totalBatches) {
    // note the time the data took to collect
    batchTime = millis() - batchStartTime;

    for (int i = 0; i < totalBatches; i++) {
      httpRequest(i);
      batchIndex = 0;
    }

    httpEnd();
  }
}

// This method makes a HTTP connection to the server:
void httpRequest(int batchNum) {
  // Note the time that the connection was made:
  lastConnectionTime = millis();

  // Close any connection before send a new request to free the socket
  client.stop();
  
  // If there's a successful connection:
  if (client.connect(server, 5000)) {
    Serial.println("connecting...");

    Serial.println("making string");
    String data = "";
    for (int i = 0; i < batchSize; i++) {
      data += String(resultants[i + batchSize * batchNum]) + "," + String(muscles[batchSize * batchNum]) + ",";
    }

    String request = "GET /test?data=" + String(data) + " HTTP/1.1";
    client.println(request);

    // Set the host as server IP address
    client.println("Host: 172.20.10.4");

    // Other request properties
    client.println("User-Agent: ArduinoWiFi/1.1");
    client.println("Connection: close");
    client.println();

    // Note the time that the connection was made:
    lastConnectionTime = millis();
  } else {
    Serial.println("connection failed"); // couldn't make a connection
  }
}

// Send and "END" request to the server to signify it is done with the batch
void httpEnd() {
  // Note the time that the connection was made:
  lastConnectionTime = millis();

  // Close any connection before send a new request to free the socket
  client.stop();
  
  // If there's a successful connection:
  if (client.connect(server, 5000)) {
    Serial.println("ENDING");

    String request = "GET /test?data=END," + String(batchTime) + " HTTP/1.1";
    client.println(request);

    // Set the host as server IP address
    client.println("Host: 172.20.10.4");

    // Other request properties
    client.println("User-Agent: ArduinoWiFi/1.1");
    client.println("Connection: close");
    client.println();

    // Note the time that the connection was made:
    lastConnectionTime = millis();
  } else {
    Serial.println("connection failed"); // couldn't make a connection
  }
}

// Connect to wifi network and display status
void printWifiStatus(){
  Serial.print("SSID: ");
  Serial.println(WiFi.SSID());
  IPAddress ip = WiFi.localIP(); // your board's IP on the network
  Serial.print("IP Address: ");
  Serial.println(ip);
  long rssi = WiFi.RSSI(); // received signal strength
  Serial.print("signal strength (RSSI):");
  Serial.print(rssi);
  Serial.println(" dBm");
}

// Collect emg values
void emg(){
  // Read pin
  muscles[batchIndex] = int(round(analogRead(EMG_SIG)));
}

// Collect imu values
void imu(){
  sensors_event_t accel;
  sensors_event_t gyro;
  sensors_event_t temp;
  sox.getEvent(&accel, &gyro, &temp);

  // Calculate resultant acceleration
  resultants[batchIndex] = sqrt(sq(gyro.gyro.x)+sq(gyro.gyro.y)+sq(gyro.gyro.z));
  if (resultants[batchIndex] < 0.05) {
    resultants[batchIndex] = 0;
  }
}
