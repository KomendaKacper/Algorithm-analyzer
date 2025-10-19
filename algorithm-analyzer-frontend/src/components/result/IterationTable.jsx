import React, { useMemo } from 'react';

// --- ZAKTUALIZOWANA, PANCERNA FUNKCJA FORMATUJĄCA ---
const formatValue = (value) => {
    if (value === undefined || value === null) {
        return '—'; // Znak braku danych
    }
    if (typeof value === 'number') {
        if (Math.abs(value) < 1e-6 && value !== 0) {
            return value.toExponential(2);
        }
        if (Number.isInteger(value)) {
            return value.toString();
        }
        return value.toFixed(3);
    }
    // Bezpieczne formatowanie obiektu (np. pheromoneStats)
    if (typeof value === 'object') {
        return Object.entries(value)
            .map(([k, v]) => `${k}: ${formatValue(v)}`) // Rekurencyjne wywołanie
            .join('; ');
    }
    return String(value);
};

export default function IterationTable({ data, problemName, algorithmName }) {
    const headers = useMemo(() => {
        if (!data || data.length === 0) return [];

        const baseHeaders = [
            { key: 'iteration', name: 'Iteracja' },
            { key: 'bestScore', name: 'Najlepszy Wynik' },
            { key: 'currentScore', name: 'Bieżący Wynik' },
            { key: 'averageScore', name: 'Średni Wynik' },
            { key: 'worstScore', name: 'Najgorszy Wynik' },
        ];
        
        const allSpecificKeys = new Set();
        data.forEach(row => {
            if (row.specificMetrics) {
                Object.keys(row.specificMetrics).forEach(key => allSpecificKeys.add(key));
            }
        });

        const specificMetricHeaders = Array.from(allSpecificKeys).map(key => ({ 
            key: key, 
            name: key.charAt(0).toUpperCase() + key.slice(1), // Estetyczna nazwa kolumny
            isSpecific: true 
        }));
        
        return [...baseHeaders, ...specificMetricHeaders].filter(h => 
            data.some(row => h.isSpecific ? row.specificMetrics?.[h.key] != null : row[h.key] != null)
        );

    }, [data]);

    if (!data || data.length === 0) {
        return <p className="chart-placeholder">Brak danych iteracyjnych do wyświetlenia.</p>;
    }

    return (
        <div className="iteration-table-container">
            <h4>Tabela iteracji dla: {algorithmName}</h4>
            <table>
                <thead>
                    <tr>
                        {headers.map(h => <th key={h.key}>{h.name}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => (
                        <tr key={index}>
                            {headers.map(h => (
                                <td key={h.key}>
                                    {formatValue(h.isSpecific ? row.specificMetrics?.[h.key] : row[h.key])}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

