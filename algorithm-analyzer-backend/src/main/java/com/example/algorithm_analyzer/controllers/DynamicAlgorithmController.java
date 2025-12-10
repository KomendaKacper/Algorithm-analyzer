package com.example.algorithm_analyzer.controllers;

import com.example.algorithm_analyzer.services.AlgorithmService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.codehaus.groovy.control.ErrorCollector;
import org.codehaus.groovy.control.MultipleCompilationErrorsException;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.util.Map; // Upewnij się, że masz ten import

@RestController
@RequestMapping("/api/custom-algorithms") // <-- POPRAWKA: Usunięto "/api/v1". Będzie teraz /api/custom-algorithms
@RequiredArgsConstructor
@Slf4j
public class DynamicAlgorithmController {

    private final AlgorithmService algorithmService;
    private final ResourceLoader resourceLoader;

    /**
     * Endpoint do pobierania szablonu Groovy, który użytkownik będzie wypełniać.
     */
    @GetMapping(value = "/template", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> getAlgorithmTemplate() {
        try {
            // Wczytaj plik szablonu z folderu resources
            Resource resource = resourceLoader.getResource("classpath:templates/CustomAlgorithm.groovy.template");
            Reader reader = new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8);
            String template = FileCopyUtils.copyToString(reader);
            return ResponseEntity.ok(template);
        } catch (IOException e) {
            log.error("Nie można wczytać szablonu algorytmu", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Nie można wczytać szablonu");
        }
    }

    /**
     * Endpoint do przesyłania nowego kodu algorytmu do kompilacji i rejestracji.
     */
    @PostMapping("/compile")
    public ResponseEntity<?> compileAndRegisterAlgorithm(@RequestBody CustomCodeDto codeDto) {
        if (codeDto.code == null || codeDto.code.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Kod nie może być pusty."));
        }

        try {
            algorithmService.registerCustomAlgorithm(codeDto.code);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("message", "Algorytm został pomyślnie skompilowany i dodany."));
        } catch (MultipleCompilationErrorsException e) {
            // Błąd kompilacji Groovy
            ErrorCollector errorCollector = e.getErrorCollector();
            String errorMessage = errorCollector.getError(0).toString(); // Weź pierwszy błąd
            log.warn("Błąd kompilacji: {}", errorMessage);
            return ResponseEntity.badRequest().body(Map.of("error", "Błąd kompilacji: " + errorMessage));
        } catch (IllegalArgumentException e) {
            // Błąd walidacji (np. zduplikowana nazwa)
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            // Inny błąd (np. brak konstruktora, błąd refleksji)
            log.error("Nieoczekiwany błąd podczas rejestracji algorytmu", e);
            return ResponseEntity.internalServerError().body(Map.of("error", "Błąd serwera: " + e.getMessage()));
        }
    }

    // Proste DTO do odbioru kodu
    static class CustomCodeDto {
        public String code;
    }
}