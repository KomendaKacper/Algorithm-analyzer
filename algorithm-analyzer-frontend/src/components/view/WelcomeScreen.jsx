import React from 'react';
import '../../App.css';

export default function WelcomeScreen() {
  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        <div className="welcome-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
          </svg>
        </div>
        <h1 className="welcome-title">Algorithm Analyzer</h1>
        <p className="welcome-subtitle">
          Zaawansowane narzędzie do analizy, porównywania i wizualizacji algorytmów optymalizacyjnych.
          Rozpocznij swoją analizę w 4 prostych krokach:
        </p>
        
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
