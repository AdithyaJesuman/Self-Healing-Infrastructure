import json
import random
import re

with open('shared/incident_corpus.py', 'r') as f:
    text = f.read()

services = ['checkout-service', 'order-service', 'inventory-service', 'notification-service', 'postgres-primary', 'redis-cache']
count = 0

def repl(m):
    global count
    count += 1
    new_svc = services[count % len(services)] if count > 5 else 'payment-api'
    return f'"service": "{new_svc}"'

text2 = re.sub(r'"service":\s*"payment-api"', repl, text)

with open('shared/incident_corpus.py', 'w') as f:
    f.write(text2)

print(f"Replaced {count} occurrences.")
