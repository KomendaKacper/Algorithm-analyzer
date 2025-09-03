import React, { useState, useEffect } from 'react';
import { getGraphs, getGraph, getAlgorithms, executeAlgorithm } from '../api';
import { useGraphData } from '../hooks/useGraphData';
import GraphViewer from './GraphViewer';

export default function AlgorithmTester() {
  const [graphs, setGraphs] = useState([]);
  const [selectedGraphId, setSelectedGraphId] = useState(null);
  const [graphDetails, setGraphDetails] = useState(null);
  const [algorithms, setAlgorithms] = useState([]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(null);
  const [parameters, setParameters] = useState({});
  const [result, setResult] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const transformedGraph = useGraphData(graphDetails);

  useEffect(() => {
    loadGraphs();
    loadAlgorithms();
  }, []);

  useEffect(() => {
    if (selectedGraphId) {
      loadGraphDetails(selectedGraphId);
    }
  }, [selectedGraphId]);

  const loadGraphs = async () => {
    try {
      const response = await getGraphs();
      setGraphs(response.data);
      if (response.data.length > 0) {
        setSelectedGraphId(response.data[0].id);
      }
    } catch (error) {
      console.error('Błąd przy ładowaniu grafów:', error);
    }
  };

  const loadGraphDetails = async (graphId) => {
    try {
      const response = await getGraph(graphId);
      setGraphDetails(response.data);
    } catch (error) {
      console.error('Błąd przy ładowaniu szczegółów grafu:', error);
    }
  };

  const loadAlgorithms = async () => {
    try {
      const response = await getAlgorithms();
      setAlgorithms(response.data);
      if (response.data.length > 0) {
        setSelectedAlgorithm(response.data[0]);
        initializeParameters(response.data[0]);
      }
    } catch (error) {
      console.error('Błąd przy ładowaniu algorytmów:', error);
    }
  };

  const initializeParameters = (algorithm) => {
    const params = {};
    algorithm.parameters.forEach(param => {
      params[param.name] = param.defaultValue;
    });
    setParameters(params);
  };

  const handleParameterChange = (paramName, value) => {
    setParameters(prev => ({
      ...prev,
      [paramName]: value
    }));
  };

  const handleAlgorithmChange = (algorithm) => {
    setSelectedAlgorithm(algorithm);
    initializeParameters(algorithm);
    setResult(null);
  };

  const executeSelectedAlgorithm = async () => {
    if (!selectedAlgorithm || !selectedGraphId) return;

    setIsExecuting(true);
    try {
      const response = await executeAlgorithm(
        selectedAlgorithm.name,
        selectedGraphId,
        parameters
      );
      setResult(response.data);
    } catch (error) {
      console.error('Błąd przy wykonywaniu algorytmu:', error);
      setResult({
        success: false,
        errorMessage: error.response?.data?.message || error.message
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const renderParameterInput = (param) => {
    const value = parameters[param.name] || '';
    
    switch (param.type) {
      case 'INTEGER':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleParameterChange(param.name, parseInt(e.target.value) || 0)}
            min={param.minValue}
            max={param.maxValue}
            className="border rounded px-2 py-1"
          />
        );
      case 'DOUBLE':
        return (
          <input
            type="number"
            step="0.1"
            value={value}
            onChange={(e) => handleParameterChange(param.name, parseFloat(e.target.value) || 0)}
            min={param.minValue}
            max={param.maxValue}
            className="border rounded px-2 py-1"
          />
        );
      case 'BOOLEAN':
        return (
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => handleParameterChange(param.name, e.target.checked)}
            className="rounded"
          />
        );
      case 'NODE_ID':
        return (
          <select
            value={value}
            onChange={(e) => handleParameterChange(param.name, parseInt(e.target.value))}
            className="border rounded px-2 py-1"
          >
            <option value="">Wybierz węzeł</option>
            {graphDetails?.nodes?.map(node => (
              <option key={node.nodeId} value={node.nodeId}>
                Węzeł {node.nodeId}
              </option>
            ))}
          </select>
        );
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleParameterChange(param.name, e.target.value)}
            className="border rounded px-2 py-1"
          />
        );
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Tester Algorytmów</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Panel kontrolny */}
        <div className="space-y-4">
          {/* Wybór grafu */}
          <div>
            <label className="block font-semibold mb-2">Wybierz graf:</label>
            <select
              value={selectedGraphId || ''}
              onChange={(e) => setSelectedGraphId(parseInt(e.target.value))}
              className="w-full border rounded px-2 py-1"
            >
              {graphs.map(graph => (
                <option key={graph.id} value={graph.id}>
                  {graph.name} ({graph.nodeCount} węzłów, {graph.edgeCount} krawędzi)
                </option>
              ))}
            </select>
          </div>

          {/* Wybór algorytmu */}
          <div>
            <label className="block font-semibold mb-2">Wybierz algorytm:</label>
            <select
              value={selectedAlgorithm?.name || ''}
              onChange={(e) => {
                const algorithm = algorithms.find(alg => alg.name === e.target.value);
                handleAlgorithmChange(algorithm);
              }}
              className="w-full border rounded px-2 py-1"
            >
              {algorithms.map(algorithm => (
                <option key={algorithm.name} value={algorithm.name}>
                  {algorithm.name}
                </option>
              ))}
            </select>
            {selectedAlgorithm && (
              <p className="text-sm text-gray-600 mt-1">
                {selectedAlgorithm.description}
              </p>
            )}
          </div>

          {/* Parametry algorytmu */}
          {selectedAlgorithm && (
            <div>
              <h3 className="font-semibold mb-2">Parametry:</h3>
              <div className="space-y-2">
                {selectedAlgorithm.parameters.map(param => (
                  <div key={param.name} className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      {param.displayName}:
                    </label>
                    {renderParameterInput(param)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Przycisk wykonania */}
          <button
            onClick={executeSelectedAlgorithm}
            disabled={isExecuting || !selectedAlgorithm || !selectedGraphId}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {isExecuting ? 'Wykonywanie...' : 'Wykonaj algorytm'}
          </button>

          {/* Wyniki */}
          {result && (
            <div className="border rounded p-4">
              <h3 className="font-semibold mb-2">Wyniki:</h3>
              {result.success ? (
                <div className="space-y-2">
                  <p><strong>Ścieżka:</strong> {result.path?.join(' → ')}</p>
                  <p><strong>Długość ścieżki:</strong> {result.pathLength?.toFixed(2)}</p>
                  <p><strong>Czas wykonania:</strong> {result.executionDurationMs} ms</p>
                  {result.statistics && (
                    <div>
                      <strong>Statystyki:</strong>
                      <pre className="text-xs bg-gray-100 p-2 mt-1 rounded">
                        {JSON.stringify(result.statistics, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-red-600">
                  <strong>Błąd:</strong> {result.errorMessage}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Wizualizacja grafu */}
        <div className="h-96 border rounded">
          {transformedGraph && (
            <GraphViewer
              graph={transformedGraph}
              highlightPath={result?.path || []}
            />
          )}
        </div>
      </div>
    </div>
  );
}