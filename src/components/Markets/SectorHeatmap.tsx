/**
 * Componente Sector Heatmap basado en noticias.
 * Muestra scores narrativos por sector basados en análisis de noticias.
 * Basado en docs/features/NewsDrivenSectorHeatmap.md
 */

import React, { useState } from 'react';
import { useSectorStore } from '../../stores/sectorStore';
import type { Sector } from '../../types/sector.types';
import { SectorDetailsModal } from './SectorDetailsModal';

/**
 * Sectores en orden de visualización.
 */
const ALL_SECTORS: Sector[] = [
  'Technology',
  'Finance',
  'Healthcare',
  'Energy',
  'Consumer',
  'Industrial',
  'Materials',
  'Utilities',
];

/**
 * Obtiene el color del tile basado en el score narrativo.
 * Rojo = narrativa negativa, Verde = narrativa positiva.
 * 
 * Umbrales:
 * - Bajo: hasta +1 (amarillo claro)
 * - Medio: +2 a +4 (amarillo oscuro)
 * - Alto: +5 o más (verde, pero +6 es más alto)
 * 
 * Para negativos (simétrico):
 * - Bajo: hasta -1 (amarillo claro)
 * - Medio: -2 a -4 (amarillo oscuro)
 * - Alto: -5 o menos (rojo)
 */
const getHeatmapColor = (score: number): string => {
  // Score negativo alto (<= -5) → Rojo
  if (score <= -5) return 'bg-red-600';
  // Score negativo medio (-4 a -2) → Amarillo oscuro
  if (score <= -2) return 'bg-yellow-500';
  // Score bajo/neutro (-1 a +1) → Amarillo claro
  if (score <= 1) return 'bg-yellow-300';
  // Score positivo medio (+2 a +4) → Amarillo oscuro
  if (score <= 4) return 'bg-yellow-500';
  // Score positivo alto (+5 o más, +6 es más alto) → Verde
  return 'bg-green-400';
};

/**
 * Obtiene el color del texto basado en el color de fondo.
 */
const getTextColor = (score: number): string => {
  // Para colores oscuros (rojo, amarillo oscuro), texto claro
  if (score <= -2 || (score >= 2 && score <= 4)) return 'text-gray-100';
  // Para colores claros (amarillo claro, verde), texto oscuro
  return 'text-gray-900';
};

/**
 * Formatea el score para mostrar (redondeado, con signo).
 */
const formatScore = (score: number): string => {
  const rounded = Math.round(score);
  return rounded > 0 ? `+${rounded}` : `${rounded}`;
};

export const SectorHeatmap: React.FC = () => {
  const { scores, loading } = useSectorStore();
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSectorClick = (sector: Sector) => {
    setSelectedSector(sector);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSector(null);
  };

  return (
    <>
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-300 mb-4">Sector Narrative Impact</h3>
        {loading ? (
          <div className="text-sm text-gray-400 py-4 text-center">Calculating scores...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {ALL_SECTORS.map((sector) => {
              const score = scores[sector];
              const scoreValue = score?.score ?? 0;
              
              return (
                <button
                  key={sector}
                  onClick={() => handleSectorClick(sector)}
                  className={`${getHeatmapColor(scoreValue)} ${getTextColor(scoreValue)} rounded-lg p-4 text-center transition-transform hover:scale-105 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  aria-label={`${sector} sector: ${formatScore(scoreValue)}`}
                >
                  <div className="font-medium text-sm mb-1">{sector}</div>
                  <div className="text-xs opacity-90">{formatScore(scoreValue)}</div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectedSector && scores[selectedSector] && (
        <SectorDetailsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          sector={selectedSector}
          score={scores[selectedSector]}
        />
      )}
    </>
  );
};

