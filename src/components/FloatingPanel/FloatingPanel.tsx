import React, { useState, useRef, useEffect } from 'react';
import { useUIStore } from '../../stores/uiStore';

interface FloatingPanelProps {
  id: string;
  title?: string;
  initialPosition: { x: number; y: number };
  children: React.ReactNode;
  className?: string;
  headerContent?: React.ReactNode;
}

export const FloatingPanel: React.FC<FloatingPanelProps> = ({
  id,
  title,
  initialPosition,
  children,
  className = '',
  headerContent,
}) => {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [zIndex, setZIndex] = useState(1000);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hasUserMoved, setHasUserMoved] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const { incrementZIndex } = useUIStore();

  // Actualizar posición si initialPosition cambia y el usuario no ha movido el panel
  useEffect(() => {
    if (!hasUserMoved) {
      setPosition(initialPosition);
    }
  }, [initialPosition, hasUserMoved]);

  // Traer al frente al hacer focus/click
  const handleFocus = () => {
    const newZIndex = incrementZIndex();
    setZIndex(newZIndex);
  };

  // Drag handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (headerRef.current && headerRef.current.contains(e.target as Node)) {
      e.preventDefault();
      e.stopPropagation(); // Prevenir interacción con el mapa
      setIsDragging(true);
      const rect = panelRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
      // Traer al frente al iniciar drag
      handleFocus();
      // Prevenir selección de texto durante drag
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        
        // Limitar dentro de los bounds del viewport
        const maxX = window.innerWidth - (panelRef.current?.offsetWidth || 0);
        const maxY = window.innerHeight - (panelRef.current?.offsetHeight || 0);
        
        setPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY)),
        });
        setHasUserMoved(true);
      }
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);

    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, dragOffset]);

  return (
    <div
      ref={panelRef}
      id={id}
      className={`absolute bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-md shadow-lg pointer-events-auto ${className}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex,
        userSelect: isDragging ? 'none' : 'auto',
      }}
      role="dialog"
      aria-label={title || 'Panel flotante'}
      onPointerDown={(e) => {
        e.stopPropagation(); // Prevenir interacción con el mapa
        handleFocus();
      }}
      onClick={(e) => {
        e.stopPropagation(); // Prevenir interacción con el mapa
        handleFocus();
      }}
    >
      {/* Header arrastrable */}
      {(title || headerContent) && (
        <div
          ref={headerRef}
          className="px-3 py-1.5 border-b border-gray-700 cursor-move flex items-center justify-between"
          onPointerDown={handlePointerDown}
          aria-label="Arrastrar panel"
          role="button"
          tabIndex={0}
        >
          {title && (
            <span className="text-xs font-medium text-gray-300 uppercase tracking-wide">
              {title}
            </span>
          )}
          {headerContent}
        </div>
      )}

      {/* Contenido */}
      <div className={title || headerContent ? '' : 'p-3'}>
        {children}
      </div>
    </div>
  );
};

