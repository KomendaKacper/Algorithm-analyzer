import React, { useState } from 'react';
import '../App.css';

/**
 * Nowy, reużywalny komponent do tworzenia zwijanych sekcji.
 * Zarządza swoim własnym stanem otwarcia/zamknięcia.
 */
export default function CollapsiblePanel({ title, children, startOpen = true }) {
  const [isOpen, setIsOpen] = useState(startOpen);

  return (
    <div className="panel collapsible-panel">
      {/* Nagłówek jest teraz przyciskiem */}
      <button className="panel-header-toggle" onClick={() => setIsOpen(!isOpen)}>
        <span className="panel-title">{title}</span>
        {/* Ikona strzałki z animacją obrotu */}
        <svg 
          className={`collapse-icon ${isOpen ? 'open' : ''}`} 
          xmlns="http://www.w3.org/2000/svg" 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
      
      {/* Kontener na treść z animacją zwijania */}
      <div className={`panel-collapsible-content ${isOpen ? 'open' : ''}`}>
        <div className="panel-content-inner">
          {children}
        </div>
      </div>
    </div>
  );
}
