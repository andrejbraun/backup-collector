from robyn import Response, Robyn
import json
import os
import logging
from .database import add_backup_record, list_backups_records, Backup


logger = logging.getLogger("backup_collector")

app = Robyn(__file__, 
            openapi_file_path=os.path.join(os.path.dirname(__file__), "../openapi.json")
            )


@app.post("/api/backups")
async def add_backup(request) -> dict[str, str]:
    try:
        data = json.loads(request.body)
        logger.info(f"POST /api/backups: {data}")
        backup = Backup(
            database_type=data["database_type"],
            source_host=data["source_host"],
            backup_level=data.get("backup_level"),
            backup_method=data.get("backup_method"),
            program=data.get("program"),
            size_mb=float(data["size_mb"]) if data.get("size_mb") is not None else None,
            duration_sec=float(data["duration_sec"]) if data.get("duration_sec") is not None else None,
            status=data["status"],
            created_at=data.get("created_at"),
        )
        add_backup_record(backup)
        logger.info(f"Backup gespeichert: {backup}")
        return {"status": "ok"}
    except Exception as e:
        logger.error(f"Fehler bei POST /api/backups: {e}")
        return {"status": "error", "error": str(e)}



@app.get("/api/backups")
async def list_backups(request) -> dict[str, list]:
    try:
        logger.info("GET /api/backups")
        backups = list_backups_records()
        logger.info(f"{len(backups)} Backups geliefert")
        return {"backups": [b.model_dump() for b in backups]}
    except Exception as e:
        logger.error(f"Fehler bei GET /api/backups: {e}")
        return {"backups": [], "error": str(e)}



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