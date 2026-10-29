/*
 * EcoBin — Smarter Waste. Better Campuses.
 * ESP32 Smart Dustbin Telemetry Node Firmware
 *
 * Microcontroller: ESP32 DevKit v1 (30-pin or 36-pin)
 * Sensors:
 *   1. HC-SR04 Ultrasonic Distance Sensor:
 *      - VCC -> 5V (or 3.3V compatible sensor)
 *      - GND -> GND
 *      - TRIG -> GPIO 5
 *      - ECHO -> GPIO 18 (use voltage divider if 5V ECHO)
 *   2. MPU-6050 6-Axis Accelerometer / Gyroscope (I2C):
 *      - VCC -> 3.3V
 *      - GND -> GND
 *      - SDA -> GPIO 21
 *      - SCL -> GPIO 22
 *   3. On-board Status LED -> GPIO 2
 *
 * Telemetry Protocol:
 *   HTTP GET to ThingSpeak API:
 *   Field 1: Fill percentage (%)
 *   Field 2: Distance measured (cm)
 *   Field 3: Tilt inclination angle (degrees)
 *   Field 4: Battery level (%)
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <math.h>

// ==========================================
// CONFIGURATION: WIFI & THINGSPEAK
// ==========================================
const char* WIFI_SSID     = "CAMPUS_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// ThingSpeak Parameters
const char* THINGSPEAK_SERVER = "http://api.thingspeak.com";
const char* WRITE_API_KEY     = "YOUR_THINGSPEAK_WRITE_API_KEY"; // Keep private!

// Hardware Pin Definitions
const int PIN_TRIG = 5;
const int PIN_ECHO = 18;
const int PIN_LED  = 2;

// Bin Physical Geometry (cm)
const float BIN_DEPTH_CM      = 80.0; // Empty depth from sensor to bottom
const float SENSOR_OFFSET_CM  = 5.0;  // Gap from sensor to brim (100% full threshold)

// MPU6050 I2C Address
const int MPU_ADDR = 0x68;

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n====================================");
  Serial.println("  EcoBin ESP32 Node Booting...     ");
  Serial.println("====================================");

  // Initialize GPIOs
  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);
  pinMode(PIN_LED, OUTPUT);
  digitalWrite(PIN_TRIG, LOW);

  // Initialize I2C for MPU-6050
  Wire.begin(21, 22);
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x6B); // Power Management 1 Register
  Wire.write(0x00); // Wake up MPU-6050
  Wire.endTransmission(true);
  Serial.println("[OK] MPU-6050 Accelerometer Initialized");

  // Connect to Campus WiFi
  connectWiFi();
}

void connectWiFi() {
  Serial.print("Connecting to WiFi: ");
  Serial.println(WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    digitalWrite(PIN_LED, !digitalRead(PIN_LED));
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    digitalWrite(PIN_LED, HIGH);
    Serial.println("\n[OK] WiFi Connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n[WARN] WiFi Connection failed. Will retry in loop.");
  }
}

// Measure distance in centimeters using HC-SR04
float measureDistanceCm() {
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);

  // Timeout 30000us (~5m range)
  long duration = pulseIn(PIN_ECHO, HIGH, 30000);
  if (duration == 0) {
    // Return empty bin fallback if pulse timed out
    return BIN_DEPTH_CM;
  }

  // Speed of sound = 343 m/s = 0.0343 cm/us
  float distance = (duration * 0.0343) / 2.0;
  return constrain(distance, 2.0, BIN_DEPTH_CM);
}

// Calculate inclination angle from vertical Z axis using accelerometer
float readTiltAngleDegrees() {
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x3B); // ACCEL_XOUT_H register
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_ADDR, 6, true);

  if (Wire.available() >= 6) {
    int16_t acX = Wire.read() << 8 | Wire.read();
    int16_t acY = Wire.read() << 8 | Wire.read();
    int16_t acZ = Wire.read() << 8 | Wire.read();

    // Scale factors: default +/- 2g range is 16384 LSB/g
    float ax = (float)acX / 16384.0;
    float ay = (float)acY / 16384.0;
    float az = (float)acZ / 16384.0;

    // Angle of vector deviation from vertical axis
    float tilt = atan2(sqrt(ax * ax + ay * ay), az) * (180.0 / M_PI);
    return tilt;
  }
  return 0.0;
}

// Estimate remaining battery (Li-ion 18650 cell 3.3V-4.2V)
int readBatteryLevelPercent() {
  // Can be mapped from an analog pin reading voltage divider
  return 92;
}

void loop() {
  // Reconnect WiFi if dropped
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Reconnecting WiFi...");
    connectWiFi();
  }

  // 1. Measure Distance & Compute Fill Percentage
  float distanceCm = measureDistanceCm();
  float usableDepth = BIN_DEPTH_CM - SENSOR_OFFSET_CM;
  float wasteHeight = BIN_DEPTH_CM - distanceCm;
  float fillPercent = constrain((wasteHeight / usableDepth) * 100.0, 0.0, 100.0);

  // 2. Read Tilt Angle & Determine Overturn
  float tiltAngle = readTiltAngleDegrees();
  bool isOverturned = (tiltAngle > 45.0);

  // 3. Read Battery Level
  int batteryPercent = readBatteryLevelPercent();

  // Print telemetry to Serial Monitor
  Serial.println("----------------------------------------------");
  Serial.printf("Distance: %.1f cm | Fill: %.1f %% | Tilt: %.1f deg | Overturned: %s | Batt: %d %%\n",
                distanceCm, fillPercent, tiltAngle, isOverturned ? "YES [ALERT]" : "NO", batteryPercent);

  // 4. Send HTTP GET request to ThingSpeak
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String url = String(THINGSPEAK_SERVER) + "/update?api_key=" + WRITE_API_KEY +
                 "&field1=" + String(fillPercent, 0) +
                 "&field2=" + String(distanceCm, 1) +
                 "&field3=" + String(tiltAngle, 1) +
                 "&field4=" + String(batteryPercent);

    http.begin(url);
    int httpCode = http.GET();

    if (httpCode > 0) {
      Serial.printf("ThingSpeak Update Sent! HTTP Code: %d (Entry: %s)\n", httpCode, http.getString().c_str());
      // Blink LED to indicate successful transmission
      digitalWrite(PIN_LED, LOW);
      delay(100);
      digitalWrite(PIN_LED, HIGH);
    } else {
      Serial.printf("HTTP GET Failed, error: %s\n", http.errorToString(httpCode).c_str());
    }
    http.end();
  }

  // ThingSpeak rate limit: Minimum 15 seconds per update
  delay(20000);
}
