import ForceGraph2D from "react-force-graph-2d";
import { useCallback, useState, useMemo } from "react";

export default function GraphViewer({
  graph,
  nodeColor = "#1f77b4",
  nodeHighlightColor = "#ff7f0e",
  nodeStrokeColor = "#333",
  linkColor = "#999",
  linkHighlightColor = "#ff7f0e",
  highlightPath = [], // Nowa prop dla wyróżnienia ścieżki algorytmu
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

  // Wyróżnienie ścieżki znalezionej przez algorytm
  const pathHighlight = useMemo(() => {
    const pathNodes = new Set(highlightPath.map(id => id.toString()));
    const pathLinks = new Set();
    
    for (let i = 0; i < highlightPath.length - 1; i++) {
      const source = highlightPath[i].toString();
      const target = highlightPath[i + 1].toString();
      
      // Znajdź odpowiedni link
      const pathLink = links.find(link => 
        link.source.toString() === source && link.target.toString() === target
      );
      if (pathLink) {
        pathLinks.add(pathLink);
      }
    }
    
    return { pathNodes, pathLinks };
  }, [highlightPath, links]);

  const handleNodeHover = (node) => {
    const newHighlightNodes = new Set();
    const newHighlightLinks = new Set();

    if (node) {
      newHighlightNodes.add(node);

      if (graph.directed) {
        node.links.forEach((link) => {
          newHighlightLinks.add(link);
          newHighlightNodes.add(nodeMap.get(link.target.toString()));
        });
      } else {
        node.neighbors.forEach((neighborId) =>
          newHighlightNodes.add(nodeMap.get(neighborId))
        );
        node.links.forEach((link) => newHighlightLinks.add(link));
      }
    }

    setHighlightNodes(newHighlightNodes);
    setHighlightLinks(newHighlightLinks);
  };

  const handleLinkHover = (link) => {
    const newHighlightNodes = new Set();
    const newHighlightLinks = new Set();

    if (link) {
      newHighlightLinks.add(link);
      newHighlightNodes.add(nodeMap.get(link.source));
      newHighlightNodes.add(nodeMap.get(link.target));
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
      let shadowBlur = 0;
      let shadowColor = "transparent";
      
      if (isInPath) {
        radius = 3;
        fillColor = "#2ca02c"; // Zielony dla ścieżki algorytmu
        shadowBlur = 15;
        shadowColor = "#2ca02c";
      } else if (isHighlighted) {
        radius = 2.1;
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

      ctx.shadowBlur = 0;
      ctx.shadowColor = "transparent";
    },
    [highlightNodes, nodeColor, nodeHighlightColor, nodeStrokeColor, pathHighlight.pathNodes]
  );

  const getLinkColor = useCallback((link) => {
    if (pathHighlight.pathLinks.has(link)) {
      return "#2ca02c"; // Zielony dla ścieżki algorytmu
    }
    return highlightLinks.has(link) ? linkHighlightColor : linkColor;
  }, [highlightLinks, linkColor, linkHighlightColor, pathHighlight.pathLinks]);

  const getLinkWidth = useCallback((link) => {
    if (pathHighlight.pathLinks.has(link)) {
      return 4; // Grubsza linia dla ścieżki algorytmu
    }
    return highlightLinks.has(link) ? 5 : 1;
  }, [highlightLinks, pathHighlight.pathLinks]);

  return (
    <div>
      <ForceGraph2D
        graphData={data}
        nodeLabel={(node) => {
          const isInPath = pathHighlight.pathNodes.has(node.id);
          const pathIndex = isInPath ? highlightPath.findIndex(id => id.toString() === node.id) + 1 : null;
          return `Node: ${node.id}${pathIndex ? ` (Krok ${pathIndex})` : ''}\nGraph: ${node.graphName}`;
        }}
        nodeAutoColorBy="id"
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

          // Wyświetl wagę krawędzi
          ctx.save();
          ctx.font = "3px Sans-Serif";
          ctx.fillStyle = pathHighlight.pathLinks.has(link) ? "#1f5f1f" : "grey";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(Math.round(link.weight * 100) / 100, midX, midY);
          ctx.restore();

          // Dodatkowe podświetlenie dla hover
          if (highlightLinks.has(link) && !pathHighlight.pathLinks.has(link)) {
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