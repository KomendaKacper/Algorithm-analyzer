package com.example.algorithm_analyzer.controllers;

import com.example.algorithm_analyzer.services.DynamicProblemService;
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
import java.util.Map;

@RestController
@RequestMapping("/api/custom-problems")
@RequiredArgsConstructor
@Slf4j
public class DynamicProblemController {

    private final DynamicProblemService problemService;
    private final ResourceLoader resourceLoader;

    /**
     * Endpoint to get the Groovy template for a new problem.
     */
    @GetMapping(value = "/template", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> getProblemTemplate() {
        try {
            // Load the template file from the resources folder
            Resource resource = resourceLoader.getResource("classpath:templates/CustomProblem.groovy.template");
            Reader reader = new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8);
            String template = FileCopyUtils.copyToString(reader);
            return ResponseEntity.ok(template);
        } catch (IOException e) {
            log.error("Could not load problem template", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not load template");
        }
    }

    /**
     * Endpoint to submit new problem code for compilation and registration.
     */
    @PostMapping("/compile")
    public ResponseEntity<?> compileAndRegisterProblem(@RequestBody CustomCodeDto codeDto) {
        if (codeDto.code == null || codeDto.code.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Code cannot be empty."));
        }

        try {
            problemService.registerCustomProblem(codeDto.code);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("message", "Problem successfully compiled and added."));
        } catch (MultipleCompilationErrorsException e) {
            ErrorCollector errorCollector = e.getErrorCollector();
            String errorMessage = errorCollector.getError(0).toString();
            log.warn("Compilation error: {}", errorMessage);
            return ResponseEntity.badRequest().body(Map.of("error", "Compilation error: " + errorMessage));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error during problem registration", e);
            return ResponseEntity.internalServerError().body(Map.of("error", "Server error: " + e.getMessage()));
        }
    }

    static class CustomCodeDto {
        public String code;
    }
}