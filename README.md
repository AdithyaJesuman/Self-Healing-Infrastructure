# AIOps Autonomous Self-Healing Platform

![Status](https://img.shields.io/badge/Status-Active-success.svg)
![Architecture](https://img.shields.io/badge/Architecture-Event--Driven-blue.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)
![Python](https://img.shields.io/badge/Python-3.11-blue.svg)
![React](https://img.shields.io/badge/React-18-61dafb.svg)
![Platform](https://img.shields.io/badge/Platform-Docker%20%7C%20Kubernetes-orange.svg)

## Executive Summary

The **AIOps Autonomous Self-Healing Platform** is an enterprise-grade, event-driven infrastructure monitoring and autonomous self-healing system. Developed as a comprehensive capstone project, this platform addresses the critical challenge of modern Site Reliability Engineering (SRE): reducing Mean Time to Resolution (MTTR) without introducing the risks associated with non-deterministic AI remediation. 

By employing a deterministic multi-agent brain backed by machine learning for anomaly detection, causal discovery, and a digital twin queueing theory simulator, the platform achieves zero-hallucination, sub-millisecond root cause analysis and safe autonomous remediation.

## What Makes This Novel?

While commercial tools like Datadog, Splunk, or Dynatrace provide excellent observability, they often stop at alerting or rely on non-deterministic LLMs for remediation advice. This platform introduces several novel paradigms:

1. **Deterministic Multi-Agent Brain**: Unlike generative AI pipelines that can hallucinate dangerous infrastructure commands, this uses a deterministic rules-engine over 15 SRE archetypes (0% hallucination, 0.037ms latency).
2. **Digital Twin Simulation via Queueing Theory**: Before any fix is executed, a mathematical model simulates the fix against the current load. If the twin predicts failure, the fix is aborted.
3. **Autonomous Chaos Engineering (Active Learning)**: The system can autonomously inject faults (e.g., CPU spikes, memory leaks) into itself to validate its own diagnostic pathways and populate its incident memory.
4. **Federated Causal Knowledge Graph**: A Neo4j-backed graph tracking 8 core services, their dependencies, and the calculated blast radius of any node failure.
5. **True Dual-Mode Operation**: Runs as a full Docker-Compose orchestrated microservice suite with a React Web UI, or as a standalone lightweight Python CLI tool for embedded environments.

## 10-Layer Architecture Pipeline

```mermaid
flowchart TD
    subgraph Layer 0-3: Observability & Detection
        L0[Layer 0: Telemetry Collector] --> L1
        L1[Layer 1: Feature Engineering] --> L2
        L2[Layer 2: Anomaly Detection] --> L3
        L3[Layer 3: Signal Predictor]
    end

    subgraph Layer 4-6: Diagnosis & Context
        L3 --> L4
        L4[Layer 4: Causal Discovery] --> L5
        L5[Layer 5: Multi-Agent Brain]
        L6[(Layer 6: Knowledge Graph)] -. Context .-> L5
    end

    subgraph Layer 7-9: Remediation & Reporting
        L5 --> L7
        L7[Layer 7: Digital Twin Simulator] --> L8
        L8[Layer 8: Policy Engine] --> L9
        L9[Layer 9: Post-Mortem Generator]
    end
```

## Two Modes of Operation

### 1. Website Mode (Microservices)
Runs the full event-driven architecture using Kafka, FastAPI, React, and various databases.
```bash
# Start all infrastructure and microservices
docker-compose up -d

# Access the Command Center UI:
# http://localhost:8001/5173
```

### 2. Standalone Python CLI Mode
Runs the exact same 10-layer pipeline completely in-memory, without Docker or databases. Ideal for CI/CD testing or embedded edge devices.
```bash
# Install dependencies
pip install -r requirements.txt

# Launch interactive CLI
python aiops_cli.py
```

## Technology Stack & Rationale

| Domain | Technology | Rationale |
|---|---|---|
| **Backend API** | FastAPI (Python) | High performance, native async support, automated OpenAPI docs. |
| **Event Bus** | Apache Kafka | Decouples services, ensures reliable event delivery for high-throughput metrics. |
| **Frontend** | React 18, Vite, Mantine v7 | Fast compilation, robust component library for complex dashboards. |
| **Time Series DB** | InfluxDB | Optimized for writing and querying high-velocity telemetry data. |
| **Graph DB** | Neo4j | Essential for mapping microservice dependencies and calculating blast radius. |
| **Vector DB** | ChromaDB | Used as an "Incident Memory" to find semantically similar past outages. |
| **Machine Learning** | Scikit-learn (Isolation Forest) | Highly effective for unsupervised anomaly detection in high-dimensional spaces. |

## Repository Structure
```text
aiops-platform-starter/
├── aiops_cli.py                # Standalone CLI entrypoint
├── docker-compose.yml          # Infrastructure orchestration
├── requirements.txt            # Python dependencies
├── docs/                       # Architectural documentation
├── services/                   # Microservice source code
│   ├── anomaly-detection/      # Isolation Forest & Feature eng
│   ├── api-gateway/            # FastAPI entrypoint
│   ├── causal-discovery/       # Granger causality approximations
│   ├── collector/              # Psutil telemetry gathering
│   ├── command-center/         # React/Vite Frontend
│   ├── digital-twin/           # Queueing theory simulator
│   ├── forecasting/            # Capacity wall prediction
│   ├── incident-memory/        # ChromaDB integration
│   ├── knowledge-graph/        # Neo4j schema and data
│   ├── log-intelligence/       # NLP log analysis
│   ├── multi-agent/            # Deterministic SRE brain
│   └── policy-engine/          # Safety gates and execution
├── shared/                     # Shared models and 50+ incident corpus
└── tests/                      # Pytest suite
```

## Feature Highlights
- **12-Dimensional Feature Vectors**: Calculates derived metrics like `cpu_per_request`, `memory_leak_slope`, and Little's Law residuals.
- **5-Gate Safety Policy**: Every fix must pass Cooldown, Confidence, Corroboration, Availability, and Risk gates.
- **Auto-Generated Post Mortems**: Markdown incident reports are generated automatically via Layer 9.
- **Stress-Tested Performance**: Proven to handle 10,000 events in under 5 seconds in integration testing.

## Screenshots / Demo
*(Placeholder for actual application screenshots)*
- **Command Center Dashboard**: `![Dashboard UI](./docs/assets/dashboard.png)`
- **CLI Interactive Mode**: `![CLI Menu](./docs/assets/cli.png)`
- **Knowledge Graph Visualization**: `![Neo4j Graph](./docs/assets/graph.png)`

## Design Thought Process
For an in-depth look at why specific algorithms, architectures, and design patterns were chosen, please read the [THOUGHT PROCESS](THOUGHT_PROCESS.md) document.

## Contributing
This is an academic capstone project. While PRs are welcome, the primary goal is architectural demonstration. Please ensure all tests pass (`pytest tests/test_aiops_platform.py`) before opening a PR.
