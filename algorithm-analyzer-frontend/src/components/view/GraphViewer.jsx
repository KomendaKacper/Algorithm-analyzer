import ForceGraph2D from "react-force-graph-2d";
import { useCallback, useState, useMemo, useRef } from "react";

export default function GraphViewer({
  graph,
  nodeColor = "#1f77b4",
  nodeHighlightColor = "#ff7f0e",
  nodeStrokeColor = "#333",
  linkColor = "#999",
  linkHighlightColor = "#ff7f0e",
  highlightPath = [],
  pheromoneData = null,
  showPheromones = false
}) {
  if (!graph) return <p>Ładowanie grafu...</p>;

  const { nodes, links, nodeMap } = useMemo(() => {
    const nodeMap = new Map();
    const nodes =
      graph.nodes?.map((id) => {
        const node = {
          id: id.toString(),
          graphName: graph.name,
          directed: graph.directed,
          neighbors: new Set(),
          links: [],
        };
        nodeMap.set(node.id, node);
        return node;
      }) || [];

    const links = Object.entries(graph.edges || {}).flatMap(([source, edges]) =>
      edges.map((edge) => {
        const link = {
          source: source.toString(),
          target: edge.target.toString(),
          weight: edge.weight,
        };
        nodeMap.get(source.toString()).links.push(link);
        nodeMap.get(source.toString()).neighbors.add(edge.target.toString());
        nodeMap.get(edge.target.toString())?.neighbors.add(source.toString());
        return link;
      })
    );

    return { nodes, links, nodeMap };
  }, [graph]);

  const data = useMemo(() => ({ nodes, links }), [nodes, links]);

  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());

  // Normalizacja feromonów (najwyższy poziom = 1.0)
  const { normalizedPheromones, maxPheromone } = useMemo(() => {
    if (!showPheromones || !pheromoneData || typeof pheromoneData !== 'object') {
      return { normalizedPheromones: {}, maxPheromone: 0 };
    }

    try {
      const values = Object.values(pheromoneData);
      if (values.length === 0) {
        return { normalizedPheromones: {}, maxPheromone: 0 };
      }

      const max = Math.max(...values.filter(v => typeof v === 'number' && !isNaN(v)), 0.001);
      
      const normalized = {};
      Object.entries(pheromoneData).forEach(([key, value]) => {
        if (typeof value === 'number' && !isNaN(value)) {
          normalized[key] = value / max;
        }
      });

      return { normalizedPheromones: normalized, maxPheromone: max };
    } catch (error) {
      console.error("Error normalizing pheromones:", error);
      return { normalizedPheromones: {}, maxPheromone: 0 };
    }
  }, [pheromoneData, showPheromones]);

  // Ścieżka algorytmu
  const pathHighlight = useMemo(() => {
    const pathNodes = new Set(highlightPath.map((id) => id.toString()));
    const pathLinks = new Set();

    for (let i = 0; i < highlightPath.length - 1; i++) {
      const source = highlightPath[i].toString();
      const target = highlightPath[i + 1].toString();
      pathLinks.add(`${source}-${target}`);
      if (!graph.directed) {
        pathLinks.add(`${target}-${source}`);
      }
    }

    return { pathNodes, pathLinks };
  }, [highlightPath, graph.directed]);

  const handleNodeHover = (node) => {
    const newHighlightNodes = new Set();
    const newHighlightLinks = new Set();

    if (node) {
      newHighlightNodes.add(node);

      node.links.forEach((link) => {
        const sourceId =
          typeof link.source === "object" ? link.source.id : link.source;
        const targetId =
          typeof link.target === "object" ? link.target.id : link.target;
        const linkKey = `${sourceId}-${targetId}`;
        newHighlightLinks.add(linkKey);
        newHighlightNodes.add(nodeMap.get(targetId.toString()));
      });

      if (!graph.directed) {
        node.neighbors.forEach((neighborId) =>
          newHighlightNodes.add(nodeMap.get(neighborId))
        );
      }
    }
    setHighlightNodes(newHighlightNodes);
    setHighlightLinks(newHighlightLinks);
  };

  const handleLinkHover = (link) => {
    const newHighlightNodes = new Set();
    const newHighlightLinks = new Set();

    if (link) {
      const sourceId =
        typeof link.source === "object" ? link.source.id : link.source;
      const targetId =
        typeof link.target === "object" ? link.target.id : link.target;
      const linkKey = `${sourceId}-${targetId}`;
      newHighlightLinks.add(linkKey);
      newHighlightNodes.add(nodeMap.get(sourceId.toString()));
      newHighlightNodes.add(nodeMap.get(targetId.toString()));
    }

    setHighlightNodes(newHighlightNodes);
    setHighlightLinks(newHighlightLinks);
  };

  const paintRing = useCallback(
    (node, ctx) => {
      const isHighlighted = highlightNodes.has(node);
      const isInPath = pathHighlight.pathNodes.has(node.id);

      let radius = 2;
      let fillColor = nodeColor;
      let shadowBlur = 10;
      let shadowColor = "transparent";

      if (isInPath) {
        fillColor = "#2ca02c";
        shadowBlur = 15;
        shadowColor = "#2ca02c";
      } else if (isHighlighted) {
        fillColor = nodeHighlightColor;
        shadowBlur = 20;
        shadowColor = nodeHighlightColor;
      }

      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
      ctx.fillStyle = fillColor;
      ctx.shadowBlur = shadowBlur;
      ctx.shadowColor = shadowColor;
      ctx.fill();

      if (isHighlighted || isInPath) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
        ctx.strokeStyle = isInPath ? "#1f5f1f" : nodeStrokeColor;
        ctx.lineWidth = isInPath ? 1 : 0.5;
        ctx.stroke();
      }

      const label = node.id;
      ctx.font = `2px Sans-Serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "white";
      ctx.fillText(label, node.x, node.y);

      ctx.shadowBlur = 0;
      ctx.shadowColor = "transparent";
    },
    [
      highlightNodes,
      nodeColor,
      nodeHighlightColor,
      nodeStrokeColor,
      pathHighlight.pathNodes,
    ]
  );

  // Kolor krawędzi z uwzględnieniem feromonów
  const getLinkColor = useCallback(
    (link) => {
      if (!link) return linkColor;
      
      const sourceId =
        typeof link.source === "object" ? link.source.id : link.source;
      const targetId =
        typeof link.target === "object" ? link.target.id : link.target;
      const linkKey = `${sourceId}-${targetId}`;

      // Priorytet 1: Ścieżka algorytmu
      if (pathHighlight.pathLinks.has(linkKey)) return "#2ca02c";

      // Priorytet 2: Feromon
      if (showPheromones && normalizedPheromones && normalizedPheromones[linkKey] !== undefined) {
        const intensity = normalizedPheromones[linkKey];
        if (!isNaN(intensity) && intensity >= 0 && intensity <= 1) {
          // Gradient od żółtego (0) przez pomarańczowy do czerwonego (1)
          const red = 255;
          const green = Math.floor(255 * (1 - intensity * 0.8));
          const blue = 0;
          return `rgb(${red}, ${green}, ${blue})`;
        }
      }

      // Priorytet 3: Highlight po hover
      if (!graph.directed) {
        const reverseKey = `${targetId}-${sourceId}`;
        if (highlightLinks.has(linkKey) || highlightLinks.has(reverseKey)) {
          return linkHighlightColor;
        }
      } else {
        if (highlightLinks.has(linkKey)) return linkHighlightColor;
      }

      return linkColor;
    },
    [
      highlightLinks,
      linkColor,
      linkHighlightColor,
      pathHighlight.pathLinks,
      graph.directed,
      showPheromones,
      normalizedPheromones
    ]
  );

  // Grubość krawędzi z uwzględnieniem feromonów
  const getLinkWidth = useCallback(
    (link) => {
      if (!link) return 0.1;
      
      const sourceId =
        typeof link.source === "object" ? link.source.id : link.source;
      const targetId =
        typeof link.target === "object" ? link.target.id : link.target;
      const linkKey = `${sourceId}-${targetId}`;

      if (pathHighlight.pathLinks.has(linkKey)) return 1;

      // Feromon zwiększa grubość
      if (showPheromones && normalizedPheromones && normalizedPheromones[linkKey] !== undefined) {
        const intensity = normalizedPheromones[linkKey];
        if (!isNaN(intensity) && intensity >= 0 && intensity <= 1) {
          return 0.2 + intensity * 1.5; // od 0.2 do 1.7
        }
      }

      if (!graph.directed) {
        const reverseKey = `${targetId}-${sourceId}`;
        if (highlightLinks.has(linkKey) || highlightLinks.has(reverseKey)) {
          return 1;
        }
      } else {
        if (highlightLinks.has(linkKey)) return 1;
      }

      return 0.1;
    },
    [highlightLinks, pathHighlight.pathLinks, graph.directed, showPheromones, normalizedPheromones]
  );

  const fgRef = useRef();

  return (
    <div>
      <ForceGraph2D
        graphData={data}
        nodeLabel={(node) => {
          const isInPath = pathHighlight.pathNodes.has(node.id);
          const pathIndex = isInPath
            ? highlightPath.findIndex((id) => id.toString() === node.id) + 1
            : null;
          return `Node: ${node.id}${
            pathIndex ? ` (Krok ${pathIndex})` : ""
          }\nGraph: ${node.graphName}`;
        }}
        linkLabel={(link) => {
          if (!link) return "";
          
          const sourceId = typeof link.source === "object" ? link.source.id : link.source;
          const targetId = typeof link.target === "object" ? link.target.id : link.target;
          const linkKey = `${sourceId}-${targetId}`;
          
          const pheromoneLevel = showPheromones && pheromoneData && pheromoneData[linkKey]
            ? pheromoneData[linkKey].toFixed(3)
            : null;
          
          return `${sourceId} → ${targetId}\nWaga: ${link.weight || "?"}${
            pheromoneLevel ? `\nFeromon: ${pheromoneLevel}` : ""
          }`;
        }}
        linkDirectionalArrowLength={graph.directed ? 3 : 0}
        linkDirectionalArrowRelPos={1}
        linkWidth={getLinkWidth}
        linkColor={getLinkColor}
        nodeCanvasObject={paintRing}
        onNodeHover={handleNodeHover}
        onLinkHover={handleLinkHover}
        linkCanvasObjectMode={() => "after"}
        ref={fgRef}
        cooldownTicks={1}
        onEngineStop={() => fgRef.current.zoomToFit(30)}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.8}
        d3Force={(forceEngine) => {
          forceEngine.force("charge").strength(-120);
          return forceEngine;
        }}
      />
    </div>
  );
}