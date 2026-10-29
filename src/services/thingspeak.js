// ThingSpeak REST API Integration & Sensor Data Processor
// Note: Only READ requests are made from client-side. Write keys are never exposed.

export async function fetchThingSpeakFeed(channelId, readApiKey = '') {
  if (!channelId || channelId.trim() === '') {
    throw new Error('Please specify a valid ThingSpeak Channel ID');
  }

  const cleanChannel = channelId.trim();
  const cleanKey = readApiKey ? readApiKey.trim() : '';

  let url = `https://api.thingspeak.com/channels/${cleanChannel}/feeds.json?results=1`;
  if (cleanKey) {
    url += `&api_key=${encodeURIComponent(cleanKey)}`;
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
    // Timeout handling
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`ThingSpeak Channel #${cleanChannel} not found. Verify the Channel ID.`);
    } else if (response.status === 400 || response.status === 403) {
      throw new Error('Channel is private or invalid Read API Key was provided.');
    } else {
      throw new Error(`ThingSpeak returned HTTP ${response.status}: ${response.statusText}`);
    }
  }

  const json = await response.json();
  if (!json || !json.feeds || json.feeds.length === 0) {
    return {
      channel: json.channel || {},
      latestFeed: null,
      isEmpty: true,
      timestamp: new Date().toISOString(),
    };
  }

  const feed = json.feeds[0];
  const channel = json.channel || {};

  // Extract readings:
  // field1: Fill Level (%)
  // field2: Distance (cm)
  // field3: Tilt Angle / Overturn flag (0/1 or degrees)
  // field4: Battery % or status code
  const fillLevel = feed.field1 !== null && feed.field1 !== undefined ? parseFloat(feed.field1) : null;
  const distanceCm = feed.field2 !== null && feed.field2 !== undefined ? parseFloat(feed.field2) : null;
  const rawTilt = feed.field3 !== null && feed.field3 !== undefined ? parseFloat(feed.field3) : 0;
  const battery = feed.field4 !== null && feed.field4 !== undefined ? parseFloat(feed.field4) : null;

  const isOverturned = rawTilt > 45 || rawTilt === 1;

  return {
    channel: {
      id: channel.id,
      name: channel.name,
      description: channel.description,
      fields: {
        field1: channel.field1 || 'Fill Level (%)',
        field2: channel.field2 || 'Distance (cm)',
        field3: channel.field3 || 'Tilt Status',
        field4: channel.field4 || 'Battery / Status',
      },
    },
    latestFeed: {
      entry_id: feed.entry_id,
      created_at: feed.created_at,
      fillLevel: isNaN(fillLevel) ? null : Math.min(100, Math.max(0, Math.round(fillLevel))),
      distanceCm: isNaN(distanceCm) ? null : parseFloat(distanceCm.toFixed(1)),
      tiltAngle: isNaN(rawTilt) ? 0 : Math.round(rawTilt),
      isOverturned,
      batteryPercent: isNaN(battery) ? null : Math.min(100, Math.max(0, Math.round(battery))),
    },
    raw: feed,
    timestamp: feed.created_at || new Date().toISOString(),
  };
}

// Generates complete Arduino C++ code for ESP32 with HC-SR04 & MPU6050
export function getEsp32ArduinoFirmwareCode(channelId = 'YOUR_CHANNEL_ID', writeApiKey = 'YOUR_WRITE_API_KEY') {
  return `/*
 * EcoBin IoT Dustbin Firmware (ESP32)
 * Hardware:
 *   - ESP32 DevKit v1
 *   - HC-SR04 Ultrasonic Sensor (Trig: Pin 5, Echo: Pin 18)
 *   - MPU-6050 Accelerometer / Tilt Sensor (I2C: SDA Pin 21, SCL Pin 22)
 *   - On-board LED for status ping (Pin 2)
 *
 * Sends telemetry to ThingSpeak every 20 seconds:
 *   Field 1: Fill percentage (%)
 *   Field 2: Distance measured (cm)
 *   Field 3: Tilt angle / Overturned flag (degrees)
 *   Field 4: Battery level (%)
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>

// WiFi Configuration
const char* WIFI_SSID = "CAMPUS_IOT_WIFI";
const char* WIFI_PASS = "YOUR_WIFI_PASSWORD";

// ThingSpeak Configuration
const char* THINGSPEAK_SERVER = "http://api.thingspeak.com";
const unsigned long CHANNEL_ID = ${channelId || 2548912};
const char* WRITE_API_KEY = "${writeApiKey || 'YOUR_THINGSPEAK_WRITE_API_KEY'}";

// Ultrasonic Sensor Pins
const int TRIG_PIN = 5;
const int ECHO_PIN = 18;

// Bin physical dimensions (cm)
const float BIN_DEPTH_CM = 80.0;     // Full height of empty bin
const float SENSOR_OFFSET_CM = 5.0;  // Gap from sensor to bin brim

// MPU6050 I2C address
const int MPU_ADDR = 0x68;

void setup() {
  Serial.begin(115200);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(2, OUTPUT);

  // Initialize I2C for MPU6050
  Wire.begin(21, 22);
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x6B); // PWR_MGMT_1 register
  Wire.write(0);    // Wake up MPU-6050
  Wire.endTransmission(true);

  // Connect to Campus WiFi
  Serial.print("Connecting to WiFi: ");
  Serial.println(WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASS);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    digitalWrite(2, !digitalRead(2));
  }
  digitalWrite(2, HIGH);
  Serial.println("\\nWiFi Connected! IP Address: " + WiFi.localIP().toString());
}

float measureDistanceCm() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH, 30000); // 30ms timeout (~5m)
  if (duration == 0) return BIN_DEPTH_CM; // Timeout fallback

  float distance = (duration * 0.0343) / 2.0;
  return constrain(distance, 2.0, BIN_DEPTH_CM);
}

float readTiltAngleDegrees() {
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x3B); // Accelerometer measurements register
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_ADDR, 6, true);

  if (Wire.available() >= 6) {
    int16_t AcX = Wire.read() << 8 | Wire.read();
    int16_t AcY = Wire.read() << 8 | Wire.read();
    int16_t AcZ = Wire.read() << 8 | Wire.read();

    // Calculate inclination angle from vertical Z axis
    float ax = (float)AcX / 16384.0;
    float ay = (float)AcY / 16384.0;
    float az = (float)AcZ / 16384.0;
    float tilt = atan2(sqrt(ax * ax + ay * ay), az) * 180.0 / PI;
    return tilt;
  }
  return 0.0;
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    // 1. Read Distance & calculate Fill %
    float distanceCm = measureDistanceCm();
    float wasteHeightCm = (BIN_DEPTH_CM - distanceCm);
    float fillPercent = constrain((wasteHeightCm / (BIN_DEPTH_CM - SENSOR_OFFSET_CM)) * 100.0, 0.0, 100.0);

    // 2. Read Tilt Sensor
    float tiltAngle = readTiltAngleDegrees();
    bool isOverturned = (tiltAngle > 45.0);

    // 3. Measure Battery / Simulate 18650 cell
    int batteryLevel = 90;

    Serial.printf("[EcoBin Node] Distance: %.1f cm | Fill: %.0f %% | Tilt: %.1f deg (Overturned: %s)\\n",
                  distanceCm, fillPercent, tiltAngle, isOverturned ? "YES" : "NO");

    // 4. Send HTTP GET to ThingSpeak
    HTTPClient http;
    String url = String(THINGSPEAK_SERVER) + "/update?api_key=" + WRITE_API_KEY +
                 "&field1=" + String(fillPercent, 0) +
                 "&field2=" + String(distanceCm, 1) +
                 "&field3=" + String(tiltAngle, 1) +
                 "&field4=" + String(batteryLevel);

    http.begin(url);
    int httpCode = http.GET();
    if (httpCode > 0) {
      Serial.printf("ThingSpeak update success. HTTP Code: %d\\n", httpCode);
    } else {
      Serial.printf("ThingSpeak update failed. Error: %s\\n", http.errorToString(httpCode).c_str());
    }
    http.end();
  } else {
    Serial.println("WiFi Disconnected. Reconnecting...");
    WiFi.reconnect();
  }

  // ThingSpeak rate limit: 15-20 seconds per channel
  delay(20000);
}
`;
}
