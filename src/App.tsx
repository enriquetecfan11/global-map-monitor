import React, { useState } from 'react';

import { Header } from './components/Header';
import { GlobalMapSection } from './components/GlobalMap';
import { FeedsSection } from './components/Feeds';
import { MarketsSection, SectorHeatmap } from './components/Markets';
import { CustomMonitorsModal } from './components/CustomMonitors';

const App: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateMonitor = (keywords: string, location?: string) => {
    // Placeholder: sin lógica real aún
    console.log('Creating monitor:', { keywords, location });
  };

  return (
    <div className="h-full w-full flex flex-col bg-gray-900">
      <Header />

      <main className="flex-1 overflow-y-auto">
        <GlobalMapSection />
        <FeedsSection />
        <SectorHeatmap />
        <MarketsSection />
      </main>

      <CustomMonitorsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateMonitor}
      />
    </div>
  );
};

export default App;

