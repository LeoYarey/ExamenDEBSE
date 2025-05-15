package main

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"
)

// Estructura para el estado del sistema
type SystemState struct {
	LightActive   bool      `json:"light_active"`
	LastModified time.Time `json:"last_modified"`
	Brightness   int       `json:"brightness,omitempty"`
}

var (
	currentState SystemState
	stateMutex   sync.Mutex
)

// Controlador para obtener el estado completo
func GetSystemStatus(w http.ResponseWriter, r *http.Request) {
	stateMutex.Lock()
	defer stateMutex.Unlock()

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(currentState)
}

// Controlador para modificar el estado
func UpdateLightState(w http.ResponseWriter, r *http.Request) {
	stateMutex.Lock()
	defer stateMutex.Unlock()

	currentState.LightActive = !currentState.LightActive
	currentState.LastModified = time.Now()

	// Simular lectura de sensor (valor aleatorio para demostración)
	currentState.Brightness = 300 + time.Now().Second()*5

	response := map[string]interface{}{
		"operation": "state_update",
		"success":   true,
		"new_state": currentState.LightActive,
		"timestamp": currentState.LastModified.Format(time.RFC3339),
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusAccepted)
	json.NewEncoder(w).Encode(response)
}

func InitializeRoutes() *http.ServeMux {
	router := http.NewServeMux()
	
	// Endpoints de la API
	router.HandleFunc("/api/v1/light/status", GetSystemStatus)
	router.HandleFunc("/api/v1/light/toggle", UpdateLightState)
	
	// Endpoint de salud del sistema
	router.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("System operational"))
	})

	return router
}

func main() {
	// Configuración inicial
	currentState = SystemState{
		LightActive:   false,
		LastModified: time.Now(),
		Brightness:   0,
	}

	server := &http.Server{
		Addr:         ":8080",
		Handler:      InitializeRoutes(),
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 15 * time.Second,
	}

	log.Println("Servicio de control lumínico iniciado en el puerto 8080")
	log.Fatal(server.ListenAndServe())
}