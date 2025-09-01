package com.example.algorithm_analyzer.repositories;

import com.example.algorithm_analyzer.entity.Graph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GraphRepository extends JpaRepository<Graph, Long> {
}
