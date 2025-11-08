from robyn import Robyn
import json
from .database import add_backup_record, list_backups_records, Backup

app = Robyn(__file__)


@app.post("/api/backups")
async def add_backup(request) -> dict[str, str]:
    data = json.loads(request.body)
    # Erstelle Backup-Objekt aus Daten, timestamp jetzt
    backup = Backup(
        id=None,
        source=data["source"],
        type=data["type"],
        size_mb=float(data["size_mb"]),
        duration_sec=float(data["duration_sec"]),
        status=data["status"],
        timestamp=data.get("timestamp"),
    )
    add_backup_record(backup)
    return {"status": "ok"}


@app.get("/api/backups")
async def list_backups(request) -> dict[str, list]:
    backups = list_backups_records()
    # Serialisiere Backup-Objekte zu dicts
    return {"backups": [b.model_dump() for b in backups]}
