import ForceGraph2D from "react-force-graph-2d";
import { useCallback, useState, useMemo } from "react";

export default function GraphViewer({
  graph,
  nodeColor = "#1f77b4",
  nodeHighlightColor = "#ff7f0e",
  nodeStrokeColor = "#333",
  linkColor = "#999",
  linkHighlightColor = "#ff7f0e",
  highlightPath = [], // ścieżka algorytmu
}) {
  if (!graph) return <p>Ładowanie grafu...</p>;

  // Tworzenie węzłów i krawędzi
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

  // Ścieżka algorytmu
  const pathHighlight = useMemo(() => {
    const pathNodes = new Set(highlightPath.map((id) => id.toString()));
    const pathLinks = new Set();

    for (let i = 0; i < highlightPath.length - 1; i++) {
      const source = highlightPath[i].toString();
      const target = highlightPath[i + 1].toString();
      pathLinks.add(`${source}-${target}`);
      if (!graph.directed) {
        pathLinks.add(`${target}-${source}`); // dla nieskierowanego
      }
    }

    return { pathNodes, pathLinks };
  }, [highlightPath, graph.directed]);

  // Hover na wierzchołku
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

  // Hover na krawędzi
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

  // Rysowanie węzła
  const paintRing = useCallback(
    (node, ctx) => {
      const isHighlighted = highlightNodes.has(node);
      const isInPath = pathHighlight.pathNodes.has(node.id);

      let radius = 3;
      let fillColor = nodeColor;
      let shadowBlur = 10;
      let shadowColor = "transparent";

      if (isInPath) {
        fillColor = "#2ca02c"; // zielony
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

      // etykieta
      const label = node.id;
      ctx.font = `3px Sans-Serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "white";
      ctx.fillText(label, node.x, node.y);

      ctx.shadowBlur = 0;
      ctx.shadowColor = "transparent";
    },
    [highlightNodes, nodeColor, nodeHighlightColor, nodeStrokeColor, pathHighlight.pathNodes]
  );

  // Kolorowanie krawędzi
  const getLinkColor = useCallback(
    (link) => {
      const sourceId =
        typeof link.source === "object" ? link.source.id : link.source;
      const targetId =
        typeof link.target === "object" ? link.target.id : link.target;
      const linkKey = `${sourceId}-${targetId}`;

      if (pathHighlight.pathLinks.has(linkKey)) return "#2ca02c";

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
    [highlightLinks, linkColor, linkHighlightColor, pathHighlight.pathLinks, graph.directed]
  );

  // Grubość krawędzi
  const getLinkWidth = useCallback(
    (link) => {
      const sourceId =
        typeof link.source === "object" ? link.source.id : link.source;
      const targetId =
        typeof link.target === "object" ? link.target.id : link.target;
      const linkKey = `${sourceId}-${targetId}`;

      if (pathHighlight.pathLinks.has(linkKey)) return 8;

      if (!graph.directed) {
        const reverseKey = `${targetId}-${sourceId}`;
        if (highlightLinks.has(linkKey) || highlightLinks.has(reverseKey)) {
          return 3;
        }
      } else {
        if (highlightLinks.has(linkKey)) return 3;
      }

      return 1;
    },
    [highlightLinks, pathHighlight.pathLinks, graph.directed]
  );

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
        linkDirectionalArrowLength={graph.directed ? 3 : 0}
        linkDirectionalArrowRelPos={1}
        linkWidth={getLinkWidth}
        linkColor={getLinkColor}
        nodeCanvasObject={paintRing}
        onNodeHover={handleNodeHover}
        onLinkHover={handleLinkHover}
        linkCanvasObjectMode={() => "after"}
        linkCanvasObject={(link, ctx) => {
          const start = link.source;
          const end = link.target;
          if (!start || !end) return;

          const midX = (start.x + end.x) / 2;
          const midY = (start.y + end.y) / 2;

          // Waga krawędzi
          ctx.save();
          ctx.font = "3px Sans-Serif";
          ctx.fillStyle = pathHighlight.pathLinks.has(`${start.id}-${end.id}`)
            ? "#1f5f1f"
            : "grey";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(Math.round(link.weight * 100) / 100, midX, midY);
          ctx.restore();

          // Hover na krawędzi (tylko jeśli nie jest ścieżką)
          const linkKey = `${start.id}-${end.id}`;
          if (highlightLinks.has(linkKey) && !pathHighlight.pathLinks.has(linkKey)) {
            ctx.save();
            ctx.strokeStyle = linkHighlightColor;
            ctx.globalAlpha = 0.3;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
            ctx.restore();
          }
        }}
      />
    </div>
  );
}
