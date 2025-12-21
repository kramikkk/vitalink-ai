/* GC9A01 LIBRARIES */
#include <lvgl.h>
#include <TFT_eSPI.h>
#include "ui.h"

/* I2C + SENSORS */
#include <Wire.h>
#include <MPU6050.h>
#include <math.h>
#include "MAX30105.h"
#include "heartRate.h"

#include <WiFi.h>
#include <HTTPClient.h>
#include <Preferences.h>

/* ===================== WIFI ===================== */
Preferences prefs;

WiFiServer wifiServer(80);
bool wifiConnected = false;
bool softAPStarted = false;
unsigned long wifiStartTime = 0;
unsigned long lastWiFiRetry = 0;

#define WIFI_TIMEOUT 60000   // 1 minute
#define WIFI_RETRY_INTERVAL 5000  // Retry every 5 seconds

/* ===================== PAIRING ===================== */
String pairingCode = "";
String deviceId = "";
unsigned long lastPairingCheck = 0;
const unsigned long PAIRING_CHECK_INTERVAL = 1000;  // Check every 1 second when not paired
const unsigned long PAIRED_CHECK_INTERVAL = 1000;   // Check every 1 second when paired

/* ===================== SENSOR DATA TRANSMISSION ===================== */
unsigned long lastDataSend = 0;
const unsigned long DATA_SEND_INTERVAL = 1000;  // Send data every 1 second

const char* BACKEND_URL = "http://192.168.1.6:8000";

/*--------------------------------- GC9A01 DISPLAY ---------------------------------*/
static const uint16_t screenWidth  = 240;
static const uint16_t screenHeight = 240;

static lv_disp_draw_buf_t draw_buf;
static lv_color_t buf[ screenWidth * screenHeight / 10 ];

TFT_eSPI tft = TFT_eSPI();

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
      background: #0f1115;
      color: #e5e7eb;
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
      background: #1c1f26;
      border-radius: 16px;
      padding: 36px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.6);
      text-align: center;
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

String getWiFiListHTML() {
    String options = "";

    int n = WiFi.scanNetworks();

    if (n <= 0) {
        options += "<option>No networks found</option>";
    } else {
        for (int i = 0; i < n; i++) {
            String ssid = WiFi.SSID(i);
            int rssi = WiFi.RSSI(i);

            // Sanitize SSID for HTML
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

    WiFi.scanDelete();   // free memory
    return options;
}

void startSoftAP() {
    if (softAPStarted) return;

    softAPStarted = true;

    WiFi.disconnect(true);
    WiFi.mode(WIFI_AP_STA);
    WiFi.softAP("VitaLink AI Setup");

    Serial.println("SoftAP started");
    Serial.println(WiFi.softAPIP());

    wifiServer.begin();   // 🔥 IMPORTANT

    ui_WiFi_screen_init();
    lv_scr_load(ui_WiFi);

    lv_label_set_text(ui_IP_Address,
        WiFi.softAPIP().toString().c_str());
}

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

    // 🔍 Check POST data
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

        Serial.println("Saving WiFi:");
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
            background: #0f1115;
            color: #e5e7eb;
            font-family: Arial, sans-serif;

            display: flex;
            align-items: center;
            justify-content: center;
            }

            .card {
            background: #1c1f26;
            border-radius: 16px;
            padding: 32px;
            width: 90%;
            max-width: 360px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.6);
            }

            h2 {
            margin-top: 0;
            color: #22c55e;
            }

            .count {
            font-size: 36px;
            font-weight: bold;
            margin: 16px 0;
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

    // 📄 Serve HTML page
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

String generatePairingCode() {
    String code = "";
    for (int i = 0; i < 6; i++) {
        code += String(random(0, 10));
    }
    return code;
}

String generateDeviceId() {
    // Generate unique device ID from ESP32 chip ID
    uint64_t chipid = ESP.getEfuseMac();
    String id = "VL-";
    
    // Extract bytes from chip ID (use bytes 0-2 for uniqueness)
    uint8_t byte0 = (chipid >> 0) & 0xFF;
    uint8_t byte1 = (chipid >> 8) & 0xFF;
    uint8_t byte2 = (chipid >> 16) & 0xFF;
    
    // Format as hex
    if (byte2 < 16) id += "0";
    id += String(byte2, HEX);
    if (byte1 < 16) id += "0";
    id += String(byte1, HEX);
    if (byte0 < 16) id += "0";
    id += String(byte0, HEX);
    
    id.toUpperCase();
    return id;
}

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
        Serial.printf("Pairing request sent: %d\n", httpCode);
        if (httpCode == 200 || httpCode == 201) {
            Serial.println("Pairing request registered with backend");
        }
    } else {
        Serial.printf("Pairing request failed: %s\n", http.errorToString(httpCode).c_str());
    }
    
    http.end();
}

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
            // Only print if this is a new pairing
            if (!prefs.getBool("paired", false)) {
                Serial.println("Device successfully paired!");
            }
            prefs.putBool("paired", true);
            prefs.putString("deviceId", deviceId);
        } else if (response.indexOf("\"paired\":false") != -1) {
            // Device is unpaired on backend
            paired = false;
            if (prefs.getBool("paired", false)) {
                Serial.println("Device unpaired on backend");
            }
        }
    }
    
    http.end();
    return paired;
}

int stressLevel = 0;  // Global variable to store stress level from backend

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
            Serial.println("Sensor data sent successfully");

            // Parse confidence_anomaly from JSON response (this is the stress level)
            // Response format: {"message":"...","metric_id":123,"user_id":1,"prediction":"NORMAL","anomaly_score":0.15,"confidence_anomaly":45.2}
            int confIdx = response.indexOf("\"confidence_anomaly\":");
            if (confIdx != -1) {
                int colonIdx = response.indexOf(":", confIdx);
                int endIdx = response.indexOf(",", colonIdx);
                if (endIdx == -1) endIdx = response.indexOf("}", colonIdx);

                String confStr = response.substring(colonIdx + 1, endIdx);
                stressLevel = (int)confStr.toFloat();  // Convert to int (0-100)

                Serial.printf("Stress Level: %d%%\n", stressLevel);

                // Update UI immediately
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
            Serial.printf("Sensor data send failed: HTTP %d\n", httpCode);
            String response = http.getString();
            Serial.println("Response: " + response);
        }
    } else {
        Serial.printf("Sensor data send failed: %s\n", http.errorToString(httpCode).c_str());
    }

    http.end();
}

void connectWiFi() {
    String ssid = prefs.getString("ssid", "");
    String pass = prefs.getString("pass", "");

    if (ssid.length() == 0) {
        Serial.println("No WiFi credentials");
        startSoftAP();
        return;
    }

    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid.c_str(), pass.c_str());
    wifiStartTime = millis();

    Serial.print("Connecting to ");
    Serial.println(ssid);
}

/* LVGL flush callback */
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

/*--------------------------------- MPU6050 ---------------------------------*/
MPU6050 mpu;

const float weightAccel = 0.6;
const float weightGyro  = 0.4;
const float emaAlpha = 0.3;

const float accelMin = 15800.0;
const float accelMax = 32000.0;
const float gyroMin  = 0.0;
const float gyroMax  = 9000.0;

float smoothed = 0;

float clamp01(float v) {
  if (v < 0) return 0;
  if (v > 1) return 1;
  return v;
}

unsigned long lastMPUread = 0;
const unsigned long MPU_INTERVAL = 200;

/*--------------------------------- MAX30102 ---------------------------------*/
MAX30105 particleSensor;

const byte RATE_SIZE = 4;
byte rates[RATE_SIZE];
byte rateSpot = 0;
byte ratesFilled = 0;  // Track how many rate slots have valid data

long lastBeat = 0;
float beatsPerMinute = 0;
int beatAvg = 0;

unsigned long lastHeartCheck = 0;
const unsigned long HEART_INTERVAL = 20;

bool fingerPresent = false;
unsigned long fingerStartTime = 0;
const unsigned long FINGER_SETTLE_TIME = 10000;
bool settlingDone = false;

unsigned long unpairDetectedAt = 0;

int clampInt(int value, int minVal, int maxVal) {
if (value < minVal) return minVal;
if (value > maxVal) return maxVal;
return value;
}

/*--------------------------------- SETUP ---------------------------------*/
void setup()
{
    Serial.begin(115200);

    Wire.begin(); 
    Wire.setClock(400000);

    if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) {
        Serial.println("MAX30102 not detected. Check wiring!");
        while (1);
    }
    particleSensor.setup();
    particleSensor.setPulseAmplitudeRed(0x0A);

    mpu.initialize();

    lv_init();
    tft.begin();
    tft.setRotation(0);

    lv_disp_draw_buf_init(&draw_buf, buf, NULL,
                          screenWidth * screenHeight / 10);

    static lv_disp_drv_t disp_drv;
    lv_disp_drv_init(&disp_drv);
    disp_drv.hor_res = screenWidth;
    disp_drv.ver_res = screenHeight;
    disp_drv.flush_cb = my_disp_flush;
    disp_drv.draw_buf = &draw_buf;
    lv_disp_drv_register(&disp_drv);

    /* SPLASH SCREEN */
    ui_Splash_screen_init();
    lv_scr_load(ui_Splash);
    Serial.println("Splash Loaded.");
    lv_timer_handler();
    delay(30);
    delay(3000);

    prefs.begin("wifi", false);
    
    // Initialize device ID (persistent)
    deviceId = prefs.getString("deviceId", "");
    if (deviceId.length() == 0) {
        deviceId = generateDeviceId();
        prefs.putString("deviceId", deviceId);
        Serial.println("Generated new Device ID: " + deviceId);
    } else {
        Serial.println("Loaded existing Device ID: " + deviceId);
    }
    
    // Debug: Print chip ID
    uint64_t chipid = ESP.getEfuseMac();
    Serial.printf("Chip ID: %04X%08X\n", (uint16_t)(chipid>>32), (uint32_t)chipid);
    if (deviceId.length() == 0) {
        deviceId = generateDeviceId();
        prefs.putString("deviceId", deviceId);
    }
    
    // Generate new pairing code each boot (if not paired)
    if (!prefs.getBool("paired", false)) {
        pairingCode = generatePairingCode();
        Serial.println("Device ID: " + deviceId);
        Serial.println("Pairing Code: " + pairingCode);
    }
    
    connectWiFi();
}

/*--------------------------------- LOOP ---------------------------------*/
void loop()
{
    lv_timer_handler();
    delay(5);

    if (Serial.available()) {
    String cmd = Serial.readStringUntil('\n');
    cmd.trim();

    if (cmd == "RESET_WIFI") {
        Serial.println("🔁 Clearing WiFi credentials");
        prefs.remove("ssid");
        prefs.remove("pass");
        ESP.restart();
    }
}

    if (softAPStarted) {
    handleWiFiPortal();
    }

    /* ================= WIFI STATE MACHINE ================= */
    
    // Check if WiFi disconnected during runtime
    if (wifiConnected && WiFi.status() != WL_CONNECTED) {
        Serial.println("WiFi disconnected! Attempting reconnect...");
        wifiConnected = false;
        wifiStartTime = millis();
        lastWiFiRetry = millis();
        connectWiFi();
        return;
    }

    if (!wifiConnected && WiFi.status() == WL_CONNECTED) {
        wifiConnected = true;
        softAPStarted = false;

        wifiServer.stop();
        WiFi.softAPdisconnect(true);

        Serial.println("WiFi connected");
        Serial.print("IP: ");
        Serial.println(WiFi.localIP());

        bool devicePaired = prefs.getBool("paired", false);
        
        // Check actual pairing status with backend on boot
        bool actuallyPaired = checkPairingStatus();
        
        // If we thought we were paired but backend says no, update local state
        if (devicePaired && !actuallyPaired) {
            Serial.println("Device was unpaired while offline. Updating local state.");
            devicePaired = false;
            prefs.putBool("paired", false);
            // Generate new pairing code since we need to pair again
            pairingCode = generatePairingCode();
            Serial.println("New Pairing Code: " + pairingCode);
        }
        
        if (!devicePaired) {
            ui_Pairing_screen_init();
            lv_scr_load(ui_Pairing);
            
            // Display pairing code on screen
            if (ui_Code) {
                lv_label_set_text(ui_Code, pairingCode.c_str());
            }
            if (ui_Title) {
                lv_label_set_text(ui_Title, deviceId.c_str());
            }
            
            // Send pairing request to backend
            sendPairingRequest();
            lastPairingCheck = millis();
        } else {
            ui_Main_screen_init();
            lv_scr_load(ui_Main);
        }
    }

    /* WiFi retry logic - try every 10 seconds */
    if (!wifiConnected && !softAPStarted) {
        if (millis() - lastWiFiRetry >= WIFI_RETRY_INTERVAL) {
            lastWiFiRetry = millis();

            wl_status_t status = WiFi.status();

            if (status == WL_CONNECTED) {
                return;
            }

            // 🚫 DO NOT TOUCH WIFI IF ALREADY CONNECTING
            if (status == WL_IDLE_STATUS) {
                Serial.println("WiFi idle, starting connection...");
                WiFi.begin(
                    prefs.getString("ssid", "").c_str(),
                    prefs.getString("pass", "").c_str()
                );
            }
            else if (status == WL_DISCONNECTED) {
                Serial.println("WiFi disconnected, retrying...");
                WiFi.begin(
                    prefs.getString("ssid", "").c_str(),
                    prefs.getString("pass", "").c_str()
                );
            }
            else {
                // WL_CONNECTING or others
                Serial.println("WiFi connecting... waiting");
            }

            // Timeout fallback
            if (millis() - wifiStartTime > WIFI_TIMEOUT) {
                Serial.println("WiFi timeout → SoftAP");
                prefs.remove("ssid");
                prefs.remove("pass");
                startSoftAP();
            }
        }
    }


    /* Stop here if WiFi not ready */
    if (!wifiConnected) {
        return;
    }
    
/* ================= PAIRING CHECK ================= */
bool devicePaired = prefs.getBool("paired", false);
unsigned long checkInterval = devicePaired ? PAIRED_CHECK_INTERVAL : PAIRING_CHECK_INTERVAL;

if (millis() - lastPairingCheck >= checkInterval) {
    lastPairingCheck = millis();

    bool currentlyPaired = checkPairingStatus();

    if (!devicePaired && currentlyPaired) {
        Serial.println("Switching to Main screen");

        ui_Main_screen_init();
        lv_scr_load(ui_Main);

        unpairDetectedAt = 0;  // reset safety timer
        return;
    }

    if (devicePaired && !currentlyPaired) {

        if (unpairDetectedAt == 0) {
            unpairDetectedAt = millis();
            Serial.println("Unpair detected, waiting to confirm...");
        }

        // Confirm if actually unpaired after 1 second to avoid backend wrong flag
        if (millis() - unpairDetectedAt >= 1000) {
            Serial.println("Confirmed remote unpair. Switching to Pairing screen.");

            prefs.putBool("paired", false);

            pairingCode = generatePairingCode();
            Serial.println("New Pairing Code: " + pairingCode);

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
        // paired state is stable again → reset timer
        unpairDetectedAt = 0;
    }
}
    
    /* Skip sensor readings if not paired */
    if (!devicePaired) {
        return;
    }

    /* HEART SENSOR */
    if (millis() - lastHeartCheck >= HEART_INTERVAL) {

        lastHeartCheck = millis();
        long irValue = particleSensor.getIR();

        if (irValue < 50000) {
            fingerPresent = false;
            settlingDone = false;
            beatAvg = 0;
            ratesFilled = 0;  // Reset counter when finger is removed

            if (ui_HEART) lv_arc_set_value(ui_HEART, 0);
            if (ui_BPM_VALUE) lv_label_set_text(ui_BPM_VALUE, "--");
            return;
        }

        if (!fingerPresent) {
            fingerPresent = true;
            fingerStartTime = millis();
            rateSpot = 0;
            memset(rates, 0, sizeof(rates));
            ratesFilled = 0;  // Reset counter when finger is first placed
            if (ui_BPM_VALUE) lv_label_set_text(ui_BPM_VALUE, "...");
            return;
        }

        if (checkForBeat(irValue)) {
            long delta = millis() - lastBeat;
            lastBeat = millis();
            beatsPerMinute = 60 / (delta / 1000.0);

            if (beatsPerMinute > 20 && beatsPerMinute < 255) {
                rates[rateSpot++] = (byte)beatsPerMinute;
                rateSpot %= RATE_SIZE;

                // Track how many valid samples we have (up to RATE_SIZE)
                if (ratesFilled < RATE_SIZE) ratesFilled++;

                beatAvg = 0;
                for (byte i = 0; i < RATE_SIZE; i++) beatAvg += rates[i];
                beatAvg /= RATE_SIZE;
            }
        }

        // Update display immediately when ratesFilled >= RATE_SIZE
        // Show "--" or value directly, no settling time needed for display
        if (ratesFilled >= RATE_SIZE) {
            settlingDone = true;
            if (ui_HEART) lv_arc_set_value(ui_HEART, beatAvg);
            if (ui_BPM_VALUE) lv_label_set_text_fmt(ui_BPM_VALUE, "%d", beatAvg);
        } else {
            // Still filling up the rates array, show "--"
            if (ui_HEART) lv_arc_set_value(ui_HEART, 0);
            if (ui_BPM_VALUE) lv_label_set_text(ui_BPM_VALUE, "--");
        }
    }

    /* MOTION SENSOR */
    if (millis() - lastMPUread >= MPU_INTERVAL) {

        lastMPUread = millis();

        int16_t ax, ay, az, gx, gy, gz;
        mpu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);

        float accelMag = sqrt(ax*ax + ay*ay + az*az);
        float gyroMag  = sqrt(gx*gx + gy*gy + gz*gz);

        float normAccel = clamp01(
            (accelMag - accelMin) / (accelMax - accelMin));
        float normGyro = clamp01(
            (gyroMag - gyroMin) / (gyroMax - gyroMin));

        float combined = weightAccel * normAccel + weightGyro * normGyro;
        smoothed = emaAlpha * combined + (1 - emaAlpha) * smoothed;

        int intensity = clampInt((int)(smoothed * 100), 0, 100);

        if (ui_ACTIVITY) lv_arc_set_value(ui_ACTIVITY, intensity);
        if (ui_ACTIVITY_VALUE)
            lv_label_set_text_fmt(ui_ACTIVITY_VALUE, "%d", intensity);
    }
    
    /* SEND SENSOR DATA TO BACKEND */
    if (millis() - lastDataSend >= DATA_SEND_INTERVAL) {
        lastDataSend = millis();

        int currentIntensity = clampInt((int)(smoothed * 100), 0, 100);

        // Only send valid heart rate if all rate slots are filled (stable reading)
        // This prevents sending gradually increasing HR values during initial detection
        int hrToSend = (ratesFilled >= RATE_SIZE) ? beatAvg : 0;

        sendSensorData(hrToSend, currentIntensity);

        // Debug output
        Serial.printf("Sending: HR=%d, Motion=%d (ratesFilled=%d/%d)\n",
                     hrToSend, currentIntensity, ratesFilled, RATE_SIZE);
    }
}
