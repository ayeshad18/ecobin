# EcoBin — Smarter Waste. Better Campuses.

EcoBin is a modern, responsive IoT web application designed for smart college campus waste management. It integrates **ESP32 microcontroller nodes** (equipped with ultrasonic distance sensors and 3-axis tilt sensors) with **ThingSpeak** cloud telemetry and a **Firebase-ready** persistent database.

---

## 🎨 Color Palette & Design System

EcoBin intentionally avoids generic green-and-white motifs, adopting a refined collegiate palette:

| Color Name | Hex Code | Purpose |
| :--- | :--- | :--- |
| **Midnight Navy** | `#202B3C` | Primary brand headers, navigation, high-contrast surfaces |
| **Warm Sand** | `#F3EBDD` | Canvas background, card containers, subtle borders |
| **Muted Terracotta** | `#C77962` | Critical alerts (>85% fill), primary action buttons |
| **Dusty Blue** | `#8196AB` | Normal status chips, sensor telemetry cards, secondary accents |
| **Soft Charcoal** | `#42464D` | Typography, overturned status badges, dark button chips |

---

## 🏗️ System Architecture

```
 +---------------------------------------------------------+
 |             ESP32 Campus IoT Node                       |
 |  - HC-SR04 Ultrasonic Distance Sensor (Fill %)          |
 |  - MPU-6050 Accelerometer (Tilt / Overturn Detection)   |
 +---------------------------+-----------------------------+
                             | WiFi (HTTP GET)
                             v
 +---------------------------------------------------------+
 |                 ThingSpeak Cloud Channel                |
 |  Field 1: Fill %  |  Field 2: Distance (cm)             |
 |  Field 3: Tilt °  |  Field 4: Battery %                 |
 +---------------------------+-----------------------------+
                             | REST API (Read-Only)
                             v
 +---------------------------------------------------------+
 |                    EcoBin Web App                       |
 |  - Cleaning Staff Portal (Assigned Zones, Mark Cleaned) |
 |  - Administration Center (KPIs, Fleet CRUD, Audit Logs) |
 |  - Interactive ESP32 Telemetry Simulator                |
 +---------------------------+-----------------------------+
                             |
                             v
 +---------------------------------------------------------+
 |               Persistent Data Storage                   |
 |  - Firebase Cloud Firestore (or LocalStorage Replica)   |
 |  - Collections: dustbins, cleaning_staff, cleaning_logs |
 +---------------------------------------------------------+
```

---

## 🔌 Hardware Circuit & Pinout

### Components:
1. **ESP32 DevKit v1**
2. **HC-SR04 Ultrasonic Sensor** (measures waste depth)
3. **MPU-6050 6-Axis Accelerometer** (detects physical tip-over / vandalism)
4. **Li-ion 18650 Battery** with TP4056 charging module

### Wiring Pinout:
- **HC-SR04 TRIG** ➔ ESP32 `GPIO 5`
- **HC-SR04 ECHO** ➔ ESP32 `GPIO 18` (via 1k/2k resistor voltage divider)
- **MPU-6050 SDA** ➔ ESP32 `GPIO 21` (I2C Data)
- **MPU-6050 SCL** ➔ ESP32 `GPIO 22` (I2C Clock)
- **Status LED**   ➔ ESP32 `GPIO 2`
- **VCC / GND**    ➔ `3.3V / 5V` and `GND`

> The complete Arduino C++ sketch is available in [`firmware/esp32_ecobin.ino`](./firmware/esp32_ecobin.ino).

---

## 👥 Portals & Key Features

### 1. Cleaning Staff Portal
- **Sector Filtering**: Filters bins assigned to the staff member's campus zone (e.g., North Campus, Central Quad, South Campus).
- **Status Indicators**:
  - `Normal` (<60%)
  - `Needs Cleaning` (60% - 85%)
  - `Critical` (>85%)
  - `Overturned` (Tilt angle >45°)
- **Mark as Cleaned Workflow**: Record cleaning time, staff member, bin ID, and before/after fill levels (with celebratory confetti), resetting bin status.
- **Problem Reporting**: Report damaged lids, offline sensors, foul odors, or vandalism.
- **Location Suggestion**: Propose new dustbin locations with justification and foot traffic details.
- **Shift History**: View personal logs of cleanings completed today.

### 2. Administration Center Portal
- **5 KPI Summary Cards**: Total bins, Needs Cleaning, Critical, Overturned, Offline.
- **Fleet Management (CRUD)**: Add, edit, deactivate, or delete dustbins across campus.
- **Staff & Zone Assignments**: Manage cleaning personnel and reassign sectors.
- **Incident Triage**: Review problem reports from staff and mark them `In Progress` or `Resolved`.
- **Suggestions Review**: Approve or decline proposed bin placements.
- **Audit Reports & CSV Export**: Review complete campus cleaning history and download an RFC-compliant `.csv` audit spreadsheet.

### 3. IoT Control & ESP32 Hardware Simulator
- **ThingSpeak REST API Integration**: Safe read-only channel consumer.
- **ESP32 Hardware Event Simulator**: Test how the system responds to real events:
  - 🚨 *Simulate Bin Overturn* (sets tilt to 84°)
  - ⚠️ *Simulate Trash Surge* (spikes fill to 96%)
  - ⚡ *Simulate Device Offline* (triggers communication loss)
  - ✨ *Right Bin Upright & Online* (restores normal state)
- **ESP32 Firmware Guide**: In-app viewer with copyable C++ code.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation & Launch
```bash
# Navigate to project folder
cd ecobin

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit **http://localhost:5173** in your browser.

### Building for Production
```bash
npm run build
```
Generates optimized static assets in the `dist/` directory.

---

## 🔒 Security Best Practices
- **No Secret Write Keys in Frontend**: Only public Channel IDs and optional Read API Keys are processed on the client side.
- ThingSpeak `WRITE_API_KEY` is kept strictly on the ESP32 microcontroller firmware.
