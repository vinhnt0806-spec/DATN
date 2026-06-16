// #include <Arduino.h>
// #include <WiFi.h>
// #include <Adafruit_Sensor.h>
// #include <DHT.h>
// #include <DHT_U.h>
// #include <BH1750.h>
// #include <Wire.h>
// #include <Adafruit_GFX.h>
// #include <Adafruit_SH110X.h>
// #include <HTTPClient.h>
// #include <ArduinoJson.h>

// // wifi
// // const char* ssid = "abc";
// // const char* password = "12345679";

// const char* ssid = "Galaxy A06 5G 9754";
// const char* password = "999999999";
// // server
// String server = "http://10.219.42.111:3000";

// // RELAY
// #define PUMP  25
// #define SPRAY 26
// #define LIGHT 27
// #define FAN   14

// // BUTTONS
// #define BTN_MODE 23
// #define BTN_PUMP 19
// #define BTN_SPRAY 18
// #define BTN_LIGHT 5
// #define BTN_FAN 4
// #define BTN_STEPPER 15
// #define BTN_SCREEN 12  // FIX: Thêm chân nút nhấn chuyển màn hình (Nối chân 12 và GND)

// // sensor
// #define DHTPIN 13
// #define DHTTYPE DHT22
// #define SOIL_PIN 34

// // led wifi
// #define LED_WIFI_GREEN 33
// #define LED_WIFI_RED 32

// // Định nghĩa chân UART2
// #define RXD2 16
// #define TXD2 17

// // màn hình oled
// #define SCREEN_WIDTH 128
// #define SCREEN_HEIGHT 64
// Adafruit_SH1106G display = Adafruit_SH1106G(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

// DHT dht(DHTPIN, DHTTYPE);
// BH1750 lightMeter(0x23);

// // control
// bool pump  = 0;
// bool spray = 0;
// bool light = 0;
// bool fan   = 0;
// bool shade = 0;
// int  mode  = 0;

// // BUTTON STATES
// bool lastMode = HIGH;
// bool lastPump = HIGH;
// bool lastSpray = HIGH;
// bool lastLight = HIGH;
// bool lastFan = HIGH;
// bool lastShade = HIGH;
// bool lastScreenBtn = HIGH; // FIX: Trạng thái nút chuyển màn hình cũ

// int currentScreen = 0;     // FIX: Biến lưu màn hình hiện tại (0: Màn hình chính, 1: Màn hình phụ)

// // trạng thái cũ
// bool lastPumpS  = 0;
// bool lastSprayS = 0;
// bool lastLightS = 0;
// bool lastFanS   = 0;
// bool lastModeS  = 0;
// bool lastShadeS = 0;
// bool lastShadeUART = 0;

// // GÁN GIÁ TRỊ MẶC ĐỊNH CHO CÁC NGƯỠNG
// float nhietdoTren = 35.0;
// float doamkkTren = 80.0;
// float doamdatTren = 70.0;
// float anhsangTren = 1000.0;

// float nhietdoDuoi = 25.0;
// float doamkkDuoi = 50.0;
// float doamdatDuoi = 40.0;
// float anhsangDuoi = 200.0;

// // sensor
// float nhietdo = 0.0;
// float doamkk = 0.0;
// float doamdat = 0.0;
// float anhsang = 0.0;

// unsigned long lastButtonPressTime = 0;
// unsigned long lastScreenDebounce = 0;

// unsigned long lastDebounce[6] = {0};
// const int debounceDelay = 50; // ms

// void sendControl() 
// {
//   if (WiFi.status() != WL_CONNECTED) return;

//   if (pump != lastPumpS || spray != lastSprayS || light != lastLightS || fan != lastFanS || shade != lastShadeS || mode != lastModeS)
//   {
//     HTTPClient http;
//     http.begin(server + "/control");
//     http.setConnectTimeout(150);
//     http.setTimeout(150);
//     http.addHeader("Content-Type", "application/json");

//     String json = "{";
//     json += "\"bom\":" + String(pump) + ",";
//     json += "\"phunsuong\":" + String(spray) + ",";
//     json += "\"den\":" + String(light) + ",";
//     json += "\"quat\":" + String(fan) + ",";
//     json += "\"manche\":" + String(shade) + ",";
//     json += "\"mode\":" + String(mode);
//     json += "}";

//     int httpCode = http.POST(json);
//     http.end();

//     lastPumpS = pump;
//     lastSprayS = spray;
//     lastLightS = light;
//     lastFanS = fan;
//     lastShadeS = shade;
//     lastModeS = mode;
//   }
// }

// void sendSensor() 
// {
//   if (WiFi.status() != WL_CONNECTED) return;

//   HTTPClient http;
//   http.begin(server + "/update-sensor");
//   http.setConnectTimeout(150);
//   http.setTimeout(150);
//   http.addHeader("Content-Type", "application/json");

//   String json = "{";
//   json += "\"nhietdo\":" + String(nhietdo) + ",";
//   json += "\"doamkk\":" + String(doamkk) + ",";
//   json += "\"doamdat\":" + String(doamdat) + ",";
//   json += "\"anhsang\":" + String(anhsang);
//   json += "}";

//   http.POST(json);
//   http.end();
// }

// void getServer() 
// {
//   if (WiFi.status() != WL_CONNECTED) return;

//   HTTPClient http;
//   http.begin(server + "/data");
//   http.setConnectTimeout(150);
//   http.setTimeout(150);
//   int code = http.GET();

//   if (code == 200) {
//     String payload = http.getString();
//     JsonDocument doc;
//     DeserializationError err = deserializeJson(doc, payload);
//     if (err) {
//       Serial.println("JSON error");
//       http.end();
//       return;
//     }
  
//     nhietdoTren = doc["thresholds"]["temperatureUpper"] | nhietdoTren;
//     doamkkTren = doc["thresholds"]["humidityUpper"] | doamkkTren;
//     doamdatTren = doc["thresholds"]["soilMoistureUpper"] | doamdatTren;
//     anhsangTren = doc["thresholds"]["lightIntensityUpper"] | anhsangTren;

//     nhietdoDuoi = doc["thresholds"]["temperatureLower"] | nhietdoDuoi;
//     doamkkDuoi = doc["thresholds"]["humidityLower"] | doamkkDuoi;
//     doamdatDuoi = doc["thresholds"]["soilMoistureLower"] | doamdatDuoi;
//     anhsangDuoi = doc["thresholds"]["lightIntensityLower"] | anhsangDuoi;

//     JsonObject pc = doc["control"];
//     if (!pc.isNull()) 
//     {
//       mode = doc["system"]["mode"] | mode;
//       if (millis() - lastButtonPressTime > 1000)
//       {
//         pump  = (int)pc["bom"];
//         spray = (int)pc["phunsuong"];
//         light = (int)pc["den"];
//         fan   = (int)pc["quat"];
//         shade = (int)pc["manche"];
//       }
//     }
//   }
//   http.end();
// }

// void autoControl() 
// {
//   bool oldPump  = pump;
//   bool oldSpray = spray;
//   bool oldLight = light;
//   bool oldFan   = fan;
//   bool oldShade = shade;

//   if (mode == 0) 
//   {
//     if (doamdat < doamdatDuoi) { pump = 1; }
//     else if (doamdat > doamdatTren) { pump = 0; }

//     if (doamkk < doamkkDuoi) { spray = 1; }
//     else if (doamkk > doamkkTren) { spray = 0; }

//     if (anhsang < anhsangDuoi) { light = 1;} 
//     else if (anhsang > (anhsangDuoi + 200.0)) { light = 0; }

//     if (nhietdo > nhietdoTren) { fan = 1; }
//     else if (nhietdo < nhietdoDuoi) { fan = 0; } 

//     if (anhsang > anhsangTren) { shade = 1; }
//     else if (anhsang < (anhsangTren - 200.0)) { shade = 0; }
//   }
//   if (pump != oldPump || spray != oldSpray || light != oldLight || fan != oldFan || shade != oldShade)
//   {
//     sendControl();
//   }
// }

// void handleBtn(int pin, bool &last, bool &state, int index) {
//   bool current = digitalRead(pin);
//   if (last == HIGH && current == LOW) {
//     if (millis() - lastDebounce[index] > debounceDelay) {
//       state = !state;
//       lastButtonPressTime = millis();
//       sendControl(); 
//       lastDebounce[index] = millis();
//     }
//   }
//   last = current;
// }

// void handleModeBtn(int pin, bool &last, int &mode, int index) {
//   bool current = digitalRead(pin);
//   if (last == HIGH && current == LOW) {
//     if (millis() - lastDebounce[index] > debounceDelay) {
//       mode = (mode == 0) ? 1 : 0;
//       lastButtonPressTime = millis();
//       sendControl();
//       lastDebounce[index] = millis();
//     }
//   }
//   last = current;
// }

// // FIX: Hàm xử lý nút bấm chuyển đổi màn hình (0 -> 1 -> 0)
// void handleScreenBtn(int pin, bool &last, int &screen, int index) {
//   bool current = digitalRead(pin);
//   if (last == HIGH && current == LOW) {
//     if (millis() - lastDebounce[index] > debounceDelay) {
//       screen = (screen == 0) ? 1 : 0; 
//       lastDebounce[index] = millis();
//     }
//   }
//   last = current;
// }

// void screenControl()
// {
//     bool current = digitalRead(BTN_SCREEN);
//     if (lastScreenBtn == HIGH && current == LOW)
//     {
//         if (millis() - lastScreenDebounce > debounceDelay)
//         {
//             currentScreen++;
//             if (currentScreen > 2)
//             {
//                 currentScreen = 0;
//             }
//             lastScreenDebounce = millis();
//         }
//     }
//     lastScreenBtn = current;
// }

// void buttonControl() {
//   // MODE và nút CHUYỂN MÀN HÌNH luôn luôn hoạt động độc lập
//   handleModeBtn(BTN_MODE, lastMode, mode, 0);

//   // chỉ manual mới điều khiển thiết bị từ nút nhấn
//   if (mode == 1) {
//     handleBtn(BTN_PUMP, lastPump, pump, 1);
//     handleBtn(BTN_SPRAY, lastSpray, spray, 2);
//     handleBtn(BTN_LIGHT, lastLight, light, 3);
//     handleBtn(BTN_FAN, lastFan, fan, 4);
//     handleBtn(BTN_STEPPER, lastShade, shade, 5);
//   }
// }

// void Shade()
// {
//   if (shade != lastShadeUART) {
//     Serial.print("GUI UART: ");
//     Serial.println(shade);
//     if (shade == 1) {
//         Serial.println("UART2: Gui lenh '1' (Dong mai che)");
//         Serial2.print('1');
//     } else if(shade == 0) {
//         Serial.println("UART2: Gui lenh '0' (Mo mai che)");
//         Serial2.print('0');
//     }
//     lastShadeUART = shade;
//   }
// }

// void getSensor()
// {
//   float temp_nhietdo = dht.readTemperature();
//   float temp_doam = dht.readHumidity();

//   if (!isnan(temp_nhietdo) && !isnan(temp_doam)) {
//     nhietdo = temp_nhietdo;
//     doamkk = temp_doam;
//   } else {
//     Serial.println("Loi doc DHT!");
//   }
  
//   anhsang = lightMeter.readLightLevel();
//   int DatValue = analogRead(SOIL_PIN);
//   doamdat = (100 - ((DatValue / 4095.00) * 100));
//   if(doamdat < 0) doamdat = 0;
//   if(doamdat > 100) doamdat = 100;
// }

// void setup() {
//   Serial.begin(115200);
//   Serial2.begin(115200, SERIAL_8N1, RXD2, TXD2);

//   pinMode(PUMP, OUTPUT);
//   pinMode(SPRAY, OUTPUT);
//   pinMode(LIGHT, OUTPUT);
//   pinMode(FAN, OUTPUT);

//   pinMode(LED_WIFI_GREEN, OUTPUT);
//   pinMode(LED_WIFI_RED, OUTPUT);

//   digitalWrite(PUMP, HIGH);
//   digitalWrite(SPRAY, HIGH);
//   digitalWrite(LIGHT, HIGH);
//   digitalWrite(FAN, HIGH);

//   pinMode(BTN_MODE, INPUT_PULLUP);
//   pinMode(BTN_PUMP, INPUT_PULLUP);
//   pinMode(BTN_SPRAY, INPUT_PULLUP);
//   pinMode(BTN_LIGHT, INPUT_PULLUP);
//   pinMode(BTN_FAN, INPUT_PULLUP);
//   pinMode(BTN_STEPPER, INPUT_PULLUP);
//   pinMode(BTN_SCREEN, INPUT_PULLUP);

//   dht.begin();
//   Wire.begin(21, 22);
//   lightMeter.begin(BH1750::CONTINUOUS_HIGH_RES_MODE);
//   display.begin(0x3C, true);

//   display.clearDisplay();
//   display.setTextColor(SH110X_WHITE);

//   display.setTextSize(2);
//   display.setCursor(15, 20);
//   display.println("START");
//   display.display();

//   delay(500);
//   WiFi.begin(ssid, password);
//   lastShadeUART = shade;
// }

// // LOOP
// void loop()
// {
//   static unsigned long lastReconnect = 0;
//   static unsigned long lastSensor = 0;
//   static unsigned long lastServer = 0;
//   static unsigned long lastOLED = 0;

//   // Xử lý WiFi
//   if (WiFi.status() != WL_CONNECTED)
//   {
//     digitalWrite(LED_WIFI_GREEN, LOW);
//     digitalWrite(LED_WIFI_RED, HIGH);
    
//     if (millis() - lastReconnect > 10000) 
//     {
//       Serial.println("Reconnecting to WiFi...");
//       WiFi.disconnect();
//       WiFi.begin(ssid, password);
//       lastReconnect = millis();
//     }
//   } else {
//     digitalWrite(LED_WIFI_GREEN, HIGH);
//     digitalWrite(LED_WIFI_RED, LOW);
//   }

//   // Cập nhật cảm biến mỗi 2s
//   if (millis() - lastSensor > 2000)
//   {
//     lastSensor = millis();
//     getSensor();
//     sendSensor();
//   }

//   // Cập nhật dữ liệu từ server mỗi 1s
//   if (millis() - lastServer > 1000)
//   {
//     lastServer = millis();
//     getServer();
//   }

//   screenControl();
//   // Quét phím liên tục
//   buttonControl();

//   if (mode == 0)
//   {
//     autoControl();
//   }
  
//   Shade();

//   // Xuất tín hiệu ra Relay
//   digitalWrite(PUMP, !pump);
//   digitalWrite(SPRAY, !spray);
//   digitalWrite(LIGHT, !light);
//   digitalWrite(FAN, !fan);

//   // FIX: Xử lý giao diện đa màn hình OLED (Cập nhật mỗi 500ms)
//   if (millis() - lastOLED > 500)
//   {
//     lastOLED = millis();
//     display.clearDisplay();
//     display.setTextSize(1);
    
//     if (currentScreen == 0) 
//     {
//       display.setCursor(10, 0);
//       display.println("HE THONG GIAM SAT");

//       display.setCursor(0, 10);
//       display.print("MODE: ");
//       if (mode == 0) 
//       display.println("AUTO");
//       else 
//       display.println("MANUAL");
      
//       display.setCursor(0, 20);
//       display.print("Nhietdo:"); 
//       display.print(nhietdo, 1); 
//       display.write(247);
//       display.print("C"); 

//       display.setCursor(0, 30);
//       display.print("Doamkk:"); 
//       display.print(doamkk, 1); 
//       display.print("%");

//       display.setCursor(0, 40);
//       display.print("Doamdat:"); 
//       display.print(doamdat, 1); 
//       display.print("%"); 

//       display.setCursor(0, 50);
//       display.print("As:"); 
//       display.print(anhsang, 1); 
//       display.print("lux");
//     }
//     else if(currentScreen == 1)
//     {
//       display.setCursor(10, 0);
//       display.println("NGUONG CAI DAT");

//       display.setCursor(40, 10);
//       display.print("Duoi");
//       display.setCursor(90, 10);
//       display.print("Tren");

//       display.setCursor(0, 20);
//       display.print("Nhietdo: ");
//       display.print(nhietdoDuoi, 1); 
//       display.setCursor(90, 20);
//       display.print(nhietdoTren, 1); 

//       display.setCursor(0, 30);
//       display.print("Doamkk: ");
//       display.print(doamkkDuoi, 1); 
//       display.setCursor(90, 30);
//       display.print(doamkkTren, 1);

//       display.setCursor(0, 40);
//       display.print("Doamdat: ");
//       display.print(doamdatDuoi, 1); 
//       display.setCursor(90, 40);
//       display.print(doamdatTren, 1); 

//       display.setCursor(0, 50);
//       display.print("anhsang: ");
//       display.print(anhsangDuoi, 1);
//       display.setCursor(90, 50);
//       display.print(anhsangTren, 1);
//     }
//     else if(currentScreen == 2)
//     {
//       display.setCursor(0, 0);
//       display.print("MODE: ");
//       if (mode == 0) 
//       display.println("AUTO");
//       else 
//       display.println("MANUAL");

//       display.setCursor(0, 10);
//       display.print("Bom: ");
//       display.println(pump ? "ON" : "OFF");

//       display.setCursor(0, 20);
//       display.print("Phun: ");
//       display.println(spray ? "ON" : "OFF");

//       display.setCursor(0, 30);
//       display.print("Den: ");
//       display.println(light ? "ON" : "OFF");

//       display.setCursor(0, 40);
//       display.print("Quat: ");
//       display.println(fan ? "ON" : "OFF");

//       display.setCursor(0, 50);
//       display.print("Manche: ");
//       display.println(shade ? "ON" : "OFF");
//     }
//   }
//     display.display();
// }

#include <Arduino.h>
#include <WiFi.h>
#include <Adafruit_Sensor.h>
#include <DHT.h>
#include <DHT_U.h>
#include <BH1750.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SH110X.h>
#include <ArduinoJson.h>
#include <WebSocketsClient.h> 
#include <esp_task_wdt.h> // Thư viện Watchdog Timer cho ESP32

// Cấu hình Watchdog Timer (Timeout 10 giây)
#define WDT_TIMEOUT 10


// Wifi Config
const char* ssid = "Galaxy A06 5G 9754";
const char* password = "999999999";
// const char* ssid = "IAC";
// const char* password = "iacmaidinh";
// const char* ssid = "abc";
// const char* password = "12345679";

// WebSocket Config
const char* ws_server = "datn-iot-hcmute.onrender.com";
const int ws_port = 443;

WebSocketsClient webSocket; 
bool isWsConnected = false; 

// RELAY
#define PUMP  25
#define SPRAY 26
#define LIGHT 27
#define FAN   14

// BUTTONS
#define BTN_MODE 23
#define BTN_PUMP 19
#define BTN_SPRAY 18
#define BTN_LIGHT 5
#define BTN_FAN 4
#define BTN_STEPPER 15
#define BTN_SCREEN 12

// SENSORS
#define DHTPIN 13
#define DHTTYPE DHT22
#define SOIL_PIN 34

// LED WIFI
#define LED_WIFI_GREEN 33
#define LED_WIFI_RED 32

// UART2
#define RXD2 16
#define TXD2 17

// OLED SCREEN
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SH1106G display = Adafruit_SH1106G(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

DHT dht(DHTPIN, DHTTYPE);
BH1750 lightMeter(0x23);

// Control States
bool pump  = 0;
bool spray = 0;
bool light = 0;
bool fan   = 0;
bool shade = 0;
int  mode  = 0; // 0: AUTO, 1: MANUAL

// Button States
bool lastMode = HIGH;
bool lastPump = HIGH;
bool lastSpray = HIGH;
bool lastLight = HIGH;
bool lastFan = HIGH;
bool lastShade = HIGH;
bool lastScreenBtn = HIGH; 

int currentScreen = 0;    

// Sync States
bool lastPumpS  = 0;
bool lastSprayS = 0;
bool lastLightS = 0;
bool lastFanS   = 0;
bool lastModeS  = 0;
bool lastShadeS = 0;
bool lastShadeUART = 0;

// Thresholds
float nhietdoTren = 35.0;
float doamkkTren = 80.0;
float doamdatTren = 70.0;
float anhsangTren = 1000.0;

float nhietdoDuoi = 25.0;
float doamkkDuoi = 50.0;
float doamdatDuoi = 40.0;
float anhsangDuoi = 200.0;

// Sensor Values
float nhietdo = 0.0;
float doamkk = 0.0;
float doamdat = 0.0;
float anhsang = 0.0;

unsigned long lastButtonPressTime = 0;
unsigned long lastScreenDebounce = 0;
unsigned long lastDebounce[6] = {0};
const int debounceDelay = 100; 
bool isWaitingInitialSync = false; // Cờ kiểm tra gói sync đầu tiên khi mới kết nối

// Hàm gửi trạng thái MODE lên Server qua WebSocket
void sendMode()
{
  if (WiFi.status() != WL_CONNECTED || !isWsConnected) return;
  if(mode != lastModeS)
  {
    JsonDocument doc;
    doc["event"] = "mode";
    doc["mode"] = mode;

    String json;
    serializeJson(doc, json);
    webSocket.sendTXT(json);
    
    lastModeS = mode;
  }
}

// Hàm gửi trạng thái thiết bị qua WebSocket
void sendControl() 
{
  // CHÈN DÒNG NÀY ĐỂ KIỂM TRA XEM NÚT BẤM CÓ ĂN KHÔNG
  Serial.println("[DEBUG] Nút bấm kích hoạt hàm sendControl()"); 

if (WiFi.status() != WL_CONNECTED || !isWsConnected) return;

  if (pump != lastPumpS || spray != lastSprayS || light != lastLightS || fan != lastFanS || shade != lastShadeS)
  {
    JsonDocument doc;
    doc["event"] = "control"; 
    doc["bom"] = pump ? 1 : 0;        // Đã ép kiểu sang số nguyên
    doc["phunsuong"] = spray ? 1 : 0;
    doc["den"] = light ? 1 : 0;
    doc["quat"] = fan ? 1 : 0;
    doc["manche"] = shade ? 1 : 0;

    String json;
    serializeJson(doc, json);
    
    // CHÈN DÒNG NÀY ĐỂ XEM CHUỖI JSON XUẤT XƯỞNG
    Serial.print("[🟢 DEBUG] ESP32 đang bắn JSON lên Server: ");
    Serial.println(json);

    webSocket.sendTXT(json); 

    lastPumpS = pump;
    lastSprayS = spray;
    lastLightS = light;
    lastFanS = fan;
    lastShadeS = shade;
  }
}

// Hàm gửi dữ liệu cảm biến qua WebSocket
void sendSensor()
{
  if (WiFi.status() != WL_CONNECTED || !isWsConnected) return;

  JsonDocument doc;
  doc["event"] = "sensor"; 
  doc["nhietdo"] = nhietdo;
  doc["doamkk"] = doamkk;
  doc["doamdat"] = doamdat;
  doc["anhsang"] = anhsang;

  String json;
  serializeJson(doc, json);
  webSocket.sendTXT(json); 
}

// Hàm xử lý các sự kiện từ WebSocket Server
// void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) 
// {
//   switch(type) {
//     case WStype_DISCONNECTED:
//       Serial.println("[WS] Đã ngắt kết nối tới Server!");
//       isWsConnected = false;
//       break;
      
//     case WStype_CONNECTED:
//       Serial.println("[WS] Kết nối thành công tới Server WebSocket!");
//       isWsConnected = true;
      
//       // Đồng bộ toàn bộ trạng thái hiện tại lên khi vừa kết nối
//       lastModeS  = !mode;
//       lastPumpS  = !pump;
//       lastSprayS = !spray;
//       lastLightS = !light;
//       lastFanS   = !fan;
//       lastShadeS = !shade;
//       sendMode();
//       sendControl();
//       sendSensor();
//       break;
      
//     case WStype_TEXT:
//     { 
//       Serial.print("[WS] Nhận dữ liệu thô: ");
//       Serial.write(payload, length);
//       Serial.println();

//       JsonDocument doc;
//       DeserializationError err = deserializeJson(doc, payload, length);
//       if (err) {
//         Serial.print("[❌ LỖI] Phân tích JSON thất bại: ");
//         Serial.println(err.c_str());
//         return;
//       }

//       String eventType = doc["event"] | "";
      
//       // 1. NHẬN GÓI CÀI ĐẶT NGƯỠNG TỰ ĐỘNG
//       if (eventType == "threshold")
//       {
//         if (doc.containsKey("temperatureUpper"))    nhietdoTren = doc["temperatureUpper"].as<float>();
//         if (doc.containsKey("humidityUpper"))       doamkkTren  = doc["humidityUpper"].as<float>();
//         if (doc.containsKey("soilMoistureUpper"))   doamdatTren = doc["soilMoistureUpper"].as<float>();
//         if (doc.containsKey("lightIntensityUpper")) anhsangTren = doc["lightIntensityUpper"].as<float>();

//         if (doc.containsKey("temperatureLower"))    nhietdoDuoi = doc["temperatureLower"].as<float>();
//         if (doc.containsKey("humidityLower"))       doamkkDuoi  = doc["humidityLower"].as<float>();
//         if (doc.containsKey("soilMoistureLower"))   doamdatDuoi = doc["soilMoistureLower"].as<float>();
//         if (doc.containsKey("lightIntensityLower")) anhsangDuoi = doc["lightIntensityLower"].as<float>();
//         Serial.println("🟢 Cập nhật ngưỡng tự động thành công!");
//       }
      
//       // 2. NHẬN GÓI THAY ĐỔI RIÊNG MODE (AUTO/MANUAL)
//       else if (eventType == "mode")
//       {
//         if (doc.containsKey("mode")) {
//           mode = doc["mode"].as<int>();
//           lastModeS = mode; // Cập nhật cờ để nút nhấn cơ không bị xung đột
//         }
//         Serial.print("🟢 Đồng bộ chế độ hệ thống: ");
//         Serial.println(mode == 0 ? "AUTO" : "MANUAL");
//       }
      
//       // 3. NHẬN GÓI ĐIỀU KHIỂN THIẾT BỊ (MANUAL BẰNG TAY TỪ WEB)
//       else if (eventType == "control")
//       {
//         Serial.println("🟢 Nhận lệnh điều khiển thiết bị từ Web!");
        
//         // Trích xuất an toàn bằng ép kiểu rõ ràng, loại bỏ hoàn toàn lỗi toán tử '|'
//         if (doc.containsKey("bom"))       pump      = (doc["bom"].as<int>() == 1);
//         if (doc.containsKey("phunsuong")) spray     = (doc["phunsuong"].as<int>() == 1);
//         if (doc.containsKey("den"))       light     = (doc["den"].as<int>() == 1);
//         if (doc.containsKey("quat"))      fan       = (doc["quat"].as<int>() == 1);
//         if (doc.containsKey("manche"))    shade     = (doc["manche"].as<int>() == 1);
        
//         // QUAN TRỌNG: Cập nhật cờ kiểm tra ngay lập tức để đồng bộ với nút nhấn cơ trên mạch
//         lastPumpS  = pump;
//         lastSprayS = spray;
//         lastLightS = light;
//         lastFanS   = fan;
//         lastShadeS = shade;
        
//         Serial.printf("[DEBUG] Trạng thái sau đồng bộ -> Bom:%d, Phun:%d, Den:%d, Quat:%d, Manche:%d\n", pump, spray, light, fan, shade);
//       }
      
//       // 4. NHẬN GÓI ĐỒNG BỘ TỔNG THỂ KHI MỚI KẾT NỐI VÀO MẠNG
//       else if (eventType == "sync")
//       {
//         if (doc.containsKey("mode")) {
//           mode = doc["mode"].as<int>();
//           lastModeS = mode;
//         }
        
//         // Đồng bộ trạng thái thiết bị ON/OFF trong Object lồng "control"
//         if (doc.containsKey("control")) {
//           JsonObject ctrl = doc["control"];
//           if (ctrl.containsKey("bom"))       pump      = (ctrl["bom"].as<int>() == 1);
//           if (ctrl.containsKey("phunsuong")) spray     = (ctrl["phunsuong"].as<int>() == 1);
//           if (ctrl.containsKey("den"))       light     = (ctrl["den"].as<int>() == 1);
//           if (ctrl.containsKey("quat"))      fan       = (ctrl["quat"].as<int>() == 1);
//           if (ctrl.containsKey("manche"))    shade     = (ctrl["manche"].as<int>() == 1);
          
//           lastPumpS  = pump;
//           lastSprayS = spray;
//           lastLightS = light;
//           lastFanS   = fan;
//           lastShadeS = shade;
//         }

//         // Đồng bộ các ngưỡng cài đặt trong Object lồng "thresholds"
//         if (doc.containsKey("thresholds")) {
//           JsonObject th = doc["thresholds"];
//           if (th.containsKey("temperatureUpper"))    nhietdoTren = th["temperatureUpper"].as<float>();
//           if (th.containsKey("humidityUpper"))       doamkkTren  = th["humidityUpper"].as<float>();
//           if (th.containsKey("soilMoistureUpper"))   doamdatTren = th["soilMoistureUpper"].as<float>();
//           if (th.containsKey("lightIntensityUpper")) anhsangTren = th["lightIntensityUpper"].as<float>();

//           if (th.containsKey("temperatureLower"))    nhietdoDuoi = th["temperatureLower"].as<float>();
//           if (th.containsKey("humidityLower"))       doamkkDuoi  = th["humidityLower"].as<float>();
//           if (th.containsKey("soilMoistureLower"))   doamdatDuoi = th["soilMoistureLower"].as<float>();
//           if (th.containsKey("lightIntensityLower")) anhsangDuoi = th["lightIntensityLower"].as<float>();
//         }
        
//         Serial.println("🔄 Đã đồng bộ cấu hình tổng thể thành công!");
//       }
//       break;
//     } 

//     case WStype_BIN:
//       break;
      
//     case WStype_ERROR:
//       Serial.println("[WS] Gặp lỗi kết nối!");
//       break;
//   }
// }

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) 
{
  switch(type) {
    case WStype_DISCONNECTED:
      Serial.println("[WS] Đã ngắt kết nối tới Server!");
      isWsConnected = false;
      isWaitingInitialSync = false; // Reset cờ khi mất mạng
      break;
      
    case WStype_CONNECTED:
      Serial.println("[WS] Kết nối thành công tới Server WebSocket!");
      isWsConnected = true;
      
      // 🔥 BẬT CỜ: Báo hiệu gói 'sync' sắp tới là gói đầu tiên khi mới kết nối
      isWaitingInitialSync = true; 
      
      // Chủ động gửi request_sync lên Server để xin cấu hình
      {
        JsonDocument syncReqDoc;
        syncReqDoc["event"] = "request_sync";
        
        String jsonReq;
        serializeJson(syncReqDoc, jsonReq);
        webSocket.sendTXT(jsonReq);
        Serial.println("📤 [WS] Đã gửi 'request_sync' (Bật cờ chỉ xin cấu hình ngưỡng)...");
      }
      break;
      
    case WStype_TEXT:
    { 
      Serial.print("[WS] Nhận dữ liệu thô: ");
      Serial.write(payload, length);
      Serial.println();

      JsonDocument doc;
      DeserializationError err = deserializeJson(doc, payload, length);
      if (err) {
        Serial.print("[❌ LỖI] Phân tích JSON thất bại: ");
        Serial.println(err.c_str());
        return;
      }

      String eventType = doc["event"] | "";
      
      // =======================================================================
      // 1. NHẬN GÓI CÀI ĐẶT NGƯỠNG TỰ ĐỘNG (Khi Web thay đổi riêng lẻ ngưỡng)
      // =======================================================================
      if (eventType == "threshold")
      {
        if (doc.containsKey("temperatureUpper"))   nhietdoTren = doc["temperatureUpper"];
        if (doc.containsKey("humidityUpper"))      doamkkTren  = doc["humidityUpper"];
        if (doc.containsKey("soilMoistureUpper"))  doamdatTren = doc["soilMoistureUpper"];
        if (doc.containsKey("lightIntensityUpper")) anhsangTren = doc["lightIntensityUpper"];

        if (doc.containsKey("temperatureLower"))   nhietdoDuoi = doc["temperatureLower"];
        if (doc.containsKey("humidityLower"))      doamkkDuoi  = doc["humidityLower"];
        if (doc.containsKey("soilMoistureLower"))  doamdatDuoi = doc["soilMoistureLower"];
        if (doc.containsKey("lightIntensityLower")) anhsangDuoi = doc["lightIntensityLower"];
        
        Serial.println("🟢 Cập nhật ngưỡng tự động thành công!");
      }
      
      // =======================================================================
      // 2. NHẬN GÓI THAY ĐỔI RIÊNG MODE (AUTO/MANUAL từ Web)
      // =======================================================================
      else if (eventType == "mode")
      {
        if (doc.containsKey("mode")) {
          mode = doc["mode"];
          lastModeS = mode; 
          Serial.print("🟢 Đồng bộ chế độ hệ thống: ");
          Serial.println(mode == 0 ? "AUTO" : "MANUAL");
        }
      }
      
      // =======================================================================
      // 3. NHẬN GÓI ĐIỀU KHIỂN THIẾT BỊ (MANUAL từ Web)
      // =======================================================================
      else if (eventType == "control")
      {
        Serial.println("🟢 Nhận lệnh điều khiển thiết bị từ Web!");
        
        if (doc.containsKey("bom"))       pump      = (doc["bom"] == 1);
        if (doc.containsKey("phunsuong")) spray     = (doc["phunsuong"] == 1);
        if (doc.containsKey("den"))       light     = (doc["den"] == 1);
        if (doc.containsKey("quat"))      fan       = (doc["quat"] == 1);
        if (doc.containsKey("manche"))    shade     = (doc["manche"] == 1);
        
        lastPumpS  = pump;
        lastSprayS = spray;
        lastLightS = light;
        lastFanS   = fan;
        lastShadeS = shade;
      }
      
      // =======================================================================
      // 4. 🔥 XỬ LÝ ĐA NHIỆM GÓI "sync" BẰNG CỜ HIỆU
      // =======================================================================
      else if (eventType == "sync")
      {
        if (isWaitingInitialSync) 
        {
          // TRƯỜNG HỢP A: MỚI KẾT NỐI MẠNG -> CHỈ LẤY NGƯỠNG CÀI ĐẶT
          Serial.println("📥 [WS] Gói sync đầu tiên (Sau Reconnect) -> Chỉ cập nhật Ngưỡng.");

          if (doc.containsKey("thresholds")) {
            JsonObject th = doc["thresholds"];
            if (th.containsKey("temperatureUpper"))   nhietdoTren = th["temperatureUpper"];
            if (th.containsKey("humidityUpper"))      doamkkTren  = th["humidityUpper"];
            if (th.containsKey("soilMoistureUpper"))  doamdatTren = th["soilMoistureUpper"];
            if (th.containsKey("lightIntensityUpper")) anhsangTren = th["lightIntensityUpper"];

            if (th.containsKey("temperatureLower"))   nhietdoDuoi = th["temperatureLower"];
            if (th.containsKey("humidityLower"))      doamkkDuoi  = th["humidityLower"];
            if (th.containsKey("soilMoistureLower"))  doamdatDuoi = th["soilMoistureLower"];
            if (th.containsKey("lightIntensityLower")) anhsangDuoi = th["lightIntensityLower"];
          }
          
          isWaitingInitialSync = false; // 🔥 HẠ CỜ: Các gói sync sau này sẽ nhận tuốt
          Serial.println("🔄 Đã đồng bộ bộ ngưỡng ban đầu thành công!");
        } 
        else 
        {
          // TRƯỜNG HỢP B: ĐANG CHẠY BÌNH THƯỜNG MÀ CÓ SYNC -> DO WEB APP BẤM NÚT -> NHẬN HẾT
          Serial.println("📥 [WS] Gói sync thời gian thực (Web/App bấm nút) -> Cập nhật toàn bộ.");

          if (doc.containsKey("mode")) {
            mode = doc["mode"];
            lastModeS = mode;
          }
          
          if (doc.containsKey("control")) {
            JsonObject ctrl = doc["control"];
            if (ctrl.containsKey("bom"))       pump      = (ctrl["bom"] == 1);
            if (ctrl.containsKey("phunsuong")) spray     = (ctrl["phunsuong"] == 1);
            if (ctrl.containsKey("den"))       light     = (ctrl["den"] == 1);
            if (ctrl.containsKey("quat"))      fan       = (ctrl["quat"] == 1);
            if (ctrl.containsKey("manche"))    shade     = (ctrl["manche"] == 1);
            
            lastPumpS  = pump;
            lastSprayS = spray;
            lastLightS = light;
            lastFanS   = fan;
            lastShadeS = shade;
          }

          if (doc.containsKey("thresholds")) {
            JsonObject th = doc["thresholds"];
            if (th.containsKey("temperatureUpper"))   nhietdoTren = th["temperatureUpper"];
            if (th.containsKey("humidityUpper"))      doamkkTren  = th["humidityUpper"];
            if (th.containsKey("soilMoistureUpper"))  doamdatTren = th["soilMoistureUpper"];
            if (th.containsKey("lightIntensityUpper")) anhsangTren = th["lightIntensityUpper"];

            if (th.containsKey("temperatureLower"))   nhietdoDuoi = th["temperatureLower"];
            if (th.containsKey("humidityLower"))      doamkkDuoi  = th["humidityLower"];
            if (th.containsKey("soilMoistureLower"))  doamdatDuoi = th["soilMoistureLower"];
            if (th.containsKey("lightIntensityLower")) anhsangDuoi = th["lightIntensityLower"];
          }
          Serial.println("🔄 Đã đồng bộ lệnh điều khiển từ Web thành công!");
        }
      }
      break;
    } 

    case WStype_BIN:
      break;
      
    case WStype_ERROR:
      Serial.println("[WS] Gặp lỗi kết nối!");
      break;
  }
}

void autoControl() 
{
  bool oldPump  = pump;
  bool oldSpray = spray;
  bool oldLight = light;
  bool oldFan   = fan;
  bool oldShade = shade;

  if (mode == 0) 
  {
    if (doamdat < doamdatDuoi) { pump = 1; }
    else if (doamdat > doamdatTren) { pump = 0; }

    if (doamkk < doamkkDuoi) { spray = 1; }
    else if (doamkk > doamkkTren) { spray = 0; }

    if (anhsang < anhsangDuoi) { light = 1;} 
    else if (anhsang > (anhsangDuoi + 200.0)) { light = 0; }

    if (nhietdo > nhietdoTren) { fan = 1; }
    else if (nhietdo < nhietdoDuoi) { fan = 0; } 

    if (anhsang > anhsangTren) { shade = 1; }
    else if (anhsang < (anhsangTren - 200.0)) { shade = 0; }
  }
  if (pump != oldPump || spray != oldSpray || light != oldLight || fan != oldFan || shade != oldShade)
  {
    sendControl();
  }
}

void handleBtn(int pin, bool &last, bool &state, int index)
{
    bool current = digitalRead(pin);

    if(last != current)
    {
        Serial.printf("PIN %d = %d\n", pin, current);
    }

    if(last == HIGH && current == LOW)
    {
        if(millis() - lastDebounce[index] > debounceDelay)
        {
            state = !state;
            sendControl();
            lastDebounce[index] = millis();

            Serial.printf("Button %d Pressed\n", pin);
        }
    }

    last = current;
}

void handleModeBtn(int pin, bool &last, int &modeState, int index) {
  bool current = digitalRead(pin);
  if (last == HIGH && current == LOW) {
    if (millis() - lastDebounce[index] > debounceDelay) {
      modeState = (modeState == 0) ? 1 : 0;
      lastButtonPressTime = millis();
      sendMode(); 
      lastDebounce[index] = millis();
    }
  }
  last = current;
}

void screenControl()
{
    bool current = digitalRead(BTN_SCREEN);
    if (lastScreenBtn == HIGH && current == LOW)
    {
        if (millis() - lastScreenDebounce > debounceDelay)
        {
            currentScreen++;
            if (currentScreen > 2)
            {
                currentScreen = 0;
            }
            lastScreenDebounce = millis();
        }
    }
    lastScreenBtn = current;
}

void buttonControl() {
  handleModeBtn(BTN_MODE, lastMode, mode, 0);

  if (mode == 1) {
    handleBtn(BTN_PUMP, lastPump, pump, 1);
    handleBtn(BTN_SPRAY, lastSpray, spray, 2);
    handleBtn(BTN_LIGHT, lastLight, light, 3);
    handleBtn(BTN_FAN, lastFan, fan, 4);
    handleBtn(BTN_STEPPER, lastShade, shade, 5);
  }
}

void Shade()
{
  if (shade != lastShadeUART) {
    Serial.print("GUI UART: ");
    Serial.println(shade);
    if (shade == 1) {
        Serial.println("UART2: Gui lenh '1' (Dong mai che)");
        Serial2.print('1');
    } else if(shade == 0) {
        Serial.println("UART2: Gui lenh '0' (Mo mai che)");
        Serial2.print('0');
    }
    lastShadeUART = shade;
  }
}

void getSensor()
{
  float temp_nhietdo = dht.readTemperature();
  float temp_doam = dht.readHumidity();

  if (!isnan(temp_nhietdo) && !isnan(temp_doam)) {
    nhietdo = temp_nhietdo;
    doamkk = temp_doam; 
  } else {
    Serial.println("Loi doc DHT!");
  }
  
  anhsang = lightMeter.readLightLevel();

  // ✅ Thuật toán lấy mẫu trung bình 20 lần để lọc nhiễu ADC độ ẩm đất
  long sum = 0;
  for (int i = 0; i < 20; i++)
  {
      sum += analogRead(SOIL_PIN);
      delay(2);
  }
  int DatValue = sum / 20;

  doamdat = (100 - ((DatValue / 4095.00) * 100));
  if(doamdat < 0) doamdat = 0;
  if(doamdat > 100) doamdat = 100;
}

void setup() {
  Serial.begin(115200);
  Serial2.begin(115200, SERIAL_8N1, RXD2, TXD2);

  pinMode(PUMP, OUTPUT);
  pinMode(SPRAY, OUTPUT);
  pinMode(LIGHT, OUTPUT);
  pinMode(FAN, OUTPUT);

  pinMode(LED_WIFI_GREEN, OUTPUT);
  pinMode(LED_WIFI_RED, OUTPUT);

  digitalWrite(PUMP, HIGH);
  digitalWrite(SPRAY, HIGH);
  digitalWrite(LIGHT, HIGH);
  digitalWrite(FAN, HIGH);

  pinMode(BTN_MODE, INPUT_PULLUP);
  pinMode(BTN_PUMP, INPUT_PULLUP);
  pinMode(BTN_SPRAY, INPUT_PULLUP);
  pinMode(BTN_LIGHT, INPUT_PULLUP);
  pinMode(BTN_FAN, INPUT_PULLUP);
  pinMode(BTN_STEPPER, INPUT_PULLUP);
  pinMode(BTN_SCREEN, INPUT_PULLUP);

  dht.begin();
  Wire.begin(21, 22);
  lightMeter.begin(BH1750::CONTINUOUS_HIGH_RES_MODE);
  display.begin(0x3C, true);

  display.clearDisplay();
  display.setTextColor(SH110X_WHITE);
  display.setTextSize(2);
  display.setCursor(15, 20);
  display.println("START");
  display.display();

  delay(500);
  WiFi.begin(ssid, password);
//   while (WiFi.status() != WL_CONNECTED)
// {
//     delay(500);
//     Serial.print(".");
// }

// Serial.println();
// Serial.print("WiFi OK, IP = ");
// Serial.println(WiFi.localIP());
  
  // KHỞI TẠO WEBSOCKET CLIENT
  webSocket.beginSSL(ws_server, 443, "/");
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(5000);
  
  lastShadeUART = shade;

  // ✅ Khởi tạo Watchdog Timer cho ESP32 cứu nguy khi hệ thống bị kẹt
  esp_task_wdt_init(WDT_TIMEOUT, true); 
  esp_task_wdt_add(NULL); // Thêm tiểu trình loop() hiện tại vào giám sát
}

void loop()
{
  // ✅ Cho Watchdog ăn định kỳ để báo hiệu ESP32 vẫn sống khỏe
  esp_task_wdt_reset();

  static unsigned long lastReconnect = 0;
  static unsigned long lastWSReconnect = 0;
  static unsigned long lastSensor = 0;
  static unsigned long lastOLED = 0;

  // Xử lý mất kết nối WiFi
  if (WiFi.status() != WL_CONNECTED)
  {
    digitalWrite(LED_WIFI_GREEN, LOW);
    digitalWrite(LED_WIFI_RED, HIGH);
    isWsConnected = false;
    
    if (millis() - lastReconnect > 3000) 
    {
      Serial.println("Reconnecting to WiFi...");
      WiFi.disconnect();
      WiFi.begin(ssid, password);
      lastReconnect = millis();
    }
  } 
  // ✅ Xử lý khi có kết nối WiFi & Quản lý Reconnect WebSocket theo yêu cầu
  else 
  {
    digitalWrite(LED_WIFI_GREEN, HIGH);
    digitalWrite(LED_WIFI_RED, LOW);
    
    webSocket.loop();

    // if(!isWsConnected)
    // {
    //     // Chống spam liên tục: Chỉ thử reconnect thủ công lại sau mỗi 5 giây
    //     if (millis() - lastWSReconnect > 5000) 
    //     {
    //         lastWSReconnect = millis();
    //         Serial.println("[WS] Thử kết nối lại WebSocket thủ công...");
    //         webSocket.disconnect();
    //         webSocket.begin(ws_server, ws_port, "/");
    //         webSocket.onEvent(webSocketEvent);
    //         webSocket.setReconnectInterval(5000);
    //     }
    // }
  }

  // Đọc cảm biến định kỳ mỗi 2 giây
  if (millis() - lastSensor > 2000)
  {
    lastSensor = millis();
    getSensor();
    sendSensor();
  }

  screenControl();
  buttonControl();

  if (mode == 0)
  {
    autoControl();
  }
  
  Shade();

  digitalWrite(PUMP, !pump);
  digitalWrite(SPRAY, !spray);
  digitalWrite(LIGHT, !light);
  digitalWrite(FAN, !fan);

  // Cập nhật hiển thị OLED màn hình mỗi 500ms
  if (millis() - lastOLED > 500)
  {
    lastOLED = millis();
    display.clearDisplay();
    display.setTextSize(1);
    
    if (currentScreen == 0) 
    {
      display.setCursor(10, 0);
      display.println("HE THONG GIAM SAT");

      display.setCursor(0, 10);
      display.print("MODE: ");
      if (mode == 0) display.println("AUTO");
      else display.println("MANUAL");
      
      display.setCursor(0, 20);
      display.print("Nhietdo:"); 
      display.print(nhietdo, 1); 
      display.write(247);
      display.print("C"); 

      display.setCursor(0, 30);
      display.print("Doamkk:"); 
      display.print(doamkk, 1); 
      display.print("%");

      display.setCursor(0, 40);
      display.print("Doamdat:"); 
      display.print(doamdat, 1); 
      display.print("%"); 

      display.setCursor(0, 50);
      display.print("As:"); 
      display.print(anhsang, 1); 
      display.print("lux");
    }
    else if(currentScreen == 1)
    {
      display.setCursor(10, 0);
      display.println("NGUONG CAI DAT");

      display.setCursor(40, 10);
      display.print("Duoi");
      display.setCursor(90, 10);
      display.print("Tren");

      display.setCursor(0, 20);
      display.print("Nhietdo: ");
      display.print(nhietdoDuoi, 1); 
      display.setCursor(90, 20);
      display.print(nhietdoTren, 1); 

      display.setCursor(0, 30);
      display.print("Doamkk: ");
      display.print(doamkkDuoi, 1); 
      display.setCursor(90, 30);
      display.print(doamkkTren, 1);

      display.setCursor(0, 40);
      display.print("Doamdat: ");
      display.print(doamdatDuoi, 1); 
      display.setCursor(90, 40);
      display.print(doamdatTren, 1); 

      display.setCursor(0, 50);
      display.print("Asang:  ");
      display.print(anhsangDuoi, 1);
      display.setCursor(90, 50);
      display.print(anhsangTren, 1);
    }
    else if(currentScreen == 2)
    {
      display.setCursor(0, 0);
      display.print("MODE: ");
      if (mode == 0) display.println("AUTO");
      else display.println("MANUAL");

      display.setCursor(0, 10);
      display.print("Bom: ");
      display.println(pump ? "ON" : "OFF");

      display.setCursor(0, 20);
      display.print("Phun: ");
      display.println(spray ? "ON" : "OFF");

      display.setCursor(0, 30);
      display.print("Den: ");
      display.println(light ? "ON" : "OFF");

      display.setCursor(0, 40);
      display.print("Quat: ");
      display.println(fan ? "ON" : "OFF");

      display.setCursor(0, 50);
      display.print("Manche: ");
      display.println(shade ? "ON" : "OFF");
    }
    display.display();
  }
}