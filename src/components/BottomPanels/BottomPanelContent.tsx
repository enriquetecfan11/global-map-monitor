import React from 'react';

interface BottomPanelContentProps {
  panelId: string;
  label: string;
}

const getPlaceholderContent = (panelId: string, label: string) => {
  const placeholders: Record<string, string> = {
    world: 'Datos globales de monitoreo mundial. Información de nodos, conexiones y estado general del sistema.',
    tech: 'Métricas técnicas y estadísticas de rendimiento. Latencia, throughput y estado de infraestructura.',
    finance: 'Indicadores financieros y métricas económicas. Tendencias de mercado y análisis de datos.',
    alerts: 'Alertas y notificaciones del sistema. Eventos importantes y acciones requeridas.',
    markets: 'Datos de mercados y análisis de tendencias. Información en tiempo real de diferentes sectores.',
  };

  return placeholders[panelId.toLowerCase()] || `Contenido placeholder para ${label}`;
};

export const BottomPanelContent: React.FC<BottomPanelContentProps> = ({
  panelId,
  label,
}) => {
  const content = getPlaceholderContent(panelId, label);

  return (
    <div
      className="p-4"
      role="tabpanel"
      aria-labelledby={`tab-${panelId}`}
    >
      <div className="max-w-4xl">
        <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">
          {label}
        </h3>
        <div className="space-y-3">
          <p className="text-sm text-gray-400 leading-relaxed">{content}</p>
          <div className="mt-4 p-3 bg-gray-800/50 border border-gray-700 rounded-md">
            <p className="text-xs text-gray-500 italic">
              Este es un placeholder. Los datos reales se mostrarán aquí cuando esté disponible la integración con la API.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

