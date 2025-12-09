import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CHART_COLORS_PALETTE } from './chartColors';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="tooltip-label">{`Iteracja: ${label}`}</p>
        {payload.map((pld, index) => {
          let value = pld.value;
          if (typeof value === 'number') {
            value = Number.isInteger(value) ? value : parseFloat(value.toFixed(4));
          }
          return (
            <p key={`item-${index}`} className="tooltip-item" style={{ color: pld.stroke }}>
              {`${pld.name}: ${value}`}
            </p>
          );
        })}
      </div>
    );
  }
  return null;
};

export function ObjectMetricChart({ results, dataKey, name }) {
  if (!results || results.length === 0) {
    return <div className="chart-placeholder">Brak wyników do wyświetlenia.</div>;
  }

  const result = results[0]; // Zakładamy, że specyficzne metryki wyświetlamy dla jednego algorytmu
  const iterationResults = result.iterationResults;

  if (!iterationResults || iterationResults.length === 0) {
      return <div className="chart-placeholder">Brak danych iteracji.</div>;
  }

  // Sprawdzamy strukturę obiektu w pierwszej iteracji (lub pierwszej, która ma dane)
  const firstData = iterationResults.find(r => r.specificMetrics && r.specificMetrics[dataKey]);
  if (!firstData) {
      return <div className="chart-placeholder">Brak danych dla metryki "{name}".</div>;
  }

  const metricObject = firstData.specificMetrics[dataKey];
  if (typeof metricObject !== 'object' || metricObject === null) {
       return <div className="chart-placeholder">Metryka "{name}" nie jest obiektem.</div>;
  }

  const subKeys = Object.keys(metricObject).filter(k => typeof metricObject[k] === 'number');

  if (subKeys.length === 0) {
      return <div className="chart-placeholder">Obiekt "{name}" nie zawiera pól liczbowych.</div>;
  }

  const chartData = iterationResults.map((iter, index) => {
      const valObj = iter.specificMetrics?.[dataKey] || {};
      const point = { iteration: index };
      subKeys.forEach(key => {
          point[key] = valObj[key];
      });
      return point;
  });

  return (
    <div className="chart-container">
      <h4>{name}</h4>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 30, right: 30, left: 50, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="iteration" label={{ value: 'Iteracja', position: 'insideBottom', offset: -15 }} />
          <YAxis domain={['auto', 'auto']} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ position: 'relative', marginTop: '10px' }} />
          {subKeys.map((key, index) => {
            const colorObj = CHART_COLORS_PALETTE[index % CHART_COLORS_PALETTE.length];
            return (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                name={key}
                stroke={colorObj.line}
                dot={false}
                strokeWidth={2}
                activeDot={{ r: 6 }}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
