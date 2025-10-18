import React, { useMemo } from 'react';

// Funkcja pomocnicza do formatowania wartości w tabeli
const formatValue = (value) => {
    if (typeof value === 'number') {
        return value.toFixed(3);
    }
    if (typeof value === 'object' && value !== null) {
        // Formatuje obiekty (np. pheromoneStats) do czytelnej postaci
        return Object.entries(value)
            .map(([k, v]) => `${k}: ${typeof v === 'number' ? v.toFixed(2) : v}`)
            .join(', ');
    }
    return String(value);
};

export default function IterationTable({ data, problemName, algorithmName }) {
    // --- KLUCZOWA ZMIANA: Dynamiczne generowanie nagłówków tabeli ---
    const headers = useMemo(() => {
        if (!data || data.length === 0) return [];

        const firstRow = data[0];
        const baseHeaders = [
            { key: 'iteration', name: 'Iteracja' },
            { key: 'bestScore', name: 'Najlepszy Wynik' },
            { key: 'currentScore', name: 'Bieżący Wynik' },
            { key: 'averageScore', name: 'Średni Wynik' },
            { key: 'worstScore', name: 'Najgorszy Wynik' },
        ];
        
        const specificMetricHeaders = [];
        if (firstRow.specificMetrics) {
            for (const key in firstRow.specificMetrics) {
                specificMetricHeaders.push({ key: key, name: key, isSpecific: true });
            }
        }
        
        // Zwracamy tylko te nagłówki, dla których istnieją dane w pierwszej iteracji
        return [...baseHeaders, ...specificMetricHeaders].filter(h => {
             if (h.isSpecific) {
                return firstRow.specificMetrics?.[h.key] !== undefined;
             }
             return firstRow[h.key] !== undefined && firstRow[h.key] !== null;
        });

    }, [data]);

    if (!data || data.length === 0) {
        return <p>Brak danych iteracyjnych do wyświetlenia.</p>;
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
