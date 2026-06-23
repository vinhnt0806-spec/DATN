// #include <Arduino.h>
// #include <AccelStepper.h>

// // ====================
// // STEP MOTOR
// // ====================
// #define IN1 14
// #define IN2 27
// #define IN3 26
// #define IN4 25

// AccelStepper stepper(
//     AccelStepper::FULL4WIRE,
//     IN1, IN3, IN2, IN4
// );

// // ====================
// // UART2
// // ====================
// #define RXD2 16
// #define TXD2 17

// // ====================
// // SENSOR
// // ====================
// #define SENSOR_OPEN  19
// #define SENSOR_CLOSE 18

// // ====================
// // STATE
// // ====================
// enum State
// {
//     STOPPED,
//     FORWARD,
//     REVERSE
// };

// State motorState = STOPPED;

// void setup()
// {
//     Serial.begin(115200);

//     Serial2.begin(
//         115200,
//         SERIAL_8N1,
//         RXD2,
//         TXD2
//     );

//     pinMode(SENSOR_OPEN, INPUT_PULLUP);
//     pinMode(SENSOR_CLOSE, INPUT_PULLUP);

//     stepper.setMaxSpeed(500);

//     Serial.println("ESP32 #2 READY");
// }

// void loop()
// {
//     // ====================
//     // NHAN LENH UART
//     // ====================
//     while (Serial2.available())
//     {
//         char cmd = Serial2.read();

//         Serial.print("Nhan UART: ");
//         Serial.println(cmd);

//         if (cmd == '1')
//         {
//             motorState = FORWARD;
//             Serial.println("Dong mai che");
//         }
//         else if (cmd == '0')
//         {
//             motorState = REVERSE;
//             Serial.println("Mo mai che");
//         }
//         else if (cmd == 's')
//         {
//             motorState = STOPPED;
//             Serial.println("Dung");
//             // 🌟 Tắt điện động cơ khi nhận lệnh DỪNG khẩn cấp
//             stepper.disableOutputs(); 
//         }
//     }

//     // ====================
//     // DONG MAI CHE
//     // ====================
//     if (motorState == FORWARD)
//     {
//         if (digitalRead(SENSOR_CLOSE) == LOW)
//         {
//             motorState = STOPPED;
//             Serial.println("Da dong het");
//             // 🌟 Tắt điện động cơ khi đã đóng xong
//             stepper.disableOutputs(); 
//         }
//         else
//         {
//             stepper.setSpeed(-400);
//             stepper.runSpeed();
//         }
//     }

//     // ====================
//     // MO MAI CHE
//     // ====================
//     else if (motorState == REVERSE)
//     {
//         if (digitalRead(SENSOR_OPEN) == LOW)
//         {
//             motorState = STOPPED;
//             Serial.println("Da mo het");
//             // 🌟 Tắt điện động cơ khi đã mở xong
//             stepper.disableOutputs(); 
//         }
//         else
//         {
//             stepper.setSpeed(400);
//             stepper.runSpeed();
//         }
//     }
// }

#include <Arduino.h>
#include <AccelStepper.h>

// ====================
// STEP MOTOR PINS
// ====================
#define IN1 14
#define IN2 27
#define IN3 26
#define IN4 25

AccelStepper stepper(
    AccelStepper::FULL4WIRE,
    IN1, IN3, IN2, IN4
);

// ====================
// RELAY PINS (Cấu hình chân cho các thiết bị)
// Bạn hãy thay đổi các số chân GPIO này cho đúng với phần cứng thực tế của ESP32 #2
// ====================
#define PUMP_PIN  4
#define SPRAY_PIN 5
#define LIGHT_PIN 21
#define FAN_PIN   22

// ====================
// UART2
// ====================
#define RXD2 16
#define TXD2 17

// ====================
// SENSOR
// ====================
#define SENSOR_OPEN  19
#define SENSOR_CLOSE 18

// ====================
// STATE
// ====================
enum State
{
    STOPPED,
    FORWARD,
    REVERSE
};

State motorState = STOPPED;

void setup()
{
    Serial.begin(115200);

    // Khởi tạo UART2 để nhận dữ liệu từ ESP32 chính
    Serial2.begin(
        115200,
        SERIAL_8N1,
        RXD2,
        TXD2
    );

    // Cấu hình chân cảm biến hành trình
    pinMode(SENSOR_OPEN, INPUT_PULLUP);
    pinMode(SENSOR_CLOSE, INPUT_PULLUP);

    // Khởi tạo chân điều khiển Relay cho các thiết bị
    pinMode(PUMP_PIN, OUTPUT);
    pinMode(SPRAY_PIN, OUTPUT);
    pinMode(LIGHT_PIN, OUTPUT);
    pinMode(FAN_PIN, OUTPUT);

    // Mặc định ban đầu tắt hết thiết bị (Giả sử Relay kích mức CAO - HIGH)
    // Nếu mạch Relay của bạn kích mức THẤP (Active Low), hãy sửa HIGH thành LOW và ngược lại
    digitalWrite(PUMP_PIN, LOW);
    digitalWrite(SPRAY_PIN, LOW);
    digitalWrite(LIGHT_PIN, LOW);
    digitalWrite(FAN_PIN, LOW);

    stepper.setMaxSpeed(500);

    Serial.println("ESP32 #2 READY - WAITING FOR UART COMMANDS...");
}

void loop()
{
    // ====================
    // BỘ GIẢI MÃ LỆNH UART TỪ ESP32 #1
    // ====================
// ====================
    // BỘ GIẢI MÃ LỆNH UART TỪ ESP32 #1 (ĐÃ CẬP NHẬT THEO MÃ SỐ '0'-'9')
    // ====================
    while (Serial2.available())
    {
        char cmd = Serial2.read();

        Serial.print("Nhan UART: ");
        Serial.println(cmd);

        switch (cmd) 
        {
            // --- 1. ĐIỀU KHIỂN BƠM CHÍNH (PUMP) ---
            case '0':
                digitalWrite(PUMP_PIN, HIGH); // Bật bơm (Ứng với Serial2.print('0'))
                Serial.println("-> Relay: Bat Bom");
                break;
            case '1':
                digitalWrite(PUMP_PIN, LOW);  // Tắt bơm (Ứng với Serial2.print('1'))
                Serial.println("-> Relay: Tat Bom");
                break;

            // --- 2. ĐIỀU KHIỂN PHUN SƯƠNG (SPRAY) ---
            case '2':
                digitalWrite(SPRAY_PIN, HIGH); // Bật phun sương (Ứng với Serial2.print('2'))
                Serial.println("-> Relay: Bat Phun Suong");
                break;
            case '3':
                digitalWrite(SPRAY_PIN, LOW);  // Tắt phun sương (Ứng với Serial2.print('3'))
                Serial.println("-> Relay: Tat Phun Suong");
                break;

            // --- 3. ĐIỀU KHIỂN ĐÈN (LIGHT) ---
            case '4':
                digitalWrite(LIGHT_PIN, HIGH); // Bật đèn (Ứng với Serial2.print('4'))
                Serial.println("-> Relay: Bat Den");
                break;
            case '5':
                digitalWrite(LIGHT_PIN, LOW);  // Tắt đèn (Ứng với Serial2.print('5'))
                Serial.println("-> Relay: Tat Den");
                break;

            // --- 4. ĐIỀU KHIỂN QUẠT (FAN) ---
            case '6':
                digitalWrite(FAN_PIN, HIGH); // Bật quạt (Ứng với Serial2.print('6'))
                Serial.println("-> Relay: Bat Quat");
                break;
            case '7':
                digitalWrite(FAN_PIN, LOW);  // Tắt quạt (Ứng với Serial2.print('7'))
                Serial.println("-> Relay: Tat Quat");
                break;

            // --- 5. ĐIỀU KHIỂN MÁI CHE (ĐỘNG CƠ BƯỚC) ---
            case '8':
                motorState = FORWARD;
                Serial.println("-> Chay dong mai che (Dong)"); // Ứng với Serial2.print('8')
                break;
                
            case '9':
                motorState = REVERSE;
                Serial.println("-> Chay mo mai che (Mo)");   // Ứng với Serial2.print('9')
                break;
                
            case 'X': 
                motorState = STOPPED;
                Serial.println("-> Dung mai che khan cap");
                stepper.disableOutputs(); 
                break;
                
            default:
                break;
        }
    }

    // ====================
    // LOGIC CHẠY ĐỘNG CƠ VÀ CẢM BIẾN HÀNH TRÌNH
    // ====================
    if (motorState == FORWARD)
    {
        if (digitalRead(SENSOR_CLOSE) == LOW)
        {
            motorState = STOPPED;
            Serial.println("Hanh trinh: Da dong het");
            stepper.disableOutputs(); 
        }
        else
        {
            stepper.setSpeed(-400);
            stepper.runSpeed();
        }
    }
    else if (motorState == REVERSE)
    {
        if (digitalRead(SENSOR_OPEN) == LOW)
        {
            motorState = STOPPED;
            Serial.println("Hanh trinh: Da mo het");
            stepper.disableOutputs(); 
        }
        else
        {
            stepper.setSpeed(400);
            stepper.runSpeed();
        }
    }
}