import sqlite3
from datetime import datetime

DB_PATH: str = "backups.db"


def init_db() -> None:
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""
    CREATE TABLE IF NOT EXISTS backups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source TEXT,
        type TEXT,
        size_mb REAL,
        duration_sec REAL,
        status TEXT,
        timestamp TEXT
    )
    """)
    conn.commit()
    conn.close()


def add_backup_record(data: dict[str, any]) -> None:
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute(
        """
        INSERT INTO backups (source, type, size_mb, duration_sec, status, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
    """,
        (
            data.get("source"),
            data.get("type"),
            data.get("size_mb"),
            data.get("duration_sec"),
            data.get("status"),
            datetime.now().isoformat(),
        ),
    )
    conn.commit()
    conn.close()


def list_backups_records() -> list[dict[str, any]]:
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT * FROM backups ORDER BY timestamp DESC")
    rows = c.fetchall()
    conn.close()
    return [
        {
            "id": r[0],
            "source": r[1],
            "type": r[2],
            "size_mb": r[3],
            "duration_sec": r[4],
            "status": r[5],
            "timestamp": r[6],
        }
        for r in rows
    ]
