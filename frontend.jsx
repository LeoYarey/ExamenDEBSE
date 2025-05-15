import { useState, useEffect } from "react";
import axios from "axios";

export default function SmartLightController() {
  const [systemStatus, setSystemStatus] = useState({
    lightOn: false,
    brightness: 0,
    lastUpdated: null,
    isLoading: true,
    error: null
  });

  // Configuración de colores para diferentes estados
  const statusColors = {
    on: 'bg-green-100 text-green-800',
    off: 'bg-gray-100 text-gray-800',
    error: 'bg-red-100 text-red-800'
  };

  // Obtener estado del sistema
  const fetchSystemStatus = async () => {
    try {
      const response = await axios.get("/api/system/status");
      setSystemStatus(prev => ({
        ...prev,
        lightOn: response.data.lightOn,
        brightness: response.data.brightness,
        lastUpdated: new Date().toLocaleTimeString(),
        isLoading: false,
        error: null
      }));
    } catch (err) {
      setSystemStatus(prev => ({
        ...prev,
        error: "Error al conectar con el servidor",
        isLoading: false
      }));
    }
  };

  // Alternar estado de la luz
  const toggleLight = async () => {
    try {
      setSystemStatus(prev => ({ ...prev, isLoading: true }));
      await axios.post("/api/system/toggle");
      await fetchSystemStatus();
    } catch (err) {
      setSystemStatus(prev => ({
        ...prev,
        error: "Error al cambiar el estado",
        isLoading: false
      }));
    }
  };

  // Actualizar estado periódicamente
  useEffect(() => {
    fetchSystemStatus();
    const interval = setInterval(fetchSystemStatus, 5000); // Actualizar cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Panel de Control de Iluminación</h1>
      
      <div className={`p-4 mb-4 rounded-md ${systemStatus.error ? statusColors.error : systemStatus.lightOn ? statusColors.on : statusColors.off}`}>
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-semibold">Estado Actual</h2>
            <p>{systemStatus.lightOn ? "Luz Encendida" : "Luz Apagada"}</p>
            {systemStatus.brightness > 0 && (
              <p>Nivel de brillo: {systemStatus.brightness} lx</p>
            )}
          </div>
          <span className="text-sm opacity-70">
            {systemStatus.lastUpdated || "No disponible"}
          </span>
        </div>
      </div>

      {systemStatus.error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {systemStatus.error}
        </div>
      )}

      <div className="flex flex-col space-y-4">
        <button
          onClick={toggleLight}
          disabled={systemStatus.isLoading}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            systemStatus.isLoading
              ? 'bg-gray-300 cursor-not-allowed'
              : systemStatus.lightOn
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {systemStatus.isLoading ? (
            'Procesando...'
          ) : systemStatus.lightOn ? (
            'Apagar Luz'
          ) : (
            'Encender Luz'
          )}
        </button>

        <button
          onClick={fetchSystemStatus}
          disabled={systemStatus.isLoading}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md font-medium text-gray-800"
        >
          Actualizar Estado
        </button>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <h3 className="font-medium text-gray-700">Información del Sistema</h3>
        <p className="text-sm text-gray-500 mt-1">
          El sistema se actualiza automáticamente cada 5 segundos.
        </p>
      </div>
    </div>
  );
}