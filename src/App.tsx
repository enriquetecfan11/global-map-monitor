import React, { useState } from 'react';
import { Header } from './components/Header';
import { GlobalMapSection } from './components/GlobalMap';
import { FeedsSection } from './components/Feeds';
import { MarketsSection } from './components/Markets';
import { AnalyticalModulesSection } from './components/AnalyticalModules';
import { CustomMonitorsModal } from './components/CustomMonitors';

const App: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateMonitor = (keywords: string, location?: string) => {
    // Placeholder: sin lógica real aún
    console.log('Creating monitor:', { keywords, location });
  };

  return (
    <div className="h-full w-full flex flex-col bg-gray-900">
      {/* Header fijo en la parte superior */}
      <Header />
      
      {/* Contenedor scrollable con todas las secciones */}
      <main className="flex-1 overflow-y-auto">
        <GlobalMapSection />
        <FeedsSection />
        <MarketsSection />
        <AnalyticalModulesSection />
      </main>

      {/* Modal de Custom Monitors (no visible por defecto) */}
      <CustomMonitorsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateMonitor}
      />
    </div>
  );
};

export default App;

