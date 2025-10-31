import React, { useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import '../../../App.css'; 
import { CHART_COLORS_PALETTE } from './chartColors'; 

// --- Funkcje pomocnicze (bez zmian) ---
const getSolutionId = (solution, problemName) => {
  if (!solution || solution.length === 0) return "empty_solution";
  if (problemName === "Knapsack Problem") {
    return [...solution].sort().join(', ');
  }
  return solution.join(' → ');
};

export function SolutionGraphPanel({ results }) {

  const { graphData, algorithmLegend, minMaxScores, isMaximization } = useMemo(() => {
    const MAX_SAMPLED_KEYFRAMES = 200; 
    const nodes = new Map();
    const links = new Map();
    const algorithmLegend = []; 
    
    if (!results || results.length === 0) {
      return { 
        graphData: { nodes: [], links: [] }, 
        algorithmLegend: [], 
        minMaxScores: { min: 0, max: 0 }, 
        isMaximization: true 
      };
    }

    const problemName = results[0].problemName;
    const isMaximization = problemName !== "Traveling Salesman Problem (TSP)";
    
    let globalBestScore = isMaximization ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
    let overallMinScore = Number.POSITIVE_INFINITY;
    let overallMaxScore = Number.NEGATIVE_INFINITY;

    results.forEach((result, algoIndex) => {
      if (!result.success || !result.iterationResults || result.iterationResults.length === 0) return;

      const algoColor = CHART_COLORS_PALETTE[algoIndex % CHART_COLORS_PALETTE.length].line;
      const algoName = result.algorithmName;
      
      algorithmLegend.push({ name: algoName, color: algoColor });

      const totalIterations = result.iterationResults.length;
      const sampleRate = Math.max(1, Math.floor(totalIterations / MAX_SAMPLED_KEYFRAMES));
      
      let lastKeyframeId = null; 
      let lastBestScoreForAlgo = isMaximization ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;

      if (isMaximization ? result.bestScore > globalBestScore : result.bestScore < globalBestScore) {
        globalBestScore = result.bestScore;
      }

      result.iterationResults.forEach((iterResult, iterIndex) => {
        const bestScore = iterResult.bestScore;
        const currentSolutionScore = iterResult.currentScore ?? iterResult.bestScore;

        if (currentSolutionScore < overallMinScore) overallMinScore = currentSolutionScore;
        if (currentSolutionScore > overallMaxScore) overallMaxScore = currentSolutionScore;

        const isFirst = (iterIndex === 0);
        const isLast = (iterIndex === totalIterations - 1);
        const isNewBestForAlgo = (isMaximization ? bestScore > lastBestScoreForAlgo : bestScore < lastBestScoreForAlgo);
        const isSampled = (iterIndex % sampleRate === 0);

        if (isNewBestForAlgo) {
          lastBestScoreForAlgo = bestScore;
        }

        if (!isFirst && !isLast && !isNewBestForAlgo && !isSampled) {
          return; 
        }
        
        const solution = iterResult.currentSolution;
        const score = currentSolutionScore; 

        if (!solution || score == null || !Number.isFinite(score)) return; 

        const solutionId = getSolutionId(solution, problemName);

        if (!nodes.has(solutionId)) {
          nodes.set(solutionId, {
            id: solutionId,
            score: score,
            isGlobalBest: false,
            firstSeen: iterResult.iteration,
            currentSolution: solution, 
            visitCount: 1,
            color: algoColor, 
            visitedByAlgos: new Set([algoName]) 
          });
        } else {
          const node = nodes.get(solutionId);
          node.visitCount += 1; 
          node.visitedByAlgos.add(algoName); 
          if (isMaximization ? score > node.score : score < node.score) {
            node.score = score;
            node.currentSolution = solution;
          }
        }

        if (lastKeyframeId && lastKeyframeId !== solutionId) {
          const linkId = `${algoName}__${lastKeyframeId}__${solutionId}`;
          if (!links.has(linkId)) {
            links.set(linkId, { 
              source: lastKeyframeId, 
              target: solutionId, 
              color: algoColor, 
              algorithmName: algoName
            });
          }
        }
        lastKeyframeId = solutionId; 
      });
    });

    nodes.forEach(node => {
      if (Math.abs(node.score - globalBestScore) < 1e-9) {
        node.isGlobalBest = true;
      }
    });

    return { 
      graphData: { nodes: Array.from(nodes.values()), links: Array.from(links.values()) },
      algorithmLegend,
      minMaxScores: { min: overallMinScore, max: overallMaxScore },
      isMaximization
    };
  }, [results]);

  if (!results || results.length === 0 || !results[0].iterationResults?.[0]?.currentSolution) {
    return (
      <div className="panel" style={{ padding: '20px', textAlign: 'center' }}>
        <h4>Brak Danych do Grafu</h4>
        <p className="info-text">Nie można wygenerować grafu trajektorii. Upewnij się, że algorytm zwraca pole 'currentSolution' w każdej iteracji.</p>
      </div>
    );
  }
  
  return (
    <div 
      className="result-buttons-wrapper" 
      style={{ height: '600px', padding: '16px', position: 'relative' }}
    >
      <h3 style={{ textAlign: 'center', marginBottom: '16px' }}>🛰️ Graf Trajektorii Przeszukiwania (Próbkowany)</h3>
      
      <div className="graph-legend">
        <h4>Legenda Algorytmów:</h4>
        {algorithmLegend.map((entry, index) => (
          <div key={index} className="legend-item">
            <span className="legend-color-box" style={{ backgroundColor: entry.color }}></span>
            {entry.name}
          </div>
        ))}
        <div className="legend-item">
          <span className="legend-border-box" style={{ borderColor: '#FFD700' }}></span>
          Globalnie najlepsze rozwiązanie
        </div>
      </div>
      
      <ForceGraph2D
        graphData={graphData}
        
        // --- USUNIĘTE: Niepotrzebny prop, bo używamy `nodeCanvasObject` ---
        // nodeVal={...} 
        
        // Tooltip dla węzła
        nodeLabel={node => `
          <div class="graph-tooltip">
            <div><b>Rozwiązanie:</b> ${node.id}</div>
            <div><b>Wynik:</b> ${node.score.toFixed(2)}</div>
            <div><b>Odwiedziny (próbki):</b> ${node.visitCount}</div>
          	<div><b>Pierwsza iteracja:</b> ${node.firstSeen}</div>
            <div><b>Odwiedzone przez:</b> ${Array.from(node.visitedByAlgos).join(', ')}</div>
          </div>
        `}
        
        // KOLOR KRAWĘDZI (wg algorytmu)
        linkColor={link => link.color}
        linkWidth={1}
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        linkCurvature={0.15}
        
        // Tooltip dla krawędzi
        linkLabel={link => `
        <div class="graph-tooltip">
          <div><b>Algorytm:</b> <span style="color: ${link.color}">${link.algorithmName}</span></div>
          <div><b>Przejście (próbkowane):</b></div>
          <div>${link.source.id}</div>
          <div>&nbsp;&nbsp;<b>→</b> ${link.target.id}</div>
        </div>
      `}
        
        backgroundColor="var(--color-surface)"

        // --- POPRAWIONY RENDERER DLA WĘZŁÓW ---
        nodeCanvasObject={(node, ctx, globalScale) => {
          // --- TUTAJ JEST POPRAWKA: ---
          // Obliczamy promień 'r' ręcznie, na podstawie visitCount.
          // `node.val` nie jest ustawiany, gdy używamy `nodeCanvasObject`.
          const r = node.isGlobalBest 
            ? 6 // Stały, większy rozmiar dla najlepszego
            : (2 + Math.log1p(node.visitCount) * 1.5); // Rozmiar na podstawie odwiedzin
          
          ctx.beginPath();
          ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
          ctx.fillStyle = node.color; // Kolor algorytmu
          ctx.fill();
          
          if (node.isGlobalBest) {
            ctx.strokeStyle = '#FFD700'; // Złote obramowanie dla najlepszego globalnie
            ctx.lineWidth = 2 / globalScale;
            ctx.stroke();
          }
        }}
        
        nodePointerAreaPaint={(node, color, ctx) => {
          // Upewniamy się, że obszar klikania/hovera odpowiada naszemu ręcznie obliczonemu promieniowi
          const r = node.isGlobalBest 
            ? 6 
            : (2 + Math.log1p(node.visitCount) * 1.5);
          
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
          ctx.fill();
        }}
      />
    </div>
  );
}