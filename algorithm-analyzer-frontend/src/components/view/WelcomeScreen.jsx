import React from 'react';
import '../../App.css';

export default function WelcomeScreen({ onStartTour }) {
  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        <div className="welcome-icon">
          <img src="/appIcon.png" alt="App Icon" style={{ width: '64px', height: '64px' }} />
        </div>
        <h1 className="welcome-title">Algorithm Analyzer</h1>
        <p className="welcome-subtitle">
          Zaawansowane narzędzie do analizy, porównywania i wizualizacji algorytmów optymalizacyjnych.
          Rozpocznij swoją analizę w 4 prostych krokach:
        </p>
        
        <button className="tour-btn primary" style={{ marginBottom: '2rem', fontSize: '1rem', padding: '0.75rem 1.5rem' }} onClick={onStartTour}>
          Rozpocznij Samouczek
        </button>
        
        <div className="welcome-steps">
          <div className="step-card">
            <span className="step-number">1</span>
            <div className="step-icon">🎯</div>
            <h3>Wybierz Problem</h3>
            <p>Wybierz zdefiniowany problem (np. TSP, Plecakowy) lub stwórz własną definicję.</p>
          </div>
          
          <div className="step-card">
            <span className="step-number">2</span>
            <div className="step-icon">⚙️</div>
            <h3>Skonfiguruj</h3>
            <p>Dostosuj parametry problemu, takie jak liczba miast, pojemność plecaka czy wagi.</p>
          </div>
          
          <div className="step-card">
            <span className="step-number">3</span>
            <div className="step-icon">🤖</div>
            <h3>Dodaj Algorytmy</h3>
            <p>Wybierz algorytmy do porównania i ustaw ich specyficzne parametry (np. temperatura, iteracje).</p>
          </div>
          
          <div className="step-card">
            <span className="step-number">4</span>
            <div className="step-icon">🚀</div>
            <h3>Analizuj</h3>
            <p>Uruchom symulację, obserwuj postęp w czasie rzeczywistym i analizuj wykresy wyników.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
