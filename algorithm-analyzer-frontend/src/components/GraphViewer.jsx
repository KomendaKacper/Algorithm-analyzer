import ForceGraph2D from "react-force-graph-2d";
import { useCallback, useState, useMemo } from "react";

export default function GraphViewer({ graph }) {
  if (!graph) return <p>Ładowanie grafu...</p>;

  const { nodes, links, nodeMap } = useMemo(() => {
  const nodeMap = new Map();
  const nodes = graph.nodes?.map((id) => {
    const node = {
      id: id.toString(),
      graphName: graph.name,
      directed: graph.directed,
      neighbors: new Set(),
      links: []
    };
    nodeMap.set(node.id, node);
    return node;
  }) || [];

  const links = Object.entries(graph.edges || {}).flatMap(([source, edges]) =>
    edges.map((edge) => {
      const link = {
        source: source.toString(),
        target: edge.target.toString(),
        value: edge.weight
      };
      nodeMap.get(source.toString()).links.push(link);
      nodeMap.get(source.toString()).neighbors.add(edge.target.toString());
      nodeMap.get(edge.target.toString())?.neighbors.add(source.toString());
      return link;
    })
  );

  return { nodes, links, nodeMap };
}, [graph]); // odświeżamy tylko, jeśli zmieni się graf

const data = useMemo(() => ({ nodes, links }), [nodes, links]);

  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());
  const [hoverNode, setHoverNode] = useState(null);

  const updateHighlight = () => {
    setHighlightNodes(highlightNodes);
    setHighlightLinks(highlightLinks);
  }

  const handleNodeHover = node => {
  const newHighlightNodes = new Set();
  const newHighlightLinks = new Set();

  if (node) {
    newHighlightNodes.add(node);
    node.neighbors.forEach(neighborId => newHighlightNodes.add(nodeMap.get(neighborId)));
    node.links.forEach(link => newHighlightLinks.add(link));
  }

  setHighlightNodes(newHighlightNodes);
  setHighlightLinks(newHighlightLinks);
  setHoverNode(node || null);
};

  const handleLinkHover = link => {
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



  const paintRing = useCallback((node, ctx) => {
  const radius = 2; 
  ctx.beginPath();
  ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
  ctx.fillStyle = highlightNodes.has(node) ? '#edf095ff' : '#57b739ff';
  ctx.fill();

  if (highlightNodes.has(node)) {
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius , 0, 2 * Math.PI, false);
    ctx.strokeStyle = '#3e722eff';
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }
}, [highlightNodes]);



  return (
    <div>
      <ForceGraph2D
        minZoom={3}
        graphData={data}
        nodeLabel={(node) => `Node: ${node.id}\nGraph: ${node.graphName}`}
        nodeAutoColorBy="id"
        linkDirectionalArrowLength={5}
        linkDirectionalArrowRelPos={1}
        nodeCanvasObject={paintRing}
        onNodeHover={handleNodeHover}
        onLinkHover={handleLinkHover}
      />
    </div>
  );
}
