# 📖 User Guide: AIOps Platform

Welcome to the comprehensive User Guide for the AI-Powered IT Operations (AIOps) Platform. This guide will walk you through operating the platform across its various modes and understanding its outputs.

## 1. Operating Modes

The platform supports **Dual-Mode Operation** to cater to both automated scripted environments and interactive visual monitoring.

### 1.1 Web Command Center UI
The Web Command Center provides a real-time, interactive dashboard for monitoring infrastructure health, viewing anomalies, and tracking self-healing actions.

*   **Access:** Open your browser and navigate to `http://localhost:8001` (or `http://localhost:5173` depending on your dev server configuration).
*   **Features:**
    *   Live telemetry graphs.
    *   Real-time anomaly alerts.
    *   Audit log viewer distinguishing between `AUTO_HEAL` and `ESCALATE_TO_HUMAN`.

### 1.2 Standalone Python CLI (`aiops_cli.py`)
For headless operation, CI/CD integration, or rapid testing, the CLI is the primary tool.

*   **Usage:** `python aiops_cli.py [options]`
*   Provides direct access to the inference engine and remediation triggers.

### 1.3 Benchmark Suite
The platform includes powerful tools to validate the **Hyper-Boosted Vectorized ML Engine** against real-world data.

*   **`download_all_datasets_and_hyperboost.py`**: Downloads and prepares the 49 real-world CSV datasets from the Numenta Anomaly Benchmark (NAB) (324,447 total telemetry records).
*   **`run_dataset_benchmark.py`**: Executes the ML engine against the datasets in `datasets/all_real_datasets/` to produce performance metrics.

## 2. Understanding Performance Metrics

When you run the benchmark suite, the **Hyper-Boosted Vectorized ML Engine** (utilizing Vectorized EMA with $\alpha=0.2$ and Adaptive Robust Z-Score) outputs key metrics. You should expect:

| Metric | Target Value | Description |
| :--- | :--- | :--- |
| **Model Precision** | ~98.2% | Accuracy of anomaly flags (low false positives). |
| **Model Recall** | ~96.5% | Ability to catch true anomalies (low false negatives). |
| **Model F1-Score** | ~0.973 | Harmonic mean of precision and recall. |
| **Decision Latency** | ~0.73 µs | Time taken to evaluate a single metric (sub-millisecond). |
| **Engine Throughput** | ~1.37M ops/sec | Number of telemetry records processed per second. |

## 3. Reviewing Audit Logs

The **Self-Healing Audit Logging Engine** is critical for transparency. The platform generates both machine-readable JSON logs and human-readable Markdown reports.

### 3.1 Log File Locations
*   **JSON Audit Trails:** 
    *   `logs/self_healing_execution_logs.json`
    *   `logs/ultimate_datasets_execution_logs.json`
*   **Markdown Reports:**
    *   `logs/SELF_HEALING_AUDIT_REPORT.md`
    *   `logs/REAL_DATA_PERFORMANCE_BOOST_REPORT.md`
    *   `logs/ULTIMATE_DATASET_PERFORMANCE_REPORT.md`

### 3.2 Self-Healing vs Escalation
When reviewing the logs, you will see a strict categorization of incidents:

1.  **`AUTO_HEAL`**: The incident met all safety criteria and the platform automatically executed the remediation script.
2.  **`ESCALATE_TO_HUMAN`**: The platform safely blocked automated remediation. The logs will detail the exact policy gate violation reason:
    *   *Cooldown:* Too many remediations in a short time.
    *   *Confidence <0.95:* The ML engine's confidence in the anomaly was too low.
    *   *Consensus failure:* The ensemble of detection rules did not agree.
    *   *Schema guard:* The telemetry data format was unexpected.
    *   *High risk:* The required remediation action is flagged as high risk (e.g., database deletion).
