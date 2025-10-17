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
        instance.setName("Generated (" + request.numberOfItems + " items)");
        instance.setItems(items);
        instance.setWeights(weights);
        instance.setValues(values);
        instance.setCapacity(capacity);
        log.info("Generated instance: {} items, capacity: {}", items.size(), capacity);
        return ResponseEntity.ok(instance);
    }

    @GetMapping("/predefined")
    public ResponseEntity<List<KnapsackInstance>> getPredefinedInstances() {
        log.info("Fetching predefined knapsack instances");
        List<KnapsackInstance> instances = new ArrayList<>();

        // === NOWE, WYMAGAJĄCE PRZYKŁADY ===

        // PRZYKŁAD 1: Pułapka podobnych współczynników (Density Trap)
        // Dlaczego jest trudny? Wszystkie przedmioty mają bardzo podobny stosunek wartości do wagi.
        // Algorytm nie ma oczywistego "najlepszego" wyboru w każdym kroku. Musi polegać na feromonach,
        // aby odkryć, która kombinacja pozornie równorzędnych przedmiotów daje globalnie najlepszy wynik.
        KnapsackInstance densityTrap = new KnapsackInstance();
        densityTrap.setName("Wymagający: Pułapka Gęstości (20 przedmiotów)");
        List<String> dtItems = new ArrayList<>();
        Map<String, Integer> dtWeights = new HashMap<>();
        Map<String, Integer> dtValues = new HashMap<>();
        for (int i = 1; i <= 20; i++) {
            String item = "DT_Item" + i;
            dtItems.add(item);
            int weight = 20 + i; // Wagi: 21, 22, ..., 40
            int value = (20 + i) * 10 + (i % 2 == 0 ? 5 : -5); // Wartości bliskie "waga * 10"
            dtWeights.put(item, weight);
            dtValues.put(item, value);
        }
        densityTrap.setItems(dtItems);
        densityTrap.setWeights(dtWeights);
        densityTrap.setValues(dtValues);
        densityTrap.setCapacity(300);
        instances.add(densityTrap);


        // PRZYKŁAD 2: Problem Klucza Francuskiego (Spanner Problem)
        // Dlaczego jest trudny? To klasyczna pułapka na algorytmy zachłanne.
        // Istnieje jeden duży przedmiot ("Klucz Francuski"), który ma świetny stosunek value/weight i zajmuje ponad połowę plecaka.
        // Jego wybór wydaje się najlepszy, ale uniemożliwia spakowanie kilku mniejszych przedmiotów ("Zestaw Śrubokrętów"),
        // które indywidualnie mają gorszy stosunek, ale łącznie dają znacznie wyższą wartość.
        KnapsackInstance spanner = new KnapsackInstance();
        spanner.setName("Wymagający: Problem Klucza Francuskiego (1+5 przedmiotów)");
        spanner.setItems(List.of("KluczFrancuski", "Śrubokręt1", "Śrubokręt2", "Śrubokręt3", "Śrubokręt4", "Śrubokręt5"));
        spanner.setWeights(Map.of(
                "KluczFrancuski", 51, "Śrubokręt1", 20, "Śrubokręt2", 20,
                "Śrubokręt3", 20, "Śrubokręt4", 20, "Śrubokręt5", 20
        ));
        spanner.setValues(Map.of(
                "KluczFrancuski", 100, "Śrubokręt1", 39, "Śrubokręt2", 39,
                "Śrubokręt3", 39, "Śrubokręt4", 39, "Śrubokręt5", 39
        ));
        spanner.setCapacity(100);
        instances.add(spanner);
        // Optymalne rozwiązanie: 5 śrubokrętów (wartość 195). Rozwiązanie zachłanne: Klucz Francuski (wartość 100).


        // PRZYKŁAD 3: Nieskorelowany chaos (Uncorrelated Chaos)
        // Dlaczego jest trudny? Waga przedmiotu nie ma żadnego związku z jego wartością.
        // Są tu "diamenty" (lekkie, cenne) i "kamienie" (ciężkie, bezwartościowe).
        // Algorytm musi efektywnie przeszukać dużą przestrzeń, aby odsiać śmieci i znaleźć najlepszą kombinację klejnotów.
        KnapsackInstance chaos = new KnapsackInstance();
        chaos.setName("Wymagający: Nieskorelowany Chaos (25 przedmiotów)");
        List<String> chaosItems = new ArrayList<>();
        Map<String, Integer> chaosWeights = new HashMap<>();
        Map<String, Integer> chaosValues = new HashMap<>();
        int[] weights = {18, 42, 88, 3, 25, 46, 99, 28, 53, 67, 8, 72, 21, 62, 14, 78, 33, 5, 93, 23, 50, 81, 37, 12, 58};
        int[] values = {505, 120, 80, 450, 610, 320, 95, 280, 430, 110, 780, 215, 590, 310, 880, 150, 440, 950, 105, 620, 290, 130, 400, 910, 250};
        for (int i = 0; i < 25; i++) {
            String item = "C_Item" + (i + 1);
            chaosItems.add(item);
            chaosWeights.put(item, weights[i]);
            chaosValues.put(item, values[i]);
        }
        chaos.setItems(chaosItems);
        chaos.setWeights(chaosWeights);
        chaos.setValues(chaosValues);
        chaos.setCapacity(500);
        instances.add(chaos);

        log.info("Returning {} predefined instances", instances.size());
        return ResponseEntity.ok(instances);
    }

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