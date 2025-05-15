#include <Wire.h>  // Para posible comunicación I2C con sensores adicionales

// Configuración de pines
const int LDR_PIN = A0;      // Pin analógico para el sensor LDR
const int RELAY_PIN = 8;     // Pin digital para controlar el relé/LED
const int STATUS_LED = 13;   // LED interno para estado del sistema

// Umbrales configurables
const int DARK_THRESHOLD = 300;  // Ajustar según necesidades (valor inferior = más sensible)
const int UPDATE_INTERVAL = 2000; // Intervalo de actualización en ms

// Variables del sistema
bool autoMode = true;        // Modo automático activado por defecto
bool lightState = false;     // Estado actual de la luz
int lightLevel = 0;          // Valor actual del sensor

void setup() {
  // Inicialización de pines
  pinMode(RELAY_PIN, OUTPUT);
  pinMode(STATUS_LED, OUTPUT);
  Serial.begin(115200);      // Comunicación serial a alta velocidad
  
  // Secuencia de inicio
  digitalWrite(STATUS_LED, HIGH);
  delay(500);
  digitalWrite(STATUS_LED, LOW);
  
  Serial.println("Sistema de Iluminacion Inteligente Iniciado");
}

void loop() {
  // 1. Lectura del sensor
  lightLevel = analogRead(LDR_PIN);
  
  // 2. Lógica de control automático
  if(autoMode) {
    bool newState = (lightLevel < DARK_THRESHOLD);
    
    if(newState != lightState) {
      lightState = newState;
      digitalWrite(RELAY_PIN, lightState ? HIGH : LOW);
      digitalWrite(STATUS_LED, lightState ? HIGH : LOW);
      sendStatus();
    }
  }
  
  // 3. Comunicación serial (para API)
  if(Serial.available() > 0) {
    handleSerialCommand();
  }
  
  delay(UPDATE_INTERVAL);
}

void handleSerialCommand() {
  String command = Serial.readStringUntil('\n');
  command.trim();
  
  if(command == "GET_STATUS") {
    sendStatus();
  }
  else if(command == "TOGGLE_AUTO") {
    autoMode = !autoMode;
    sendStatus();
  }
  else if(command == "TOGGLE_LIGHT") {
    lightState = !lightState;
    digitalWrite(RELAY_PIN, lightState ? HIGH : LOW);
    digitalWrite(STATUS_LED, lightState ? HIGH : LOW);
    sendStatus();
  }
}

void sendStatus() {
  Serial.print("STATUS:");
  Serial.print("AUTO="); Serial.print(autoMode ? "ON" : "OFF");
  Serial.print(",LIGHT="); Serial.print(lightState ? "ON" : "OFF");
  Serial.print(",LDR="); Serial.print(lightLevel);
  Serial.print(",THRESHOLD="); Serial.println(DARK_THRESHOLD);
}
