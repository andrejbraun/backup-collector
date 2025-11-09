import sqlite3
from pydantic import BaseModel, field_validator
from datetime import datetime
from enum import Enum

DB_PATH = "data/backups.db"

class DatabaseType(str, Enum):
    MYSQL = "mysql"
    POSTGRESQL = "postgresql"
    ORACLE = "oracle"

class BackupLevel(str, Enum):
    FULL = "full"
    INCREMENTAL = "incremental"
    DIFFERENTIAL = "differential"
    OTHER = "other"

class BackupMethod(str, Enum):
    LOGICAL = "logical"
    PHYSICAL = "physical"
    DUMP = "dump"
    SNAPSHOT = "snapshot"
    OTHER = "other"

class Program(str, Enum):
    PG_DUMP = "pg_dump"
    MYSQLDUMP = "mysqldump"
    RMAN = "rman"
    PG_BACKREST = "pgBackrest"
    OTHER = "other"

class Status(str, Enum):
    SUCCESS = "success"
    FAILED = "failed"
    CANCELLED = "cancelled"

class Backup(BaseModel):
    id: int | None = None
    database_type: DatabaseType
    source_host: str
    backup_level: BackupLevel | None = None
    backup_method: BackupMethod | None = None
    program: Program | None = None
    size_mb: float | None = None
    duration_sec: float | None = None
    status: Status
    created_at: str

    @field_validator("created_at", mode="before")
    @classmethod
    def default_created_at(cls, v):
        return v or datetime.now().isoformat()

def backup_from_row(row: tuple) -> Backup:
    return Backup(
        id=row[0],
        database_type=row[1],
        source_host=row[2],
        backup_level=row[3],
        backup_method=row[4],
        program=row[5],
        size_mb=row[6],
        duration_sec=row[7],
        status=row[8],
        created_at=row[9],
    )

def backup_to_db_tuple(backup: Backup) -> tuple:
    return (
        backup.database_type,
        backup.source_host,
        backup.backup_level,
        backup.backup_method,
        backup.program,
        backup.size_mb,
        backup.duration_sec,
        backup.status,
        backup.created_at,
    )

def init_db() -> None:
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute(
        """
        CREATE TABLE IF NOT EXISTS backups (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            database_type TEXT,
            source_host TEXT,
            backup_level TEXT,
            backup_method TEXT,
            program TEXT,
            size_mb REAL,
            duration_sec REAL,
            status TEXT,
            created_at TEXT
        )
        """
    )
    conn.commit()
    conn.close()


def add_backup_record(backup: Backup) -> None:
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute(
        """
        INSERT INTO backups (database_type, source_host, backup_level, backup_method, program, size_mb, duration_sec, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        backup_to_db_tuple(backup),
    )
    conn.commit()
    conn.close()


def list_backups_records() -> list[Backup]:
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT * FROM backups ORDER BY created_at DESC")
    rows = c.fetchall()
    conn.close()
    return [backup_from_row(r) for r in rows]
