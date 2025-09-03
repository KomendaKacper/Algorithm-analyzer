import { useMemo } from 'react';

export const useGraphData = (graphDetails) => {
  return useMemo(() => {
    if (!graphDetails) return null;

    // Transformuj dane z Spring Boot do formatu oczekiwanego przez GraphViewer
    const transformedGraph = {
      id: graphDetails.id,
      name: graphDetails.name,
      directed: graphDetails.directed,
      nodes: graphDetails.nodes ? graphDetails.nodes.map(node => node.nodeId) : [],
      edges: {}
    };

    // Przekształć edges z listy do obiektu źródło -> tablica docelowych
    if (graphDetails.edges) {
      graphDetails.edges.forEach(edge => {
        const sourceKey = edge.from.toString();
        if (!transformedGraph.edges[sourceKey]) {
          transformedGraph.edges[sourceKey] = [];
        }
        transformedGraph.edges[sourceKey].push({
          target: edge.to,
          weight: edge.weight
        });
      });
    }

    return transformedGraph;
  }, [graphDetails]);
};