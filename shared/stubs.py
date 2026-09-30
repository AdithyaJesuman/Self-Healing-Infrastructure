import sys
import types as _types

def apply_stubs():
    # Create a lightweight kafka stub so `from kafka import ...` doesn't crash
    if "kafka" not in sys.modules:
        _kafka_stub = _types.ModuleType("kafka")
        class _StubClass:
            def __init__(self, *a, **kw): pass
            def __call__(self, *a, **kw): return self
            def __getattr__(self, name): return self
        _kafka_stub.KafkaConsumer = _StubClass
        _kafka_stub.KafkaProducer = _StubClass
        sys.modules["kafka"] = _kafka_stub

    # Stub influxdb_client similarly
    if "influxdb_client" not in sys.modules:
        _influx_stub = _types.ModuleType("influxdb_client")
        _influx_stub.InfluxDBClient = _StubClass
        _influx_stub.Point = _StubClass
        sys.modules["influxdb_client"] = _influx_stub
        _influx_write = _types.ModuleType("influxdb_client.client.write_api")
        _influx_write.SYNCHRONOUS = None
        sys.modules["influxdb_client.client"] = _types.ModuleType("influxdb_client.client")
        sys.modules["influxdb_client.client.write_api"] = _influx_write
