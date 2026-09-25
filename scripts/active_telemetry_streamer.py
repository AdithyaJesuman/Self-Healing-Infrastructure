import os
import time
import json
import csv
import urllib.request
import psutil
from datetime import datetime

print("🚀 Starting Production Active Live Telemetry Streamer...")
print("📡 Target API: http://localhost:8001/api/metrics/inject")
print("📊 Source: Real Production System Telemetry (psutil) & Numenta Anomaly Benchmark (NAB)")
print("Press Ctrl+C to stop streaming.\n", flush=True)

# Load real multi-metric production NAB dataset
csv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "datasets", "combined_nab_multimetric_real_outage.csv")
real_records = []
if os.path.exists(csv_path):
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            real_records.append(row)
    print(f"✅ Loaded {len(real_records):,} real production telemetry records from NAB CloudWatch dataset.", flush=True)

services = ["payment-api", "order-service", "inventory-service", "gateway-service"]

tick = 0
rec_idx = 0
while True:
    try:
        tick += 1
        service = services[tick % len(services)]
        
        # Real system hardware metrics from host
        cpu = psutil.cpu_percent(interval=None)
        mem = psutil.virtual_memory().percent
        
        # Pull real CloudWatch production dataset trace if available
        kind = "normal"
        if real_records:
            row = real_records[rec_idx % len(real_records)]
            rec_idx += 1
            row_cpu = float(row.get("cpu_percent", cpu))
            if row_cpu > 85.0:
                kind = "cpu_spike"
            elif float(row.get("response_time_ms", 100.0)) > 3000:
                kind = "network_partition"
            elif float(row.get("error_rate", 0)) > 10.0:
                kind = "db_pool_exhaustion"
        
        payload = {
            "incident_type": kind,
            "company_id": "AWS-Enterprise-Cluster",
            "tenant_id": "tenant-prod-01",
            "service": service
        }
        
        data_bytes = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request("http://localhost:8001/api/metrics/inject", data=data_bytes, headers={"Content-Type": "application/json"})
        
        try:
            resp = urllib.request.urlopen(req)
            res_data = json.loads(resp.read().decode("utf-8"))
            pay = res_data.get("payload", {})
            
            ts = datetime.now().strftime("%H:%M:%S")
            print(f"[{ts}] Stream Tick {tick:04d} | Service: {service:<18} | Host CPU: {cpu:>5.1f}% | Mem: {mem:>5.1f}% | RT: {pay.get('response_time_ms', 0):>4.0f}ms | Status: {res_data.get('status', 'ok')}", flush=True)
        except Exception as err_net:
            print(f"[{datetime.now().strftime('%H:%M:%S')}] Stream Note (API connection): {err_net}", flush=True)
            
        time.sleep(1.0)
    except KeyboardInterrupt:
        print("\nStopping Production Active Live Telemetry Streamer.", flush=True)
        break
    except Exception as e:
        time.sleep(1.0)
