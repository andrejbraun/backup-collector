from robyn import Response, Robyn
import json
import os
from .database import add_backup_record, list_backups_records, Backup

app = Robyn(__file__)


@app.post("/api/backups")
async def add_backup(request) -> dict[str, str]:
    data = json.loads(request.body)
    backup = Backup(
        database_type=data["database_type"],
        source_host=data["source_host"],
        backup_level=data.get("backup_level"),
        backup_method=data["backup_method"],
        program=data.get("program"),
        size_mb=float(data["size_mb"]),
        duration_sec=float(data["duration_sec"]),
        status=data["status"],
        created_at=data.get("created_at"),
    )
    add_backup_record(backup)
    return {"status": "ok"}


@app.get("/api/backups")
async def list_backups(request) -> dict[str, list]:
    backups = list_backups_records()
    return {"backups": [b.model_dump() for b in backups]}



STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
app.serve_directory("/static", STATIC_DIR)
# app.serve_directory("/", STATIC_DIR)

@app.get("/")
async def index(request):
    path = os.path.join(STATIC_DIR, "index.html")
    try:
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
        return Response(
            200,                 
            {"Content-Type": "text/html"},
            content,              
        )
    except FileNotFoundError:
        return Response(
            404,
            {"Content-Type": "text/plain"},
            "Dashboard not found", 
            )

# import os
# print("Current working dir:", os.getcwd())