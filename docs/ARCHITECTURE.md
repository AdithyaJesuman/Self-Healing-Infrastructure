# 🏛️ System Architecture: Enterprise AIOps Autonomous Platform

This document provides the complete technical architectural specification for the **AIOps Autonomous Self-Healing Platform**. Designed for high-concurrency microservices, cloud infrastructure, and Kubernetes environments, the platform features a **10-Layer Hybrid Pipeline** combining vectorized multi-metric machine learning, deterministic multi-agent orchestration, an M/M/k Digital Twin queueing simulator, and a 5-Gate SRE safety policy engine.

---

## 🏗️ High-Level System Architecture Diagram

```mermaid
flowchart TD
    subgraph DataIngestion["1. Data Ingestion & Collector Layer"]
        DS1["49 NAB Datasets (324k Records)"]
        DS2["Master All-Metrics Dataset<br/>(master_all_metrics_incident_dataset.csv)"]
        DS3["Sample Upload CSV Suite<br/>(sample_upload_csvs/*.csv)"]
        DS4["Live Telemetry / Prometheus Exporters"]
        
        DS1 & DS2 & DS3 & DS4 --> L0["Layer 0: Telemetry Collector<br/>(8 Raw Telemetry Metrics)"]
    end

    subgraph FeatureML["2. Observability & Feature Engineering"]
        L0 --> L1["Layer 1: NumPy Feature Eng<br/>(Little's Law Residual & CPU-per-Request Ratio)"]
        L1 --> L2["Layer 2: Ensemble Detector<br/>(Isolation Forest + Robust Z-Scores)"]
        L2 --> L3["Layer 3: Signal Predictor<br/>(Time-to-Failure & Capacity Wall)"]
    end

    subgraph BrainGraph["3. Multi-Metric Scoring & Multi-Agent Brain"]
        L3 --> L4["Layer 4: Multi-Metric Vector Engine<br/>(15 Failure Archetypes Scoring Matrix)"]
        L4 --> L5["Layer 5: Deterministic Multi-Agent Brain<br/>(Monitoring, Diagnosis, Forecast, Plan)"]
        L6["Layer 6: Knowledge Graph BFS<br/>(Neo4j Topology & Blast Radius)"] -. Topology .-> L5
    end

    subgraph SafetyAction["4. Simulation, Safety & Execution"]
        L5 --> L7["Layer 7: Digital Twin Simulator<br/>(M/M/k Queueing Model Predictions)"]
        L7 --> L8["Layer 8: 5-Gate Safety Policy Engine<br/>(Cooldown, Conf, Consensus, Schema, Risk)"]
        L8 --> L9["Layer 9: Post-Mortem & Audit Logger<br/>(JSON Audit Logs & Markdown Reports)"]
    end

    subgraph Interfaces["5. Dual-Mode Interfaces & API Ecosystem"]
        L9 --> UI["React Command Center UI<br/>(CsvAnalyzer.tsx + Recharts)"]
        L9 --> CLI["Standalone Terminal CLI<br/>(aiops_cli.py)"]
        API["FastAPI Gateway (/api/*)"] <---> UI & CLI
    end
```

---

## 🔬 Deep 10-Layer System Specification

### Layer 0: Telemetry Collector
Ingests metric streams containing **8 raw telemetry metrics**:
1. $\text{CPU Utilization (\%)}$ ($0 - 100\%$)
2. $\text{Memory Utilization (\%)}$ ($0 - 100\%$)
3. $\text{Response Time (ms)}$ ($0 - 30,000\,\text{ms}$)
4. $\text{Error Rate (\%)}$ ($0 - 100\%$)
5. $\text{Active Connections}$ ($0 - 10,000$)
6. $\text{Throughput (RPS)}$ ($0 - 50,000\,\text{QPS}$)
7. $\text{Queue Depth}$ ($0 - 100,000$)
8. $\text{DB Query Time (ms)}$ ($0 - 30,000\,\text{ms}$)

Tagging metadata incorporates `company_id`, `tenant_id`, `service_name`, and `timestamp` for multi-tenant isolation.

---

### Layer 1: NumPy Feature Engineering
Computes 4 derived statistical features over sliding time windows:
* **Little's Law Residual**:
  $$R_{\text{Little}} = \text{clamp}\left(v_{\text{conn}} - (v_{\text{rps}} \cdot v_{\text{rt}}), 0, 1\right)$$
  Measures connection accumulation relative to actual served throughput.
* **CPU-per-Request Ratio**:
  $$R_{\text{cpu\_req}} = \text{clamp}\left(\frac{v_{\text{cpu}}}{\max(0.2, v_{\text{rps}})}, 0, 1\right)$$
  Isolates worker efficiency regressions from linear traffic scaling.
* **Memory Leak Gradient**:
  $$\text{Slope} = \text{Polyfit1D}(t, \text{Memory}, \text{window}=10)$$
* **Tail Skewness**:
  $$\text{Skew} = \text{ResponseTime} - \text{RollingMean}(\text{ResponseTime})$$

---

### Layer 2: Ensemble Anomaly Detector
Combines three complementary detection paradigms:
1. **200-Tree Isolation Forest** ($\text{contamination}=0.04$) on C-arrays.
2. **Adaptive Robust Z-Score** using Median Absolute Deviation (MAD):
   $$\text{Robust Z} = \frac{x_i - \text{Median}(X)}{1.4826 \cdot \text{MAD}(X)} > 3.0$$
3. **Multi-Vector Static Bounds**: Triggers when any normalized vector component breaches critical operational boundaries.

---

### Layer 3: Signal Predictor & Capacity Wall Engine
Estimates remaining Time-to-Failure (TTF) in seconds using linear extrapolation of metric slopes:

$$\text{TTF} = \frac{\text{CapacityLimit} - \text{CurrentValue}}{\text{MetricSlope}}$$

If $\text{TTF} < 60\,\text{seconds}$, the incident severity is upgraded to `CRITICAL`.

---

### Layer 4: Multi-Metric Composite Vector Scoring Engine
Evaluates telemetry vectors against **15 failure archetypes** using a matrix inner-product scoring model:

$$\mathbf{v} = [v_{\text{cpu}}, v_{\text{mem}}, v_{\text{rt}}, v_{\text{err}}, v_{\text{conn}}, v_{\text{queue}}, v_{\text{db}}, v_{\text{rps}}, R_{\text{Little}}, R_{\text{cpu\_req}}]^T \in [0, 1]^{10}$$

$$S_k = \mathbf{w}_k^T \mathbf{v} + \text{Bias}_k \quad \text{for } k \in \{1, \dots, 15\}$$

| Failure Archetype | Dominant Vector Weights | Primary Root Cause | Remediation Playbook |
|---|---|---|---|
| `db_connection_pool_exhaustion` | $0.55 v_{\text{conn}} + 0.35 v_{\text{db}} + 0.10 R_{\text{Little}}$ | Database socket depletion | `increase_db_pool_size` |
| `cpu_saturation` | $0.75 v_{\text{cpu}} + 0.25 v_{\text{rt}}$ | Compute core starvation | `horizontal_scale_out` |
| `memory_leak` | $0.75 v_{\text{mem}} + 0.15 v_{\text{rt}} + 0.10 v_{\text{cpu}}$ | Monotonic heap accumulation | `staggered_restart` |
| `network_partition` | $0.75 v_{\text{err}} + 0.25 v_{\text{rt}}$ | Upstream packet loss | `trip_circuit_breaker` |
| `kafka_consumer_lag` | $0.75 v_{\text{queue}} + 0.15 v_{\text{rt}} + 0.10 (1 - v_{\text{rps}})$ | Backlog processing delay | `scale_consumer_group` |
| `capacity_wall_breach` | $0.45 v_{\text{rps}} + 0.35 v_{\text{rt}} + 0.20 R_{\text{cpu\_req}}$ | Traffic surge capacity limit | `provision_buffer_instances` |
| `hardware_thermal_throttling` | $0.45 v_{\text{cpu}} + 0.45 v_{\text{rt}} + 0.10 v_{\text{err}}$ | CPU thermal clock drop | `throttle_clock_speed` |
| `latency_degradation` | $0.65 v_{\text{rt}} + 0.20 v_{\text{db}} + 0.15 (1 - v_{\text{err}})$ | Cache miss / slow queries | `optimize_cache` |

---

### Layer 5: Deterministic Multi-Agent Brain & Consensus Engine
Executes 4 specialized deterministic agents:
1. **Monitoring Agent**: Evaluates metric anomaly confidence ($\ge 0.60$).
2. **Diagnosis Agent**: Evaluates archetype scoring matrix to isolate root cause.
3. **Forecast Agent**: Estimates business impact severity and BLAST radius.
4. **Planner Agent**: Selects playbook action sorted by historical success rate.

#### Multi-Agent Consensus Evaluation:
Calculates standard deviation across agent confidence scores:

$$\sigma_{\text{agents}} = \sqrt{\frac{1}{N} \sum_{i=1}^N (c_i - \bar{c})^2}$$

If $\sigma_{\text{agents}} < 0.15$, the decision is marked as `HIGH_CONSENSUS`.

---

### Layer 6: Knowledge Graph & Blast Radius Engine
Maintains system microservice topology in Neo4j (`payment-api` $\rightarrow$ `postgres`, `redis`, `kafka`). Uses Breadth-First Search (BFS) up to 2 hops to calculate downstream dependency impact before executing remediations.

---

### Layer 7: Digital Twin Queueing Theory Simulator
Simulates proposed fixes using an **M/M/k Queueing Model**:

$$\lambda_{\text{effective}} = \text{RPS} \cdot (1 - \text{ShedRate}), \quad W_q = \frac{P_L}{k\mu - \lambda_{\text{effective}}}$$

Predicts post-fix response time, error rate, and connection drop prior to production execution.

---

### Layer 8: 5-Gate Safety Policy Engine
Evaluates 5 mandatory SRE safety gates sequentially:

```mermaid
flowchart LR
    G1["1. Cooldown Gate<br/>(Last fix > 300s)"] --> G2["2. Confidence Gate<br/>(Score >= 0.95)"]
    G2 --> G3["3. Consensus Gate<br/>(std_dev < 0.15)"]
    G3 --> G4["4. Schema Guard<br/>(Valid Playbook)"]
    G4 --> G5["5. Risk Guard<br/>(Reversible Action)"]
    G5 -->|5/5 Passed| PASS["AUTO_HEAL Execution"]
    G1 & G2 & G3 & G4 & G5 -->|Any Gate Fails| ESC["ESCALATE_TO_HUMAN"]
```

---

### Layer 9: Post-Mortem & Audit Logging Engine
Generates structured JSON execution logs (`logs/self_healing_execution_logs.json`) and auto-formats Markdown incident reports with pre-fix vs post-fix metric validation.

---

## 🔄 End-to-End Execution Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor User as User / SRE
    participant WebUI as React Command Center (CsvAnalyzer.tsx)
    participant Gateway as FastAPI Gateway (main.py)
    participant Engine as Multi-Metric Vector Engine
    participant Twin as Digital Twin Simulator (M/M/k)
    participant Policy as 5-Gate Policy Engine
    participant Logs as Audit Log Store

    User->>WebUI: Upload CSV / Select Dataset
    WebUI->>Gateway: POST /api/upload-csv OR /api/analyze-dataset
    Gateway->>Engine: Process 8 Metrics + 2 Composite Signals
    Engine-->>Gateway: Matrix Scores & Recommended Fix
    Gateway-->>WebUI: Analysis JSON (Anomalies Table & Charts)
    User->>WebUI: Click "Simulate Fix Execution"
    WebUI->>Gateway: POST /api/simulate-fix-execution
    Gateway->>Twin: Calculate M/M/k Predicted Metrics
    Gateway->>Policy: Evaluate 5 Policy Gates
    Policy-->>Gateway: 5/5 Gates Passed (AUTO_HEALED)
    Gateway->>Logs: Write JSON Execution Log & Post-Mortem
    Gateway-->>WebUI: Simulation Results & Rendered Markdown
    WebUI-->>User: Display Glassmorphic Fix Simulation Modal
```

---

## 🔌 Microservice Connection Points Topology

```mermaid
flowchart LR
    subgraph K8s["Kubernetes Cluster / Docker Host"]
        P1["payment-api Pod"]
        P2["order-service Pod"]
        P3["inventory-service Pod"]
        P4["gateway-service Pod"]
    end

    subgraph Integration["Platform Integration Connectors"]
        C1["Prometheus Scraper / HTTP CSV Upload"]
        C2["Kafka Log & Trace Event Bus"]
        C3["Kube-API Topology Discovery"]
        C4["Kube-API / Docker Executor"]
    end

    subgraph Core["AIOps Core Platform Engine"]
        E1["10-Layer Hybrid Pipeline"]
    end

    P1 & P2 & P3 & P4 -->|Metrics| C1 --> E1
    P1 & P2 & P3 & P4 -->|Logs & Traces| C2 --> E1
    P1 & P2 & P3 & P4 -->|Pod Lifecycle| C3 --> E1
    E1 -->|Auto-Remediation| C4 -->|kubectl scale, rollout restart| P1 & P2 & P3 & P4
```

1. **Metric Telemetry Ingestion (`POST /api/upload-csv` & Kafka `raw-metrics`)**: Ingests high-frequency metrics.
2. **Log & Trace Ingestion (Kafka `logs-raw` & OpenTelemetry)**: Streams logs and distributed context headers.
3. **Topology Registration (`POST /api/v1/topology/register`)**: Dynamically updates Neo4j dependency graphs.
4. **Remediation Execution (Kube-API / Docker Socket / Webhooks)**: Executes approved `AUTO_HEAL` actions.
