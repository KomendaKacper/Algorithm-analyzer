package com.example.algorithm_analyzer.configs;

import org.codehaus.groovy.control.CompilerConfiguration;
import org.codehaus.groovy.control.customizers.SecureASTCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class GroovySandboxConfig {

    @Bean
    public SecureASTCustomizer groovySecurityCustomizer() {
        final SecureASTCustomizer customizer = new SecureASTCustomizer();

        // 1. Zezwól na KONKRETNE klasy (biała lista)
        customizer.setAllowedImports(List.of(
                "java.util.Map",
                "java.util.List",
                "java.util.ArrayList",
                "java.util.HashMap",
                "java.util.Random",
                "java.math.BigDecimal",
                "java.math.MathContext",
                "java.util.Collections",
                "java.util.Arrays",
                "java.util.stream.Collectors",
                // DTOs and Enums explicitly allowed for direct imports
                "com.example.algorithm_analyzer.algorithms.AbstractAlgorithm",
                "com.example.algorithm_analyzer.problems.Problem",
                "com.example.algorithm_analyzer.problems.AbstractProblem",
                "com.example.algorithm_analyzer.dtos.IterationResult",
                "com.example.algorithm_analyzer.dtos.FinalMetricData",
                "com.example.algorithm_analyzer.dtos.ParameterDefinition",
                "com.example.algorithm_analyzer.enums.ParameterType"
        ));

        // 2. Zezwól na PAKIETY (biała lista)
        customizer.setAllowedStarImports(List.of(
                "com.example.algorithm_analyzer.algorithms",
                "com.example.algorithm_analyzer.problems",
                "com.example.algorithm_analyzer.dtos",
                "com.example.algorithm_analyzer.enums",
                "groovy.transform"
        ));

        // 3. Zablokuj niebezpieczne klasy
        customizer.setDisallowedReceivers(List.of(
                java.lang.System.class.getName(),
                java.lang.Runtime.class.getName()
        ));

        return customizer;
    }

    @Bean
    public CompilerConfiguration groovyCompilerConfig(SecureASTCustomizer customizer) {
        CompilerConfiguration config = new CompilerConfiguration();
        config.addCompilationCustomizers(customizer);
        return config;
    }
}