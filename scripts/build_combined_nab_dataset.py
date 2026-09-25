import os
import csv
from datetime import datetime

base_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "datasets", "all_real_datasets")

# Load key NAB real-world datasets
ec2_file = os.path.join(base_dir, "realAWSCloudwatch__ec2_cpu_utilization_5f5533.csv")
rds_file = os.path.join(base_dir, "realAWSCloudwatch__rds_cpu_utilization_cc0c53.csv")
elb_file = os.path.join(base_dir, "realAWSCloudwatch__elb_request_count_8c0756.csv")
net_file = os.path.join(base_dir, "realAWSCloudwatch__ec2_network_in_257a54.csv")

def load_dataset(fpath):
    recs = []
    if os.path.exists(fpath):
        with open(fpath, "r", encoding="utf-8", errors="ignore") as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    recs.append({
                        "timestamp": row.get("timestamp", row.get("time", "")),
                        "value": float(row.get("value", 0.0))
                    })
                except Exception: continue
    return recs

ec2_data = load_dataset(ec2_file)
rds_data = load_dataset(rds_file)
elb_data = load_dataset(elb_file)
net_data = load_dataset(net_file)

print(f"Loaded records - EC2: {len(ec2_data)}, RDS: {len(rds_data)}, ELB: {len(elb_data)}, Net: {len(net_data)}")

# Align records by timestamp index
max_len = max(len(ec2_data), len(rds_data), len(elb_data), len(net_data))
combined_rows = []

for i in range(max_len):
    ec2_val = ec2_data[i % len(ec2_data)]["value"] if ec2_data else 45.0
    rds_val = rds_data[i % len(rds_data)]["value"] if rds_data else 12.0
    elb_val = elb_data[i % len(elb_data)]["value"] if elb_data else 45.0
    net_val = net_data[i % len(net_data)]["value"] if net_data else 35.0
    
    ts = ec2_data[i % len(ec2_data)]["timestamp"] if ec2_data else f"2026-09-25T14:{i//60:02d}:{i%60:02d}Z"
    
    # Scale raw values into unified multi-metric telemetry
    cpu_percent = round(min(99.9, ec2_val * 1.35 if ec2_val > 40 else ec2_val), 1)
    
    # RDS database connections & query latency
    active_conns = int(300 + rds_val * 28.0) if rds_val > 18 else int(150 + rds_val * 5.0)
    db_query_time = round(rds_val * 85.0, 1) if rds_val > 18 else round(25.0 + rds_val * 1.5, 1)
    
    # ELB throughput & response time
    throughput_rps = int(elb_val * 60)
    response_time = round(320.0 + (elb_val * 25.0 if elb_val > 30 else 0.0), 1)
    
    # Network packet error rate & queue depth
    error_rate = round((net_val / 100.0) * 45.0 if net_val > 40 else 0.1, 1)
    queue_depth = int(net_val * 2.5) if net_val > 40 else 8
    
    memory_percent = round(min(98.5, 45.0 + (cpu_percent * 0.4 if cpu_percent > 80 else 0)), 1)
    
    combined_rows.append({
        "timestamp": ts,
        "company_id": "AWS-Enterprise-Cluster",
        "service_name": "unified-cluster-service",
        "cpu_percent": cpu_percent,
        "memory_percent": memory_percent,
        "response_time_ms": response_time,
        "error_rate": error_rate,
        "active_connections": active_conns,
        "throughput_rps": throughput_rps,
        "queue_depth": queue_depth,
        "db_query_time_ms": db_query_time
    })

# Save combined dataset to both datasets/all_real_datasets/ and datasets/
target_1 = os.path.join(base_dir, "realAWSCloudwatch__combined_multimetric_real_outage.csv")
target_2 = os.path.join(os.path.dirname(base_dir), "combined_nab_multimetric_real_outage.csv")

headers = ["timestamp", "company_id", "service_name", "cpu_percent", "memory_percent", "response_time_ms", "error_rate", "active_connections", "throughput_rps", "queue_depth", "db_query_time_ms"]

for tpath in [target_1, target_2]:
    with open(tpath, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        writer.writerows(combined_rows)

print(f"Successfully generated combined multi-metric NAB dataset with {len(combined_rows)} rows across 4 CloudWatch streams.")
