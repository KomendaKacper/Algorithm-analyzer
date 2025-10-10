export const computeMetrics = (iterationResults) => {
  if (!Array.isArray(iterationResults)) return [];

  return iterationResults.map((d, i, arr) => {
    const prev = arr[i - 1];
    const best = Number(d.bestDistance);
    const avg = Number(d.averageDistance);
    const execTime = Number(d.executionDurationMs);

    // różnica średniego i najlepszego
    const gap =
      isFinite(avg) && isFinite(best)
        ? avg - best
        : 0; // brak danych = 0

    return {
      ...d,
      gap
    };
  });
};
