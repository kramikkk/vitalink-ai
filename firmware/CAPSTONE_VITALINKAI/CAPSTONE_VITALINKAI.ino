// Display libraries (GC9A01 round LCD)
#include <lvgl.h>
#include <TFT_eSPI.h>
#include "ui.h"

// Sensor libraries (I2C communication)
#include <Wire.h>
#include <MPU6050.h>
#include <math.h>
#include "MAX30105.h"
#include "heartRate.h"

// Network and connectivity
#include <WiFi.h>
#include <HTTPClient.h>
#include <Preferences.h>
#include <WebSocketsClient.h>

// WiFi configuration and state
Preferences prefs;

WiFiServer wifiServer(80);
bool wifiConnected = false;
bool softAPStarted = false;
unsigned long wifiStartTime = 0;
unsigned long lastWiFiRetry = 0;

#define WIFI_TIMEOUT 60000   // Connection timeout (60 seconds)
#define WIFI_RETRY_INTERVAL 5000  // Retry interval (5 seconds)

// Device pairing state
String pairingCode = "";
String deviceId = "";
unsigned long lastPairingCheck = 0;
const unsigned long PAIRING_CHECK_INTERVAL = 3000;   // Unpaired: check every 3 seconds
const unsigned long PAIRED_CHECK_INTERVAL = 30000;  // Paired: check every 30 seconds

// Sensor data transmission
unsigned long lastDataSend = 0;
const unsigned long DATA_SEND_INTERVAL = 1000;  // Send interval (1 second)

const char* BACKEND_URL = "https://vitalink-ai-backend.onrender.com";

// WebSocket configuration
WebSocketsClient webSocket;
bool wsConnected = false;
const char* WS_HOST = "vitalink-ai-backend.onrender.com";
const int WS_PORT = 443;  // HTTPS port
const char* WS_PATH = "/ws/sensors";

// Display configuration (240x240 round LCD)
static const uint16_t screenWidth  = 240;
static const uint16_t screenHeight = 240;

static lv_disp_draw_buf_t draw_buf;
static lv_color_t buf[ screenWidth * screenHeight / 10 ];

TFT_eSPI tft = TFT_eSPI();

// WiFi setup portal HTML (stored in flash memory)
const char WIFI_HTML[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>VitaLink AI WiFi Setup</title>
  <style>
    html, body {
      height: 100%;
      margin: 0;
    }

    body {
      font-family: Arial, sans-serif;
      background: linear-gradient(135deg, #0a0f0a 0%, #0f1115 25%, #14532d 50%, #0f1115 75%, #0a0f0a 100%);
      background-size: 400% 400%;
      animation: gradientShift 15s ease infinite;
      color: #e5e7eb;
    }

    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    .wrapper {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      box-sizing: border-box;
    }

    .card {
      width: 100%;
      max-width: 360px;
      background: rgba(28, 31, 38, 0.95);
      border-radius: 16px;
      padding: 36px;
      box-shadow: 0 10px 40px rgba(20, 83, 45, 0.4), 0 0 1px rgba(34, 197, 94, 0.3);
      border: 1px solid rgba(34, 197, 94, 0.2);
      text-align: center;
      backdrop-filter: blur(10px);
    }

    h2 {
      margin: 0 0 20px 0;
      color: #f9fafb;
      font-weight: 600;
    }

    select,
    input {
      width: 100%;
      padding: 12px;
      margin: 10px 0;
      border-radius: 10px;
      border: none;
      font-size: 15px;
      box-sizing: border-box;
      background: #2a2f3a;
      color: #e5e7eb;
    }

    select:focus,
    input:focus {
      outline: 2px solid #166534;
    }

    button {
      width: 100%;
      padding: 12px;
      margin-top: 16px;
      background: #166534;
      border: none;
      border-radius: 10px;
      font-size: 16px;
      font-weight: bold;
      color: #ecfdf5;
      cursor: pointer;
    }

    button:active {
      background: #14532d;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <h2>VitaLink AI WiFi Setup</h2>

      <form method="POST">
        <select name="ssid" required>
          {{WIFI_LIST}}
        </select>

        <input
          name="pass"
          type="password"
          placeholder="WiFi Password"
          autocomplete="off"
        >

        <button type="submit">Save & Connect</button>
      </form>
    </div>
  </div>
</body>
</html>
)rawliteral";

// Generate WiFi network list HTML options
String getWiFiListHTML() {
    String options = "";

    int n = WiFi.scanNetworks();

    if (n <= 0) {
        options += "<option>No networks found</option>";
    } else {
        for (int i = 0; i < n; i++) {
            String ssid = WiFi.SSID(i);
            int rssi = WiFi.RSSI(i);

            // Sanitize SSID for HTML injection protection
            ssid.replace("'", "");
            ssid.replace("\"", "");
            ssid.replace("<", "");
            ssid.replace(">", "");

            options += "<option value='";
            options += ssid;
            options += "'>";
            options += ssid;
            options += " (";
            options += rssi;
            options += " dBm)</option>";
        }
    }

    WiFi.scanDelete();
    return options;
}

// Start WiFi Access Point for initial setup
void startSoftAP() {
    if (softAPStarted) return;

    softAPStarted = true;

    WiFi.disconnect(true);
    WiFi.mode(WIFI_AP_STA);
    WiFi.softAP("VitaLink AI Setup");

    Serial.print("[WiFi] AP started: ");
    Serial.println(WiFi.softAPIP());

    wifiServer.begin();

    ui_WiFi_screen_init();
    lv_scr_load(ui_WiFi);

    lv_label_set_text(ui_IP_Address,
        WiFi.softAPIP().toString().c_str());
}

// URL decode function for form data
String urlDecode(String input) {
    input.replace("+", " ");
    for (int i = 0; i < input.length(); i++) {
        if (input[i] == '%' && i + 2 < input.length()) {
            String hex = input.substring(i + 1, i + 3);
            char ch = strtol(hex.c_str(), NULL, 16);
            input = input.substring(0, i) + ch + input.substring(i + 3);
        }
    }
    return input;
}

// Handle WiFi setup portal requests
void handleWiFiPortal() {

    WiFiClient client = wifiServer.available();
    if (!client) return;

    String request = "";
    unsigned long timeout = millis();

    while (client.connected() && millis() - timeout < 1000) {
        if (client.available()) {
            request += client.readString();
            break;
        }
    }

    // Check for WiFi credentials in POST data
    if (request.indexOf("ssid=") != -1) {

        int ssidIndex = request.indexOf("ssid=") + 5;
        int passIndex = request.indexOf("&pass=");
        if (passIndex == -1) {
            client.stop();
            return;
        }

        String ssid = request.substring(ssidIndex, passIndex);
        String pass = request.substring(passIndex + 6);

        ssid = urlDecode(ssid);
        pass = urlDecode(pass);

        Serial.print("[WiFi] Saving credentials: ");
        Serial.println(ssid);

        prefs.putString("ssid", ssid);
        prefs.putString("pass", pass);

        client.println("HTTP/1.1 200 OK");
        client.println("Content-Type: text/html");
        client.println("Connection: close");
        client.println();

        client.println(R"rawliteral(
        <!DOCTYPE html>
        <html>
        <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>WiFi Saved</title>

        <style>
            html, body {
            width: 100%;
            height: 100%;
            margin: 0;
            }

            body {
            background: linear-gradient(135deg, #0a0f0a 0%, #0f1115 25%, #14532d 50%, #0f1115 75%, #0a0f0a 100%);
            background-size: 400% 400%;
            animation: gradientShift 15s ease infinite;
            color: #e5e7eb;
            font-family: Arial, sans-serif;

            display: flex;
            align-items: center;
            justify-content: center;
            }

            @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
            }

            .card {
            background: rgba(28, 31, 38, 0.95);
            border-radius: 16px;
            padding: 32px;
            width: 90%;
            max-width: 360px;
            text-align: center;
            box-shadow: 0 10px 40px rgba(20, 83, 45, 0.4), 0 0 1px rgba(34, 197, 94, 0.3);
            border: 1px solid rgba(34, 197, 94, 0.2);
            backdrop-filter: blur(10px);
            }

            h2 {
            margin-top: 0;
            color: #22c55e;
            text-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
            }

            .count {
            font-size: 36px;
            font-weight: bold;
            margin: 16px 0;
            color: #22c55e;
            text-shadow: 0 0 20px rgba(34, 197, 94, 0.5);
            }

            .hint {
            font-size: 14px;
            opacity: 0.7;
            margin-top: 12px;
            }
        </style>
        </head>

        <body>
        <div class="card">
            <h2>WiFi Saved</h2>
            <p>Device is rebooting</p>
            <p>Closing in</p>
            <div class="count" id="count">5</div>
            <p>seconds</p>

            <div class="hint" id="hint"></div>
        </div>

        <script>
            let seconds = 5;
            const countEl = document.getElementById("count");
            const hintEl = document.getElementById("hint");

            const timer = setInterval(() => {
            seconds--;
            countEl.textContent = seconds;

            if (seconds <= 0) {
                clearInterval(timer);

                window.close();

                hintEl.innerHTML = "You may now close this page.";
            }
            }, 1000);
        </script>
        </body>
        </html>
        )rawliteral");

        delay(1500);
        ESP.restart();

    }

    // Serve WiFi setup HTML page
    else {
        client.println("HTTP/1.1 200 OK");
        client.println("Content-Type: text/html");
        client.println("Connection: close");
        client.println();
        String page = WIFI_HTML;
        page.replace("{{WIFI_LIST}}", getWiFiListHTML());
        client.print(page);
    }

    client.stop();
}

// Generate random 6-digit pairing code
String generatePairingCode() {
    String code = "";
    for (int i = 0; i < 6; i++) {
        code += String(random(0, 10));
    }
    return code;
}

// Generate unique device ID from ESP32 chip ID
String generateDeviceId() {
    uint64_t chipid = ESP.getEfuseMac();
    String id = "VL-";

    // Extract lower 3 bytes for uniqueness
    uint8_t byte0 = (chipid >> 0) & 0xFF;
    uint8_t byte1 = (chipid >> 8) & 0xFF;
    uint8_t byte2 = (chipid >> 16) & 0xFF;

    // Format as hex string
    if (byte2 < 16) id += "0";
    id += String(byte2, HEX);
    if (byte1 < 16) id += "0";
    id += String(byte1, HEX);
    if (byte0 < 16) id += "0";
    id += String(byte0, HEX);

    id.toUpperCase();
    return id;
}

// Send pairing request to backend
void sendPairingRequest() {
    if (WiFi.status() != WL_CONNECTED) return;

    HTTPClient http;
    String url = String(BACKEND_URL) + "/api/devices/pair";

    http.begin(url);
    http.addHeader("Content-Type", "application/json");

    String payload = "{";
    payload += "\"device_id\":\"" + deviceId + "\",";
    payload += "\"pairing_code\":\"" + pairingCode + "\"";
    payload += "}";

    int httpCode = http.POST(payload);
    
    if (httpCode > 0) {
        Serial.printf("[Pairing] Request sent: HTTP %d\n", httpCode);
        if (httpCode == 200 || httpCode == 201) {
            Serial.println("[Pairing] Registered with backend");
        }
    } else {
        Serial.printf("[Pairing] Request failed: %s\n", http.errorToString(httpCode).c_str());
    }
    
    http.end();
}

// Check device pairing status with backend
bool checkPairingStatus() {
    if (WiFi.status() != WL_CONNECTED) return false;

    HTTPClient http;
    String url = String(BACKEND_URL) + "/api/devices/" + deviceId + "/status";

    http.begin(url);
    int httpCode = http.GET();

    bool paired = false;

    if (httpCode == 200) {
        String response = http.getString();

        // Check if device is paired
        if (response.indexOf("\"paired\":true") != -1 ||
            response.indexOf("\"status\":\"paired\"") != -1) {
            paired = true;
            if (!prefs.getBool("paired", false)) {
                Serial.println("[Pairing] Successfully paired");
            }
            prefs.putBool("paired", true);
            prefs.putString("deviceId", deviceId);
        } else if (response.indexOf("\"paired\":false") != -1) {
            paired = false;
            if (prefs.getBool("paired", false)) {
                Serial.println("[Pairing] Unpaired on backend");
            }
        }
    }

    http.end();
    return paired;
}

// Global stress level (0-100) received from backend AI
int stressLevel = 0;

// WebSocket event handler

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
    switch(type) {
        case WStype_DISCONNECTED:
            Serial.println("[WebSocket] Disconnected");
            wsConnected = false;
            break;
        case WStype_CONNECTED:
            Serial.printf("[WebSocket] Connected to: %s\n", payload);
            wsConnected = true;
            break;
        case WStype_TEXT:
            Serial.printf("[WebSocket] Message: %s\n", payload);

            // Parse stress level from JSON response
            String message = String((char*)payload);
            int stressIdx = message.indexOf("\"stress_level\":");
            if (stressIdx != -1) {
                int colonIdx = message.indexOf(":", stressIdx);
                int endIdx = message.indexOf(",", colonIdx);
                if (endIdx == -1) endIdx = message.indexOf("}", colonIdx);

                String stressStr = message.substring(colonIdx + 1, endIdx);
                stressLevel = stressStr.toInt();

                Serial.printf("[WebSocket] Stress level: %d%%\n", stressLevel);

                // Update display
                if (ui_STRESS) lv_arc_set_value(ui_STRESS, stressLevel);
                if (ui_STRESS_VALUE) {
                    lv_label_set_text_fmt(ui_STRESS_VALUE, "%d", stressLevel);
                }
            }
            break;
    }
}

// Connect to WebSocket server
void connectWebSocket() {
    if (!WiFi.isConnected()) return;

    Serial.printf("[WebSocket] Connecting: wss://%s:%d%s\n", WS_HOST, WS_PORT, WS_PATH);

    webSocket.beginSSL(WS_HOST, WS_PORT, WS_PATH);
    webSocket.onEvent(webSocketEvent);
    webSocket.setReconnectInterval(5000);
}

// Send sensor data via WebSocket
void sendSensorDataWebSocket(int heartRate, int motionIntensity) {
    if (!wsConnected) {
        Serial.println("[WebSocket] Not connected, skipping");
        return;
    }

    String payload = "{";
    payload += "\"device_id\":\"" + deviceId + "\",";
    payload += "\"heart_rate\":" + String(heartRate) + ",";
    payload += "\"motion_intensity\":" + String(motionIntensity);
    payload += "}";

    webSocket.sendTXT(payload);
    Serial.printf("[Sensor] Sent: HR=%d Motion=%d\n", heartRate, motionIntensity);
}

// Legacy HTTP endpoint for sensor data (WebSocket is preferred)
void sendSensorData(int heartRate, int motionIntensity) {
    if (WiFi.status() != WL_CONNECTED) return;

    HTTPClient http;
    String url = String(BACKEND_URL) + "/metrics/sensor-data";

    http.begin(url);
    http.addHeader("Content-Type", "application/json");

    String payload = "{";
    payload += "\"device_id\":\"" + deviceId + "\",";
    payload += "\"heart_rate\":" + String(heartRate) + ",";
    payload += "\"motion_intensity\":" + String(motionIntensity);
    payload += "}";

    int httpCode = http.POST(payload);

    if (httpCode > 0) {
        if (httpCode == 200) {
            String response = http.getString();
            Serial.println("[Sensor] Data sent successfully");

            // Parse stress level from response
            int confIdx = response.indexOf("\"confidence_anomaly\":");
            if (confIdx != -1) {
                int colonIdx = response.indexOf(":", confIdx);
                int endIdx = response.indexOf(",", colonIdx);
                if (endIdx == -1) endIdx = response.indexOf("}", colonIdx);

                String confStr = response.substring(colonIdx + 1, endIdx);
                stressLevel = (int)confStr.toFloat();

                Serial.printf("[Sensor] Stress level: %d%%\n", stressLevel);

                // Update display
                if (ui_STRESS) lv_arc_set_value(ui_STRESS, stressLevel);
                if (ui_STRESS_VALUE) {
                    if (stressLevel > 0) {
                        lv_label_set_text_fmt(ui_STRESS_VALUE, "%d", stressLevel);
                    } else {
                        lv_label_set_text(ui_STRESS_VALUE, "--");
                    }
                }
            }
        } else {
            Serial.printf("[Sensor] Send failed: HTTP %d\n", httpCode);
            String response = http.getString();
            Serial.println("[Sensor] Response: " + response);
        }
    } else {
        Serial.printf("[Sensor] Send failed: %s\n", http.errorToString(httpCode).c_str());
    }

    http.end();
}

// Connect to WiFi using stored credentials
void connectWiFi() {
    String ssid = prefs.getString("ssid", "");
    String pass = prefs.getString("pass", "");

    if (ssid.length() == 0) {
        Serial.println("[WiFi] No credentials found");
        startSoftAP();
        return;
    }

    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid.c_str(), pass.c_str());
    wifiStartTime = millis();

    Serial.print("[WiFi] Connecting to: ");
    Serial.println(ssid);
}

// LVGL display flush callback
void my_disp_flush(lv_disp_drv_t *disp_drv,
                   const lv_area_t *area,
                   lv_color_t *color_p)
{
    uint32_t w = area->x2 - area->x1 + 1;
    uint32_t h = area->y2 - area->y1 + 1;

    tft.startWrite();
    tft.setAddrWindow(area->x1, area->y1, w, h);
    tft.pushColors((uint16_t *)&color_p->full, w * h, true);
    tft.endWrite();

    lv_disp_flush_ready(disp_drv);
}

// MPU6050 motion sensor configuration
MPU6050 mpu;

// Motion intensity calculation weights
const float weightAccel = 0.6;  // Accelerometer weight
const float weightGyro  = 0.4;  // Gyroscope weight
const float emaAlpha = 0.3;     // Smoothing factor

// Calibrated sensor ranges
const float accelMin = 15800.0;
const float accelMax = 32000.0;
const float gyroMin  = 0.0;
const float gyroMax  = 9000.0;

float smoothed = 0;  // Smoothed motion intensity

// Clamp value to 0-1 range
float clamp01(float v) {
  if (v < 0) return 0;
  if (v > 1) return 1;
  return v;
}

unsigned long lastMPUread = 0;
const unsigned long MPU_INTERVAL = 200;  // Read every 200ms

// MAX30102 heart rate sensor configuration
MAX30105 particleSensor;

// Heart rate averaging buffer
const byte RATE_SIZE = 4;
byte rates[RATE_SIZE];
byte rateSpot = 0;
byte ratesFilled = 0;  // Filled slots counter

// Heart rate measurement variables
long lastBeat = 0;
float beatsPerMinute = 0;
int beatAvg = 0;

unsigned long lastHeartCheck = 0;
const unsigned long HEART_INTERVAL = 20;  // Check every 20ms

// Finger detection state
bool fingerPresent = false;
unsigned long fingerStartTime = 0;
const unsigned long FINGER_SETTLE_TIME = 10000;  // 10 second settling
bool settlingDone = false;

// Unpair detection timer
unsigned long unpairDetectedAt = 0;

// Clamp integer to range
int clampInt(int value, int minVal, int maxVal) {
if (value < minVal) return minVal;
if (value > maxVal) return maxVal;
return value;
}

// Setup function - runs once on boot
void setup()
{
    Serial.begin(115200);

    // Initialize I2C
    Wire.begin();
    Wire.setClock(400000);

    // Initialize heart rate sensor
    if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) {
        Serial.println("[Sensor] MAX30102 not detected");
        while (1);
    }
    particleSensor.setup();
    particleSensor.setPulseAmplitudeRed(0x0A);

    // Initialize motion sensor
    mpu.initialize();

    // Initialize display
    lv_init();
    tft.begin();
    tft.setRotation(1);

    lv_disp_draw_buf_init(&draw_buf, buf, NULL,
                          screenWidth * screenHeight / 10);

    static lv_disp_drv_t disp_drv;
    lv_disp_drv_init(&disp_drv);
    disp_drv.hor_res = screenWidth;
    disp_drv.ver_res = screenHeight;
    disp_drv.flush_cb = my_disp_flush;
    disp_drv.draw_buf = &draw_buf;
    lv_disp_drv_register(&disp_drv);

    // Show splash screen
    ui_Splash_screen_init();
    lv_scr_load(ui_Splash);
    Serial.println("[Display] Splash screen loaded");
    lv_timer_handler();
    delay(30);
    delay(3000);

    // Initialize preferences storage
    prefs.begin("wifi", false);

    // Load or generate device ID
    deviceId = prefs.getString("deviceId", "");
    if (deviceId.length() == 0) {
        deviceId = generateDeviceId();
        prefs.putString("deviceId", deviceId);
        Serial.println("[Device] Generated ID: " + deviceId);
    } else {
        Serial.println("[Device] Loaded ID: " + deviceId);
    }

    // Print chip ID for debugging
    uint64_t chipid = ESP.getEfuseMac();
    Serial.printf("[Device] Chip ID: %04X%08X\n", (uint16_t)(chipid>>32), (uint32_t)chipid);
    if (deviceId.length() == 0) {
        deviceId = generateDeviceId();
        prefs.putString("deviceId", deviceId);
    }

    // Generate pairing code if not paired
    if (!prefs.getBool("paired", false)) {
        pairingCode = generatePairingCode();
        Serial.println("[Pairing] Device ID: " + deviceId);
        Serial.println("[Pairing] Code: " + pairingCode);
    }

    connectWiFi();
}

// Main loop - runs continuously
void loop()
{
    lv_timer_handler();
    delay(5);

    // Handle serial commands
    if (Serial.available()) {
    String cmd = Serial.readStringUntil('\n');
    cmd.trim();

    if (cmd == "RESET_WIFI") {
        Serial.println("[WiFi] Clearing credentials and restarting");
        prefs.remove("ssid");
        prefs.remove("pass");
        ESP.restart();
    }
}

    // Handle WiFi portal requests
    if (softAPStarted) {
    handleWiFiPortal();
    }

    // WiFi state machine

    // Handle WiFi disconnection
    if (wifiConnected && WiFi.status() != WL_CONNECTED) {
        Serial.println("[WiFi] Disconnected, reconnecting...");
        wifiConnected = false;
        wifiStartTime = millis();
        lastWiFiRetry = millis();
        connectWiFi();
        return;
    }

    // Handle WiFi connection success
    if (!wifiConnected && WiFi.status() == WL_CONNECTED) {
        wifiConnected = true;
        softAPStarted = false;

        wifiServer.stop();
        WiFi.softAPdisconnect(true);

        Serial.print("[WiFi] Connected: ");
        Serial.println(WiFi.localIP());

        // Connect WebSocket
        connectWebSocket();

        bool devicePaired = prefs.getBool("paired", false);

        // Verify pairing status with backend
        bool actuallyPaired = checkPairingStatus();

        // Handle unpaired while offline
        if (devicePaired && !actuallyPaired) {
            Serial.println("[Pairing] Device unpaired while offline");
            devicePaired = false;
            prefs.putBool("paired", false);
            pairingCode = generatePairingCode();
            Serial.println("[Pairing] New code: " + pairingCode);
        }

        // Show appropriate screen
        if (!devicePaired) {
            ui_Pairing_screen_init();
            lv_scr_load(ui_Pairing);

            // Display pairing info
            if (ui_Code) {
                lv_label_set_text(ui_Code, pairingCode.c_str());
            }
            if (ui_Title) {
                lv_label_set_text(ui_Title, deviceId.c_str());
            }

            // Send pairing request
            sendPairingRequest();
            lastPairingCheck = millis();
        } else {
            ui_Main_screen_init();
            lv_scr_load(ui_Main);
        }
    }

    // WiFi retry logic
    if (!wifiConnected && !softAPStarted) {
        if (millis() - lastWiFiRetry >= WIFI_RETRY_INTERVAL) {
            lastWiFiRetry = millis();

            wl_status_t status = WiFi.status();

            if (status == WL_CONNECTED) {
                return;
            }

            // Handle WiFi state transitions
            if (status == WL_IDLE_STATUS) {
                Serial.println("[WiFi] Idle, starting connection");
                WiFi.begin(
                    prefs.getString("ssid", "").c_str(),
                    prefs.getString("pass", "").c_str()
                );
            }
            else if (status == WL_DISCONNECTED) {
                Serial.println("[WiFi] Retrying...");
                WiFi.begin(
                    prefs.getString("ssid", "").c_str(),
                    prefs.getString("pass", "").c_str()
                );
            }
            else {
                Serial.println("[WiFi] Connecting...");
            }

            // Connection timeout fallback
            if (millis() - wifiStartTime > WIFI_TIMEOUT) {
                Serial.println("[WiFi] Timeout, starting AP");
                prefs.remove("ssid");
                prefs.remove("pass");
                startSoftAP();
            }
        }
    }

    // Exit if WiFi not ready
    if (!wifiConnected) {
        return;
    }

    // Process WebSocket events (non-blocking)
    webSocket.loop();

// Pairing status check
bool devicePaired = prefs.getBool("paired", false);
unsigned long checkInterval = devicePaired ? PAIRED_CHECK_INTERVAL : PAIRING_CHECK_INTERVAL;

if (millis() - lastPairingCheck >= checkInterval) {
    lastPairingCheck = millis();

    bool currentlyPaired = checkPairingStatus();

    // Handle pairing state change
    if (!devicePaired && currentlyPaired) {
        Serial.println("[Display] Switching to Main screen");

        ui_Main_screen_init();
        lv_scr_load(ui_Main);

        unpairDetectedAt = 0;
        return;
    }

    // Handle unpair detected
    if (devicePaired && !currentlyPaired) {

        if (unpairDetectedAt == 0) {
            unpairDetectedAt = millis();
            Serial.println("[Pairing] Unpair detected, confirming...");
        }

        // Confirm unpair after 1 second
        if (millis() - unpairDetectedAt >= 1000) {
            Serial.println("[Pairing] Remote unpair confirmed");

            prefs.putBool("paired", false);

            pairingCode = generatePairingCode();
            Serial.println("[Pairing] New code: " + pairingCode);

            ui_Pairing_screen_init();
            lv_scr_load(ui_Pairing);

            if (ui_Code) {
                lv_label_set_text(ui_Code, pairingCode.c_str());
            }
            if (ui_Title) {
                lv_label_set_text(ui_Title, deviceId.c_str());
            }

            sendPairingRequest();

            unpairDetectedAt = 0;
            return;
        }
    }
    else {
        unpairDetectedAt = 0;
    }
}

    // Skip sensor readings if not paired
    if (!devicePaired) {
        return;
    }

    // Heart rate sensor processing
    if (millis() - lastHeartCheck >= HEART_INTERVAL) {

        lastHeartCheck = millis();
        long irValue = particleSensor.getIR();

        // No finger detected
        if (irValue < 50000) {
            fingerPresent = false;
            settlingDone = false;
            beatAvg = 0;
            ratesFilled = 0;
            stressLevel = 0;

            if (ui_HEART) lv_arc_set_value(ui_HEART, 0);
            if (ui_BPM_VALUE) lv_label_set_text(ui_BPM_VALUE, "---");

            if (ui_STRESS) lv_arc_set_value(ui_STRESS, 0);
            if (ui_STRESS_VALUE) lv_label_set_text(ui_STRESS_VALUE, "---");

            return;
        }

        // Finger just placed
        if (!fingerPresent) {
            fingerPresent = true;
            fingerStartTime = millis();
            rateSpot = 0;
            memset(rates, 0, sizeof(rates));
            ratesFilled = 0;
            if (ui_BPM_VALUE) lv_label_set_text(ui_BPM_VALUE, "...");
            if (ui_STRESS_VALUE) lv_label_set_text(ui_STRESS_VALUE, "...");
            return;
        }

        // Process heartbeat detection
        if (checkForBeat(irValue)) {
            long delta = millis() - lastBeat;
            lastBeat = millis();
            beatsPerMinute = 60 / (delta / 1000.0);

            if (beatsPerMinute > 20 && beatsPerMinute < 255) {
                rates[rateSpot++] = (byte)beatsPerMinute;
                rateSpot %= RATE_SIZE;

                if (ratesFilled < RATE_SIZE) ratesFilled++;

                beatAvg = 0;
                for (byte i = 0; i < RATE_SIZE; i++) beatAvg += rates[i];
                beatAvg /= RATE_SIZE;
            }
        }

        // Update display
        if (ratesFilled >= RATE_SIZE) {
            settlingDone = true;
            if (ui_HEART) lv_arc_set_value(ui_HEART, beatAvg);
            if (ui_BPM_VALUE) lv_label_set_text_fmt(ui_BPM_VALUE, "%d", beatAvg);
        } else {
            if (ui_HEART) lv_arc_set_value(ui_HEART, 0);
            if (ui_BPM_VALUE) lv_label_set_text(ui_BPM_VALUE, "...");
            if (ui_STRESS_VALUE) lv_label_set_text(ui_STRESS_VALUE, "...");
        }
    }

// Motion sensor processing
if (millis() - lastMPUread >= MPU_INTERVAL) {

    lastMPUread = millis();

    // Read sensor data
    int16_t ax, ay, az, gx, gy, gz;
    mpu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);

    // Convert to float
    float axf = (float)ax;
    float ayf = (float)ay;
    float azf = (float)az;
    float gxf = (float)gx;
    float gyf = (float)gy;
    float gzf = (float)gz;

    // Calculate magnitudes
    float accelMag = sqrt(axf*axf + ayf*ayf + azf*azf);
    float gyroMag  = sqrt(gxf*gxf + gyf*gyf + gzf*gzf);

    // Normalize to 0-1 range
    float normAccel = 0;
    if (accelMax > accelMin)
        normAccel = (accelMag - accelMin) / (accelMax - accelMin);

    float normGyro = 0;
    if (gyroMax > gyroMin)
        normGyro = (gyroMag - gyroMin) / (gyroMax - gyroMin);

    normAccel = clamp01(normAccel);
    normGyro  = clamp01(normGyro);

    // Weighted combination
    float combined = weightAccel * normAccel + weightGyro * normGyro;

    if (!isfinite(combined)) combined = 0;
    if (!isfinite(smoothed)) smoothed = 0;

    // Apply smoothing
    smoothed = emaAlpha * combined + (1 - emaAlpha) * smoothed;

    // Convert to percentage
    int intensity = clampInt((int)(smoothed * 100), 0, 100);

    // Update display
    if (ui_ACTIVITY) lv_arc_set_value(ui_ACTIVITY, intensity);
    if (ui_ACTIVITY_VALUE)
        lv_label_set_text_fmt(ui_ACTIVITY_VALUE, "%d", intensity);
}

    // Send sensor data to backend
    if (millis() - lastDataSend >= DATA_SEND_INTERVAL) {
        lastDataSend = millis();

        int currentIntensity = clampInt((int)(smoothed * 100), 0, 100);

        // Only send when heart rate is stable
        int hrToSend = (ratesFilled >= RATE_SIZE) ? beatAvg : 0;

        // Skip if no valid heart rate
        if (hrToSend == 0) {
            Serial.println("[Sensor] No valid heart rate");
            return;
        }

        sendSensorDataWebSocket(hrToSend, currentIntensity);
    }
}
