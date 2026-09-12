# AIOps Platform - User Guide

Welcome to the User Guide for the AIOps Autonomous Self-Healing Platform. This document provides a comprehensive walkthrough for interacting with the system in both its Website (Docker) mode and its Standalone (CLI) mode.

## System Architecture

```mermaid
flowchart LR
    UI[Command Center UI] <--> API[API Gateway]
    CLI[Python CLI] <--> Core[10-Layer Pipeline]
    
    API <--> Core
    
    subgraph Data Layer
        Kafka[Apache Kafka]
        TSDB[(InfluxDB)]
        Graph[(Neo4j)]
        Vector[(ChromaDB)]
    end
    
    Core <--> Data Layer
```

## Service Port Mapping

When running in Website/Docker mode, the following ports are exposed on your host machine:

| Service | Port | Description |
|---|---|---|
| Command Center UI | 5173 | React/Vite Frontend (accessed via gateway at 8001/5173 depending on config) |
| API Gateway | 8000 | FastAPI REST interface |
| InfluxDB | 8086 | Time-series database |
| Neo4j | 7474 / 7687 | HTTP / Bolt interfaces for Knowledge Graph |
| ChromaDB | 8000 | Vector Database (internal mapping) |
| Kafka | 9092 | Event bus |
| Zookeeper | 2181 | Kafka dependency |
| Grafana | 3000 | Optional visualization dashboard |

## Web UI Walkthrough (Command Center)

The React-based Command Center provides a single pane of glass for the AIOps platform. Access it at `http://localhost:5173` (or `http://localhost:8001/5173` depending on your routing setup).

### 1. Dashboard (/)
The main landing page displaying real-time telemetry metrics, recent anomaly flags, and overall system health score.

### 2. Active Incidents (/incidents)
Displays currently open incidents, their severity, and the diagnosis provided by the Multi-Agent Brain.

### 3. Knowledge Graph (/topology)
A visual representation of the microservice architecture queried from Neo4j. Shows dependencies and highlights nodes currently experiencing high latency or error rates.

### 4. Digital Twin (/twin)
Allows users to manually test remediation commands (e.g., `increase_db_pool_size`) against current telemetry to see a mathematical projection of the outcome before running it in production.

### 5. Policy Engine (/policies)
Toggle autonomous mode. When enabled, the system will execute fixes automatically if they pass the 5 safety gates. When disabled, it requires human approval.

### 6. Post-Mortems (/reports)
View automatically generated Markdown reports of past incidents, detailing timeline, root cause, and remediation steps taken.

### 7. Chaos Engineering (/chaos)
Inject controlled faults into the system to test the platform's diagnostic accuracy and observe the autonomous self-healing in real-time.

## CLI Mode Usage Guide

The Standalone Python CLI (`aiops_cli.py`) bypasses Kafka and Docker, running the 10-layer pipeline entirely in memory. This is perfect for quick testing, CI/CD pipelines, or resource-constrained environments.

To launch the interactive menu, run:
```bash
python aiops_cli.py
```

### Direct CLI Commands

You can also pass arguments directly to the CLI to bypass the interactive menu:

*   `python aiops_cli.py pipeline` 
    Runs the full 10-layer pipeline once, fetching system metrics, analyzing them, and outputting the result.
*   `python aiops_cli.py chaos <fault_type>`
    Injects a specific fault and immediately runs the diagnostic pipeline. Supported faults include `cpu_spike`, `memory_leak`, `db_latency`.
*   `python aiops_cli.py incidents`
    Browse the historical incident memory (mocked from ChromaDB in CLI mode).
*   `python aiops_cli.py qa`
    Runs 15 specific Quality Assurance SRE scenarios against the Multi-Agent brain to verify deterministic diagnosis accuracy.
*   `python aiops_cli.py monitor`
    Streams live metrics to the console in a continuous loop.
*   `python aiops_cli.py status`
    Prints the system architecture and current health overview.
*   `python aiops_cli.py twin <command>`
    Simulates a remediation command (e.g., `python aiops_cli.py twin increase_db_pool_size`) against current baseline metrics.
*   `python aiops_cli.py detect`
    Runs only Layer 0-2 (Telemetry to Anomaly Detection).
*   `python aiops_cli.py diagnose`
    Runs the Multi-Agent pipeline against a mocked anomaly payload.

## API Endpoint Reference

The API Gateway (`localhost:8000`) provides REST access to the platform:

*   `GET /health` - System status.
*   `GET /api/v1/metrics/current` - Latest telemetry data.
*   `POST /api/v1/chaos/inject` - Inject a fault (Body: `{"type": "cpu_spike", "duration": 60}`).
*   `GET /api/v1/incidents/active` - List ongoing anomalies.
*   `POST /api/v1/remediate/approve` - Human approval for a pending fix.
*   `GET /api/v1/topology` - Fetch Neo4j graph data in JSON format.
*   `POST /api/v1/twin/simulate` - Run the queueing theory simulator.

## Configuration Guide

System behavior can be configured via environment variables or a `.env` file in the root directory:

*   `AIOPS_MODE`: `production` (uses external DBs) or `standalone` (in-memory).
*   `KAFKA_BROKER`: Address of the Kafka broker (default: `localhost:9092`).
*   `AUTONOMOUS_MODE`: `true` or `false`. If true, bypasses manual approval gate.
*   `ANOMALY_THRESHOLD`: Strictness of the Isolation Forest (default: `0.05`).
*   `NEO4J_URI`, `NEO4J_USER`, `NEO4J_PASS`: Graph DB credentials.

## Troubleshooting

**Kafka connectivity issues:**
Ensure Zookeeper is running and healthy. Check Docker logs: `docker logs kafka`.

**UI not loading metrics:**
Ensure the API Gateway is running and CORS is configured correctly. Check the network tab in your browser for failing `/api/v1/` calls.

**False positive anomalies:**
The Isolation Forest needs a warmup period. If alerting is too noisy immediately upon startup, wait 5 minutes for the model to establish a proper baseline of "normal" behavior, or adjust the `ANOMALY_THRESHOLD` variable.

**Out of memory errors:**
Docker Compose runs 10+ services. Ensure your Docker Desktop / Docker Engine is allocated at least 8GB of RAM. If resource constrained, consider testing with the CLI mode instead.
