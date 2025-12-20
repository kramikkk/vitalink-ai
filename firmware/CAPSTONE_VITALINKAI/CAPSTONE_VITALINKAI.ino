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
#include <Preferences.h>

/* ===================== WIFI ===================== */
Preferences prefs;

WiFiServer wifiServer(80);
bool wifiConnected = false;
bool softAPStarted = false;
unsigned long wifiStartTime = 0;

#define WIFI_TIMEOUT 60000   // 1 minute

/*--------------------------------- GC9A01 DISPLAY ---------------------------------*/
static const uint16_t screenWidth  = 240;
static const uint16_t screenHeight = 240;

static lv_disp_draw_buf_t draw_buf;
static lv_color_t buf[ screenWidth * screenHeight / 10 ];

TFT_eSPI tft = TFT_eSPI();

/* 🔑 PAIRING FLAG (replace later with NVS / backend) */
bool devicePaired = false;

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
        client.println();
        client.println("<h2>Saved. Rebooting...</h2>");

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

long lastBeat = 0;
float beatsPerMinute = 0;
int beatAvg = 0;

unsigned long lastHeartCheck = 0;
const unsigned long HEART_INTERVAL = 20;

bool fingerPresent = false;
unsigned long fingerStartTime = 0;
const unsigned long FINGER_SETTLE_TIME = 10000;
bool settlingDone = false;


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
    connectWiFi();
}

/*--------------------------------- LOOP ---------------------------------*/
void loop()
{
    lv_timer_handler();
    delay(5);

    if (softAPStarted) {
    handleWiFiPortal();
    }

    /* ================= WIFI STATE MACHINE ================= */

    if (!wifiConnected && WiFi.status() == WL_CONNECTED) {
        wifiConnected = true;
        softAPStarted = false;

        wifiServer.stop();
        WiFi.softAPdisconnect(true);

        Serial.println("WiFi connected");
        Serial.print("IP: ");
        Serial.println(WiFi.localIP());

        if (!devicePaired) {
            ui_Pairing_screen_init();
            lv_scr_load(ui_Pairing);
        } else {
            ui_Main_screen_init();
            lv_scr_load(ui_Main);
        }
    }

    /* Auto SoftAP fallback */
    if (!wifiConnected &&
        !softAPStarted &&
        millis() - wifiStartTime > WIFI_TIMEOUT) {

        Serial.println("WiFi timeout → SoftAP");

        prefs.remove("ssid");
        prefs.remove("pass");

        startSoftAP();
    }

    /* Stop here if WiFi not ready */
    if (!wifiConnected) {
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

            if (ui_HEART) lv_arc_set_value(ui_HEART, 0);
            if (ui_BPM_VALUE) lv_label_set_text(ui_BPM_VALUE, "--");
            return;
        }

        if (!fingerPresent) {
            fingerPresent = true;
            fingerStartTime = millis();
            rateSpot = 0;
            memset(rates, 0, sizeof(rates));
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

                beatAvg = 0;
                for (byte i = 0; i < RATE_SIZE; i++) beatAvg += rates[i];
                beatAvg /= RATE_SIZE;
            }
        }

        if (!settlingDone &&
            millis() - fingerStartTime < FINGER_SETTLE_TIME) {
            if (ui_BPM_VALUE) lv_label_set_text(ui_BPM_VALUE, "...");
            return;
        }

        settlingDone = true;
        if (ui_HEART) lv_arc_set_value(ui_HEART, beatAvg);
        if (ui_BPM_VALUE)
            lv_label_set_text_fmt(ui_BPM_VALUE, "%d", beatAvg);
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

        int intensity = smoothed * 100;

        if (ui_ACTIVITY) lv_arc_set_value(ui_ACTIVITY, intensity);
        if (ui_ACTIVITY_VALUE)
            lv_label_set_text_fmt(ui_ACTIVITY_VALUE, "%d", intensity);
    }
}
