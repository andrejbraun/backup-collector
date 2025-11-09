import os
import logging
from logging.handlers import RotatingFileHandler

def setup_logging():
    # Absoluter Pfad zum Logfile im Projektverzeichnis
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    log_path = os.path.join(base_dir, 'backup-collector.log')
    os.makedirs(base_dir, exist_ok=True)
    logger = logging.getLogger("backup_collector")
    # Entferne alle bestehenden Handler, um doppelte oder blockierende Handler zu vermeiden
    for h in list(logger.handlers):
        logger.removeHandler(h)
    logger.setLevel(logging.INFO)
    handler = RotatingFileHandler(log_path, maxBytes=2*1024*1024, backupCount=3)
    formatter = logging.Formatter('[%(asctime)s] %(levelname)s %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    # Auch auf Konsole loggen
    console = logging.StreamHandler()
    console.setFormatter(formatter)
    logger.addHandler(console)
    # Test-Logeintrag (wird nur beim Setup geschrieben)
    # import datetime
    # logger.info(f"[{datetime.datetime.now().isoformat()}] Logging initialisiert. Schreibe in Datei: {log_path}")
    for h in logger.handlers:
        if hasattr(h, 'flush'):
            h.flush()
    return logger
