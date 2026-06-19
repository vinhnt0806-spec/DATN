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
            // 🌟 Tắt điện động cơ khi nhận lệnh DỪNG khẩn cấp
            stepper.disableOutputs(); 
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
            // 🌟 Tắt điện động cơ khi đã đóng xong
            stepper.disableOutputs(); 
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
            // 🌟 Tắt điện động cơ khi đã mở xong
            stepper.disableOutputs(); 
        }
        else
        {
            stepper.setSpeed(400);
            stepper.runSpeed();
        }
    }
}