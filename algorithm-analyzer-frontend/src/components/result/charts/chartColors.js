// Definiujemy paletę kolorów pasującą do motywu "Gorący Zachód Słońca"
// Format: { id, start (kolor gradientu), stop (kolor gradientu), line (płaski kolor dla linii/punktów) }

export const CHART_COLORS_PALETTE = [
  // 1. Motyw główny (Gorący Zachód Słońca)
  {
    id: 'grad-0',
    start: '#fb923c', // Jasny pomarańcz
    stop: '#f97316',  // Ciemny pomarańcz
    line: '#f97316'
  },
  // 2. Kolor kontrastowy (Niebieski)
  {
    id: 'grad-1',
    start: '#60a5fa', // Jasny niebieski
    stop: '#3b82f6',  // Ciemny niebieski
    line: '#3b82f6'
  },
  // 3. Kolor uzupełniający (Zielony)
  {
    id: 'grad-2',
    start: '#34d399', // Jasny zielony
    stop: '#10b981',  // Ciemny zielony
    line: '#10b981'
  },
  // 4. Kolor akcentujący (Fiolet)
  {
    id: 'grad-3',
    start: '#c4b5fd', // Jasny fiolet
    stop: '#8b5cf6',  // Ciemny fiolet
    line: '#8b5cf6'
  },
  // 5. Kolor neutralny (Szary)
  {
    id: 'grad-4',
    start: '#9ca3af', // Jasny szary
    stop: '#6b7280',  // Ciemny szary
    line: '#6b7280'
  }
];

