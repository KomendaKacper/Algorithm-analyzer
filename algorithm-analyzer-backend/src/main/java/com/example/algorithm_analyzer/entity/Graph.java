package com.example.algorithm_analyzer.entity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.*;

@Entity
@NoArgsConstructor
@Getter
@Setter
@Table(name = "graphs")
public class Graph {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private boolean directed;

    @OneToMany(mappedBy = "graph", cascade =  CascadeType.ALL, orphanRemoval = true)
    private Set<Node> nodes = new HashSet<>();
}
