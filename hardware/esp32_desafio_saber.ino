#include <Arduino.h>

// ESP32 + dois botoes ligados entre o GPIO e GND.
// O INPUT_PULLUP deixa o pino HIGH em repouso e LOW quando pressionado.
const uint8_t BUTTON_PLAYER_1 = 18;
const uint8_t BUTTON_PLAYER_2 = 19;

const unsigned long DEBOUNCE_MS = 180;
unsigned long lastPressPlayer1 = 0;
unsigned long lastPressPlayer2 = 0;

void setup() {
  pinMode(BUTTON_PLAYER_1, INPUT_PULLUP);
  pinMode(BUTTON_PLAYER_2, INPUT_PULLUP);
  Serial.begin(115200);
  delay(500);
  Serial.println("ESP32_READY");
}

void loop() {
  const unsigned long now = millis();

  if (digitalRead(BUTTON_PLAYER_1) == LOW && now - lastPressPlayer1 > DEBOUNCE_MS) {
    Serial.println("BTN:1");
    lastPressPlayer1 = now;
  }

  if (digitalRead(BUTTON_PLAYER_2) == LOW && now - lastPressPlayer2 > DEBOUNCE_MS) {
    Serial.println("BTN:2");
    lastPressPlayer2 = now;
  }

  delay(5);
}
