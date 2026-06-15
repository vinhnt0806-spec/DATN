// #include <Arduino.h>
// #include <AccelStepper.h>

// // =========================
// // CẤU HÌNH STEP MOTOR
// // =========================
// #define IN1 33
// #define IN2 25
// #define IN3 26
// #define IN4 27

// #define ONE_TURN 8192

// AccelStepper stepper(AccelStepper::FULL4WIRE, IN1, IN3, IN2, IN4);

// // =========================
// // CẤU HÌNH UART2
// // =========================
// #define RXD2 16
// #define TXD2 17

// // 🌟 BIẾN LINH CANH ĐỂ KHÓA TRẠNG THÁI (0: Đang mở, 1: Đang đóng)
// int currentShadeState = 0; 

// void setup()
// {
//     Serial.begin(115200);
//     Serial2.begin(115200, SERIAL_8N1, RXD2, TXD2);

//     // Cấu hình tốc độ motor (Có thể tăng lên chút cho quay nhanh hơn)
//     stepper.setMaxSpeed(600);
//     stepper.setAcceleration(300);

//     Serial.println("ESP32 #2 READY - ĐÃ CÓ KHÓA CHỐNG BÃO LỆNH...");
// }

// void loop()
// {
//     if (Serial2.available() > 0)
//     {
//         // Đọc ngay 1 ký tự (char) từ bộ đệm UART
//         char cmd = Serial2.read(); 

//         Serial.print("Nhan: ");
//         Serial.println(cmd);

//         if (cmd == '1')
//         {
//             if (currentShadeState == 0)
//             {
//                 Serial.println("QUAY THUAN");

//                 stepper.move(5500);
//                 stepper.runToPosition();

//                 currentShadeState = 1;
//             }
//         }
//         else if (cmd == '0')
//         {
//             if (currentShadeState == 1)
//             {
//                 Serial.println("QUAY NGHICH");

//                 stepper.move(-5500);
//                 stepper.runToPosition();

//                 currentShadeState = 0;
//             }
//         }
//     }
// }

#include <Arduino.h>
#include <AccelStepper.h>

// ====================
// STEP MOTOR
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

    Serial2.begin(
        115200,
        SERIAL_8N1,
        RXD2,
        TXD2
    );

    pinMode(SENSOR_OPEN, INPUT_PULLUP);
    pinMode(SENSOR_CLOSE, INPUT_PULLUP);

    stepper.setMaxSpeed(500);

    Serial.println("ESP32 #2 READY");
}

void loop()
{
    // ====================
    // NHAN LENH UART
    // ====================
    while (Serial2.available())
    {
        char cmd = Serial2.read();

        Serial.print("Nhan UART: ");
        Serial.println(cmd);

        if (cmd == '1')
        {
            motorState = FORWARD;
            Serial.println("Dong mai che");
        }
        else if (cmd == '0')
        {
            motorState = REVERSE;
            Serial.println("Mo mai che");
        }
        else if (cmd == 's')
        {
            motorState = STOPPED;
            Serial.println("Dung");
        }
    }

    // ====================
    // DONG MAI CHE
    // ====================
    if (motorState == FORWARD)
    {
        if (digitalRead(SENSOR_CLOSE) == LOW)
        {
            motorState = STOPPED;
            Serial.println("Da dong het");
        }
        else
        {
            stepper.setSpeed(-400);
            stepper.runSpeed();
        }
    }

    // ====================
    // MO MAI CHE
    // ====================
    else if (motorState == REVERSE)
    {
        if (digitalRead(SENSOR_OPEN) == LOW)
        {
            motorState = STOPPED;
            Serial.println("Da mo het");
            
        }
        else
        {
            stepper.setSpeed(400);
            stepper.runSpeed();
        }
    }
}