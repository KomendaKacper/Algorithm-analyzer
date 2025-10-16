package com.example.algorithm_analyzer.problems;

import java.util.List;

public abstract class AbstractMatrixProblem implements Problem {

    protected List<String> elements;
    protected double[][] heuristicMatrix; // heurystyka między elementami
    protected boolean initialized = false;

    @Override
    public double getHeuristicValue(String from, String to) {
        int i = elements.indexOf(from);
        int j = elements.indexOf(to);
        if (i < 0 || j < 0) return 0.001;
        return heuristicMatrix[i][j];
    }

    @Override
    public List<String> getAllElements() {
        return elements;
    }

    @Override
    public String getPheromoneKey(String from, String to) {
        return from + "-" + to;
    }

    protected void checkInitialized() {
        if (!initialized) {
            throw new IllegalStateException("Problem nie został zainicjalizowany!");
        }
    }
}
