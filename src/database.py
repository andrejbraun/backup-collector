import sqlite3
from dataclasses import dataclass

DB_PATH: str = "backups.db"

@dataclass
class Backup:
    id: int | None # None for new records
    source: str
    type: str
    size_mb: float
    duration_sec: float
    status: str
    timestamp: str

def backup_from_row(row: tuple) -> Backup:
    return Backup(
        id=row[0],
        source=row[1],
        type=row[2],
        size_mb=row[3],
        duration_sec=row[4],
        status=row[5],
        timestamp=row[6],
    )

def backup_to_db_tuple(backup: Backup) -> tuple:
    return (
        backup.source,
        backup.type,
        backup.size_mb,
        backup.duration_sec,
        backup.status,
        backup.timestamp,
    )


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


def add_backup_record(backup: Backup) -> None:
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute(
        """
        INSERT INTO backups (source, type, size_mb, duration_sec, status, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        backup_to_db_tuple(backup),
    )
    conn.commit()
    conn.close()


def list_backups_records() -> list[Backup]:
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT * FROM backups ORDER BY timestamp DESC")
    rows = c.fetchall()
    conn.close()
    return [backup_from_row(r) for r in rows]
