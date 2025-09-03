import { useMemo } from 'react';

export const useGraphTransform = (springBootGraph) => {
  return useMemo(() => {
    if (!springBootGraph) return null;

    // Jeśli to jest już szczegółowy graf z nodes i edges
    if (springBootGraph.nodes && springBootGraph.edges) {
      const transformedGraph = {
        id: springBootGraph.id,
        name: springBootGraph.name,
        directed: springBootGraph.directed,
        nodes: springBootGraph.nodes.map(node => node.nodeId),
        edges: {}
      };

      // Przekształć edges z listy do obiektu
      springBootGraph.edges.forEach(edge => {
        const sourceKey = edge.from.toString();
        if (!transformedGraph.edges[sourceKey]) {
          transformedGraph.edges[sourceKey] = [];
        }
        transformedGraph.edges[sourceKey].push({
          target: edge.to,
          weight: edge.weight
        });
      });

      return transformedGraph;
    }

    // Jeśli to jest podsumowanie grafu (GraphSummary), zwróć null - trzeba załadować szczegóły
    return null;
  }, [springBootGraph]);
};