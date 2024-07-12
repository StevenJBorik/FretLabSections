import logging
from flask import current_app, g
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import text
from datetime import datetime
import requests
from queue import Queue
from threading import Thread, Event
import time
import json
from . import db  # Import db from your main package

class BatchDatabaseHandler(logging.Handler):
    def __init__(self, app, batch_size=10, flush_interval=5):
        super().__init__()
        self.queue = Queue()
        self.batch_size = batch_size
        self.flush_interval = flush_interval
        self.stop_event = Event()
        self.worker = Thread(target=self.process_queue)
        self.worker.start()
        self.app = app

    def emit(self, record):
        self.queue.put(record)
        if self.queue.qsize() >= self.batch_size:
            self.flush()

    def flush(self):
        if self.queue.empty():
            return
        batch = []
        while not self.queue.empty() and len(batch) < self.batch_size:
            batch.append(self.queue.get())
        self.write_to_db(batch)

    def write_to_db(self, batch):
        with self.app.app_context():
            try:
                for record in batch:
                    log_entry = self.format(record)
                    context = getattr(record, 'context', None)
                    print(f"Attempting to log: level={record.levelname}, message={log_entry[:50]}..., context={context}")  # Debug print
                    
                    query = text("INSERT INTO logs (level, message, context, timestamp, service_name) VALUES (:level, :message, :context, :timestamp, :service_name)")
                    
                    db.session.execute(query,
                        {
                            "level": record.levelname or "INFO",
                            "message": log_entry or "No message",
                            "context": json.dumps(context) if context is not None else "{}",
                            "timestamp": datetime.utcnow(),
                            "service_name": "fretlabs_backend"
                        }
                    )
                db.session.commit()
                print(f"Successfully logged {len(batch)} records")  # Debug print
            except Exception as e:
                print(f"Failed to log to database: {str(e)}")  # Temporary print for debugging
                current_app.logger.error(f"Failed to log to database: {str(e)}")

    def process_queue(self):
        while not self.stop_event.is_set():
            self.flush()
            time.sleep(self.flush_interval)

    def close(self):
        self.stop_event.set()
        self.worker.join()
        self.flush()
        super().close()

class SigNozHandler(logging.Handler):
    def __init__(self, app):
        super().__init__()
        self.app = app

    def emit(self, record):
        if record.levelname not in ["ERROR", "CRITICAL"]:
            return  # Only send error and critical logs to SigNoz
        log_entry = self.format(record)
        try:
            log_data = {
                "resourceLogs": [
                    {
                        "resource": {
                            "attributes": [
                                {
                                    "key": "service.name",
                                    "value": {"stringValue": "fretlabs_backend"}
                                }
                            ]
                        },
                        "scopeLogs": [
                            {
                                "scope": {
                                    "name": "backend_logger",
                                    "version": "1.0.0"
                                },
                                "logRecords": [
                                    {
                                        "timeUnixNano": f"{int(record.created * 1e9)}",
                                        "severityNumber": record.levelno,
                                        "severityText": record.levelname,
                                        "body": {"stringValue": log_entry},
                                        "attributes": [
                                            {"key": "module", "value": {"stringValue": record.module}},
                                            {"key": "funcName", "value": {"stringValue": record.funcName}},
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
            requests.post("http://signoz:4318/v1/logs", json=log_data)
        except requests.exceptions.RequestException as e:
            with self.app.app_context():
                current_app.logger.error("Failed to log to SigNoz: %s", e)
