package com.example.algorithm_analyzer.entity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "edges")
public class Edge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private double weight;

    @ManyToOne
    @JoinColumn(name = "from_node_id", nullable = false)
    private Node from;

    @ManyToOne
    @JoinColumn(name = "to_node_id", nullable = false)
    private Node to;
}