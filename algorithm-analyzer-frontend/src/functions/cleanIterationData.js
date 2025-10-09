// utils/cleanData.js
export const cleanIterationData = (data) => {
  const toNum = (v) => {
    const num = Number(v);
    return isFinite(num) && num > 1e-6 && num < 1e10 ? num : null;
  };

  return data.map(d => ({
    ...d,
    bestDistance: toNum(d.bestDistance),
    averageDistance: toNum(d.averageDistance),
    worstDistance: toNum(d.worstDistance),
    executionDurationMs: toNum(d.executionDurationMs),
    // dodatkowe metryki np. gap, improvement, efficiency
    gap: toNum(d.gap),
    improvementRate: toNum(d.improvementRate),
    efficiency: toNum(d.efficiency),
    convergence: toNum(d.convergence),
  }));
};
