import ForceGraph2D from "react-force-graph-2d";
import { useCallback, useState, useMemo } from "react";

export default function GraphViewer({
  graph,
  nodeColor,
  nodeHighlightColor,
  nodeStrokeColor,
  linkColor,
  linkHighlightColor,
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
      const radius = highlightNodes.has(node) ? 2.1 : 2; // większy promień dla podświetlonego
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
      ctx.fillStyle = highlightNodes.has(node) ? nodeHighlightColor : nodeColor;
      ctx.shadowBlur = highlightNodes.has(node) ? 20 : 0; // efekt „świecenia”
      ctx.shadowColor = highlightNodes.has(node)
        ? nodeHighlightColor
        : "transparent";
      ctx.fill();

      if (highlightNodes.has(node)) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
        ctx.strokeStyle = nodeStrokeColor;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      ctx.shadowBlur = 0;
      ctx.shadowColor = "transparent";
    },
    [highlightNodes, nodeColor, nodeHighlightColor, nodeStrokeColor]
  );

  return (
    <div>
      <ForceGraph2D
        minZoom={3}
        graphData={data}
        nodeLabel={(node) => `Node: ${node.id}\nGraph: ${node.graphName}`}
        nodeAutoColorBy="id"
        linkDirectionalArrowLength={2}
        linkDirectionalArrowRelPos={1}
        linkWidth={(link) => (highlightLinks.has(link) ? 5 : 1)}
        linkColor={(link) =>
          highlightLinks.has(link) ? linkHighlightColor : linkColor
        }
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

          ctx.save();
          ctx.font = "3px Sans-Serif";
          ctx.fillStyle = "grey";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(Math.round(link.weight * 100) / 100, midX, midY);
          ctx.restore();

          if (!highlightLinks.has(link)) return;

          ctx.save();
          ctx.strokeStyle = linkHighlightColor;
          ctx.globalAlpha = 0.3; // półprzezroczyste świecenie
          ctx.lineWidth = 1; // większy niż normalny linkWidth
          ctx.beginPath();
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(end.x, end.y);
          ctx.stroke();
          ctx.restore();
        }}
      />
    </div>
  );
}
