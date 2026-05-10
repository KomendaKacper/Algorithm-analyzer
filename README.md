# 🧠 Algorithm Analyzer

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Java](https://img.shields.io/badge/Java-21-orange?logo=openjdk)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-brightgreen?logo=springboot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-2024-blue?logo=react)](https://react.dev/)

A professional analytical platform designed for the **behavioral analysis of optimization algorithms**. The project provides a unified environment to study, compare, and visualize how different metaheuristics perform on various combinatorial optimization problems.

---

## 📖 Project Overview

**Algorithm Analyzer** is an engineering project developed at the **AGH University of Krakow**. It aims to bridge the gap between theoretical algorithmics and practical performance by providing deep insights into algorithm dynamics such as:
*   **Convergence** speed and local optima traps.
*   **Stability** across multiple runs.
*   The **Exploration-Exploitation** balance.

The platform is built on an **extensible architecture**, allowing users to add their own algorithms and problems in real-time using **Groovy scripts** without modifying the core source code.

### 🖼️ Screenshots
| | |
|---|---|
| ![Dashboard](https://github.com/user-attachments/assets/d0c5de49-cbb7-497c-b9a3-19f4d7f009f2) | ![Analysis](https://github.com/user-attachments/assets/a57fb69f-4ed6-482e-a972-6885e025480c) |
| ![Charts](https://github.com/user-attachments/assets/65b2fdc2-c8f0-497c-8001-bba5c109d357) | ![Code Editor](https://github.com/user-attachments/assets/1ca208f4-cdca-4bc3-9bb5-008ffed29363) |

---

## 🛠️ Tech Stack

### Backend
*   **Java 21 (LTS)**: High-performance core for complex calculations.
*   **Spring Boot**: REST API and dependency injection.
*   **Groovy**: Scripting engine for dynamic hot-swapping of code.
*   **Maven**: Build automation and dependency management.
*   **Docker**: Containerization for consistent environments.

### Frontend
*   **React**: Modern, component-based user interface.
*   **Recharts**: Interactive and responsive data visualizations.
*   **CodeMirror**: In-browser code editor with syntax highlighting.
*   **Tailwind CSS**: Flexible, modern layouts with Dark Mode support.

---

## ✨ Key Features

*   🚀 **Reference Algorithms**: Built-in Ant Colony Optimization (ACO), Simulated Annealing (SA), and Tabu Search (TS).
*   📦 **Reference Problems**: Standard TSP (Traveling Salesman) and Knapsack Problem implementations.
*   📊 **Advanced Visualizations**:
    *   **Convergence Charts**: Track best scores over iterations.
    *   **Search Trajectory**: Force-directed graphs showing the algorithm's path.
    *   **Acceptance Probability**: Real-time monitoring of stochastic decisions.
*   📈 **Statistical Module**: Run batch tests (up to 100 iterations) to analyze Mean, Std Dev, and Quality-vs-Time trade-offs.
*   🧩 **Dynamic UI**: Automated generation of configuration panels based on algorithm parameters.

---

## 🏗️ Architecture

The system follows a **Multi-layered Client-Server model**:

1.  **Presentation Layer**: React-based SPA for telemetry visualization.
2.  **Application Layer**: Spring Boot server orchestrating optimization, thread safety, and compilation.
3.  **Strategy & Template Patterns**: Ensures all custom algorithms adhere to a strict "contract" for automatic monitoring.

---

## 🚀 Getting Started

The project uses **Multi-stage builds** to ensure a "Write Once, Run Anywhere" experience.

### Prerequisites
*   Docker & Docker Compose

### Installation
1.  **Clone the repository:**
    ```bash
    git clone https://github.com/KomendaKacper/Algorithm-analyzer.git
    cd Algorithm-analyzer
    ```

2.  **Run with Docker:**
    ```bash
    docker-compose up -d --build
    ```

3.  **Access the app:**
    Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 👤 Author

**Kacper Komenda**
*   **Degree Project**: AGH University of Krakow, 2026
*   **GitHub**: [@KomendaKacper](https://github.com/KomendaKacper)
