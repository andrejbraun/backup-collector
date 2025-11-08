from robyn import Robyn
import json
from .database import add_backup_record, list_backups_records

app = Robyn(__file__)


@app.post("/api/backups")
async def add_backup(request) -> dict[str, str]:
    data: dict[str, any] = json.loads(request.body)
    add_backup_record(data)
    return {"status": "ok"}


@app.get("/api/backups")
async def list_backups(request) -> dict[str, any]:
    backups = list_backups_records()
    return {"backups": backups}
