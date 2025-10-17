package com.example.algorithm_analyzer.controllers;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@Slf4j
@RestController
@RequestMapping("/api/problems/knapsack")
public class KnapsackInstanceController {

    @PostMapping("/generate")
    public ResponseEntity<KnapsackInstance> generateInstance(@RequestBody GenerateRequest request) {
        log.info("Generating knapsack instance with params: {}", request);

        Random random = new Random(request.seed != null ? request.seed : System.currentTimeMillis());

        List<String> items = new ArrayList<>();
        Map<String, Integer> weights = new HashMap<>();
        Map<String, Integer> values = new HashMap<>();

        for (int i = 0; i < request.numberOfItems; i++) {
            String itemName = "Item" + (i + 1);
            items.add(itemName);

            int weight = request.minWeight + random.nextInt(request.maxWeight - request.minWeight + 1);
            weights.put(itemName, weight);

            int value = request.minValue + random.nextInt(request.maxValue - request.minValue + 1);
            values.put(itemName, value);
        }

        int totalWeight = weights.values().stream().mapToInt(Integer::intValue).sum();
        int capacity = (int) (totalWeight * request.capacityRatio);

        KnapsackInstance instance = new KnapsackInstance();
        instance.setItems(items);
        instance.setWeights(weights);
        instance.setValues(values);
        instance.setCapacity(capacity);
        instance.setName("Generated (" + request.numberOfItems + " items)");

        log.info("Generated instance: {} items, capacity: {}", items.size(), capacity);
        return ResponseEntity.ok(instance);
    }

    @GetMapping("/predefined")
    public ResponseEntity<List<KnapsackInstance>> getPredefinedInstances() {
        log.info("Fetching predefined knapsack instances");

        List<KnapsackInstance> instances = new ArrayList<>();

        // Przykład 1: Mały problem (5 przedmiotów)
        KnapsackInstance small = new KnapsackInstance();
        small.setName("Small Example (5 items)");
        small.setItems(List.of("Laptop", "Camera", "Book", "Phone", "Tablet"));
        small.setWeights(Map.of(
                "Laptop", 3,
                "Camera", 2,
                "Book", 1,
                "Phone", 1,
                "Tablet", 2
        ));
        small.setValues(Map.of(
                "Laptop", 2000,
                "Camera", 1500,
                "Book", 100,
                "Phone", 800,
                "Tablet", 1200
        ));
        small.setCapacity(5);
        instances.add(small);

        // Przykład 2: Średni problem (10 przedmiotów)
        KnapsackInstance medium = new KnapsackInstance();
        medium.setName("Medium Example (10 items)");
        List<String> mediumItems = new ArrayList<>();
        Map<String, Integer> mediumWeights = new HashMap<>();
        Map<String, Integer> mediumValues = new HashMap<>();

        for (int i = 1; i <= 10; i++) {
            String item = "Item" + i;
            mediumItems.add(item);
            mediumWeights.put(item, i);
            mediumValues.put(item, i * 10);
        }

        medium.setItems(mediumItems);
        medium.setWeights(mediumWeights);
        medium.setValues(mediumValues);
        medium.setCapacity(25);
        instances.add(medium);

        // Przykład 3: Trudny problem
        KnapsackInstance hard = new KnapsackInstance();
        hard.setName("Hard Example (8 items - similar ratios)");
        hard.setItems(List.of("A", "B", "C", "D", "E", "F", "G", "H"));
        hard.setWeights(Map.of(
                "A", 10, "B", 11, "C", 12, "D", 13,
                "E", 14, "F", 15, "G", 16, "H", 17
        ));
        hard.setValues(Map.of(
                "A", 20, "B", 22, "C", 24, "D", 26,
                "E", 28, "F", 30, "G", 32, "H", 34
        ));
        hard.setCapacity(50);
        instances.add(hard);

        log.info("Returning {} predefined instances", instances.size());
        return ResponseEntity.ok(instances);
    }

    // Test endpoint - sprawdź czy controller w ogóle działa
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        log.info("Test endpoint called");
        return ResponseEntity.ok("KnapsackInstanceController is working!");
    }

    @Data
    public static class GenerateRequest {
        private Integer numberOfItems = 10;
        private Integer minWeight = 1;
        private Integer maxWeight = 20;
        private Integer minValue = 10;
        private Integer maxValue = 100;
        private Double capacityRatio = 0.5;
        private Long seed;
    }

    @Data
    public static class KnapsackInstance {
        private String name;
        private List<String> items;
        private Map<String, Integer> weights;
        private Map<String, Integer> values;
        private Integer capacity;
    }
}