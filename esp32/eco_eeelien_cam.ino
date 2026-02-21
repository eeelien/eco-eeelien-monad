/*
 * eco eeelien — ESP32-CAM Firmware
 * Detecta botellas y registra el reciclaje en Monad Testnet
 *
 * Hardware: ESP32-CAM (AI Thinker)
 * Funciones:
 *  - Captura imagen cuando el sensor infrarrojo detecta objeto
 *  - Clasifica botella (plástico / aluminio) con modelo TFLite o por color/tamaño
 *  - Llama al backend API que ejecuta registerBottle() en el contrato
 *  - Muestra confirmación con LED RGB y pantalla OLED (opcional)
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// === CONFIG ===
const char* WIFI_SSID     = "TU_WIFI";
const char* WIFI_PASS     = "TU_PASSWORD";

// Backend API (puede ser un servidor tuyo o directo a la blockchain con cast)
const char* BACKEND_URL   = "https://tu-backend.eco-eeelien.com/register";

// Contrato en Monad Testnet (para display)
const char* REGISTRY_ADDR = "0x7fFCcdD4b9Ae0a3cfCdA86c954AE8a1816Ec74C3";

// Pins
const int IR_SENSOR_PIN   = 13;   // Sensor infrarrojo de entrada
const int LED_OK_PIN      = 12;   // LED verde = registro exitoso
const int LED_ERR_PIN     = 14;   // LED rojo = error
const int BUZZER_PIN      = 15;   // Buzzer feedback

// === ESTADO ===
enum BottleType { PLASTIC = 0, ALUMINUM = 1 };

String currentUserAddress = "";  // Se setea por QR o NFC al inicio

// ============================================================

void setup() {
  Serial.begin(115200);
  pinMode(IR_SENSOR_PIN, INPUT);
  pinMode(LED_OK_PIN, OUTPUT);
  pinMode(LED_ERR_PIN, OUTPUT);

  connectWiFi();

  Serial.println("eco eeelien ESP32-CAM listo ♻️");
  Serial.println("Esperando botella...");
}

void loop() {
  // Detectar cuando algo entra al contenedor
  if (digitalRead(IR_SENSOR_PIN) == LOW) {
    delay(500);  // Esperar que se estabilice

    Serial.println("🔍 Objeto detectado — analizando...");

    // En producción: capturar imagen y clasificar con ML
    // Para demo: clasificar por peso/material (sensor adicional)
    BottleType type = detectBottleType();

    // Dirección del usuario (en demo: hardcodeada o desde QR scan)
    String userAddr = getUserAddress();

    if (userAddr.length() > 0) {
      bool success = registerBottleOnChain(userAddr, type);

      if (success) {
        feedbackSuccess(type);
      } else {
        feedbackError();
      }
    } else {
      Serial.println("⚠️  No hay usuario conectado");
      feedbackError();
    }

    delay(3000);  // Evitar doble registro
  }

  delay(100);
}

// ============================================================

void connectWiFi() {
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.print("Conectando a WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✅ WiFi conectado: " + WiFi.localIP().toString());
}

BottleType detectBottleType() {
  /*
   * TODO: Integrar modelo TFLite o sensor de material
   * Opciones:
   *   - Sensor de color TCS3200 → plástico opaco vs aluminio reflectante
   *   - Sensor de peso HX711 → aluminio más liviano
   *   - Clasificador de imagen con ESP32-CAM + Edge Impulse
   *
   * Para el demo del hackathon: botón físico o clasificación simple por color
   */
  // Demo: alterna entre plástico y aluminio para mostrar ambos flujos
  static int counter = 0;
  counter++;
  return (counter % 3 == 0) ? ALUMINUM : PLASTIC;
}

String getUserAddress() {
  /*
   * TODO: Leer dirección del usuario desde:
   *   - QR code scaneado con la cámara ESP32
   *   - Tag NFC (módulo PN532)
   *   - App móvil → Bluetooth/WiFi → ESP32
   *
   * Para demo: address hardcodeada
   */
  return "0x381AF5bDC1BCBA9a24Af7feba5390D99C7cf080f";
}

bool registerBottleOnChain(String userAddress, BottleType type) {
  HTTPClient http;
  http.begin(BACKEND_URL);
  http.addHeader("Content-Type", "application/json");

  // Crear payload
  StaticJsonDocument<256> doc;
  doc["userAddress"] = userAddress;
  doc["bottleType"]  = (int)type;
  doc["chainId"]     = 10143;

  String body;
  serializeJson(doc, body);

  Serial.println("📡 Enviando a backend: " + body);

  int httpCode = http.POST(body);
  String response = http.getString();
  http.end();

  Serial.println("📥 Respuesta HTTP: " + String(httpCode));
  Serial.println("📥 Body: " + response);

  if (httpCode == 200) {
    StaticJsonDocument<512> respDoc;
    deserializeJson(respDoc, response);

    const char* txHash = respDoc["txHash"];
    Serial.println("✅ Tx on-chain: " + String(txHash));
    Serial.println("🔎 https://monad-testnet.socialscan.io/tx/" + String(txHash));
    return true;
  }

  return false;
}

void feedbackSuccess(BottleType type) {
  const char* label = (type == PLASTIC) ? "Plástico" : "Aluminio";
  int eco = (type == PLASTIC) ? 5 : 10;

  Serial.printf("♻️  ¡%s registrado! +%d ECO tokens\n", label, eco);

  // LED verde 3 veces
  for (int i = 0; i < 3; i++) {
    digitalWrite(LED_OK_PIN, HIGH);
    delay(200);
    digitalWrite(LED_OK_PIN, LOW);
    delay(200);
  }
}

void feedbackError() {
  Serial.println("❌ Error al registrar");

  // LED rojo
  digitalWrite(LED_ERR_PIN, HIGH);
  delay(1000);
  digitalWrite(LED_ERR_PIN, LOW);
}
