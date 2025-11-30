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

/*--------------------------------- GC9A01 DISPLAY ---------------------------------*/
/* Screen resolution */
static const uint16_t screenWidth  = 240;
static const uint16_t screenHeight = 240;

/* LVGL display buffer */
static lv_disp_draw_buf_t draw_buf;
static lv_color_t buf[ screenWidth * screenHeight / 10 ];

/* Initialize TFT_eSPI driver */
TFT_eSPI tft = TFT_eSPI();

/* LVGL flush callback (sends rendered content to GC9A01) */
void my_disp_flush(lv_disp_drv_t *disp_drv, const lv_area_t *area, lv_color_t *color_p)
{
    uint32_t w = area->x2 - area->x1 + 1;
    uint32_t h = area->y2 - area->y1 + 1;

    tft.startWrite();
    tft.setAddrWindow(area->x1, area->y1, w, h);
    tft.pushColors((uint16_t *)&color_p->full, w * h, true);
    tft.endWrite();

    lv_disp_flush_ready(disp_drv);
}

/*--------------------------------- MPU6050 MOTION SENSOR ---------------------------------*/
MPU6050 mpu;

const float weightAccel = 0.6;   // Weight for acceleration contribution
const float weightGyro  = 0.4;   // Weight for gyro contribution
const float emaAlpha = 0.3;      // EMA smoothing factor (lower = smoother)

// Empirical thresholds for wrist motion
const float accelMin = 15800.0;
const float accelMax = 32000.0;
const float gyroMin  = 0.0;
const float gyroMax  = 9000.0;

float smoothed = 0;  // Smoothed motion value

float clamp01(float v) {
  if (v < 0) return 0;
  if (v > 1) return 1;
  return v;
}

/* Non-blocking timing for MPU6050 */
unsigned long lastMPUread = 0;
const unsigned long MPU_INTERVAL = 200;  // every 200 ms

/*--------------------------------- MAX30102 HEART SENSOR ---------------------------------*/
MAX30105 particleSensor;

const byte RATE_SIZE = 4;
byte rates[RATE_SIZE];
byte rateSpot = 0;

long lastBeat = 0;

float beatsPerMinute = 0;
int beatAvg = 0;

/* Non-blocking timing for MAX30102 */
unsigned long lastHeartCheck = 0;
const unsigned long HEART_INTERVAL = 20;  // 50Hz sampling

/* Heart-rate state machine */
bool fingerPresent = false;
unsigned long fingerStartTime = 0;
const unsigned long FINGER_SETTLE_TIME = 10000; // 10 seconds
bool settlingDone = false;

/*--------------------------------- SETUP ---------------------------------*/
void setup()
{
    Serial.begin(115200);

    /* MAX30102 Initialization */
    if (!particleSensor.begin(Wire, I2C_SPEED_FAST))
    {
        Serial.println("MAX30102 not detected. Check wiring!");
        while (1);
    }
    particleSensor.setup();
    particleSensor.setPulseAmplitudeRed(0x0A);

    Serial.println("MAX30102 initialized");

    /* MPU6050 Initialization */
    Wire.begin();
    mpu.initialize();
    Serial.println("MPU6050 initialized");

    /* GC9A01 + LVGL initialization */
    lv_init();
    tft.begin();
    tft.setRotation(0);

    lv_disp_draw_buf_init(&draw_buf, buf, NULL, screenWidth * screenHeight / 10);

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
    delay(2000);

    /* MAIN SCREEN */
    ui_Main_screen_init();
    lv_scr_load(ui_Main);
    Serial.println("Main Screen Loaded.");
}

/*--------------------------------- MAIN LOOP ---------------------------------*/
void loop()
{
    lv_timer_handler();
    delay(5);

    /* ---------------- HEART SENSOR (MAX30102) ---------------- */
    if (millis() - lastHeartCheck >= HEART_INTERVAL) {

        lastHeartCheck = millis();
        long irValue = particleSensor.getIR();

        /* 1. No finger detected */
        if (irValue < 50000) {
            fingerPresent = false;
            settlingDone = false;
            beatsPerMinute = 0;
            beatAvg = 0;

            if (ui_HEART) lv_arc_set_value(ui_HEART, 0);
            if (ui_BPM_VALUE) lv_label_set_text(ui_BPM_VALUE, "--");

            Serial.printf("[NO FINGER] IR=%ld\n", irValue);
            return;
        }

        /* 2. Finger detected for the first time */
        if (!fingerPresent) {
            fingerPresent = true;
            fingerStartTime = millis();
            settlingDone = false;

            rateSpot = 0;
            for (byte i = 0; i < RATE_SIZE; i++) rates[i] = 0;

            if (ui_HEART) lv_arc_set_value(ui_HEART, 0);
            if (ui_BPM_VALUE) lv_label_set_text(ui_BPM_VALUE, "...");

            Serial.printf("[FINGER DETECTED] IR=%ld\n", irValue);
            return;
        }

        /* 3. Always run beat detection (even during settling) */
        if (checkForBeat(irValue)) {
            long delta = millis() - lastBeat;
            lastBeat = millis();

            beatsPerMinute = 60 / (delta / 1000.0);

            Serial.printf("[BEAT] BPM=%.1f\n", beatsPerMinute);

            if (beatsPerMinute > 20 && beatsPerMinute < 255) {
                rates[rateSpot++] = (byte)beatsPerMinute;
                rateSpot %= RATE_SIZE;

                beatAvg = 0;
                for (byte i = 0; i < RATE_SIZE; i++) beatAvg += rates[i];
                beatAvg /= RATE_SIZE;
            }
        }

        /* 4. Settling (10 seconds) */
        unsigned long elapsed = millis() - fingerStartTime;
        if (!settlingDone && elapsed < FINGER_SETTLE_TIME) {

            unsigned long remaining = (FINGER_SETTLE_TIME - elapsed) / 1000;

            if (ui_BPM_VALUE) lv_label_set_text(ui_BPM_VALUE, "...");

            Serial.printf("[SETTLING] %lus remaining, Avg BPM=%d\n",
                          remaining, beatAvg);

            return;
        }

        /* 5. Settling completed */
        if (!settlingDone) {
            Serial.println("[SETTLING COMPLETE — DISPLAYING BPM]");
            settlingDone = true;
        }

        if (ui_HEART) lv_arc_set_value(ui_HEART, beatAvg);
        if (ui_BPM_VALUE) lv_label_set_text_fmt(ui_BPM_VALUE, "%d", beatAvg);

        Serial.printf("[BPM STABLE] IR=%ld BPM=%.1f Avg=%d\n",
                      irValue, beatsPerMinute, beatAvg);
    }

    /* ---------------- MOTION SENSOR (MPU6050) ---------------- */
    unsigned long now = millis();
    if (now - lastMPUread >= MPU_INTERVAL) {
        lastMPUread = now;

        int16_t ax, ay, az, gx, gy, gz;
        mpu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);

        float accelMag = sqrt(ax*ax + ay*ay + az*az);
        float gyroMag  = sqrt(gx*gx + gy*gy + gz*gz);

        float normAccel = clamp01((accelMag - accelMin) / (accelMax - accelMin));
        float normGyro  = clamp01((gyroMag - gyroMin) / (gyroMax - gyroMin));

        float combined = weightAccel * normAccel + weightGyro * normGyro;

        smoothed = emaAlpha * combined + (1 - emaAlpha) * smoothed;

        int motionIntensity = smoothed * 100;

        if (ui_ACTIVITY) lv_arc_set_value(ui_ACTIVITY, motionIntensity);
        if (ui_ACTIVITY_VALUE) lv_label_set_text_fmt(ui_ACTIVITY_VALUE, "%d", motionIntensity);

        Serial.printf("Accel=%.1f Gyro=%.1f  Intensity=%d\n",
                       accelMag, gyroMag, motionIntensity);
    }
}
