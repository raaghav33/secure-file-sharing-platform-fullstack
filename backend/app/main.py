# app/main.py
import os
from datetime import timedelta
import time
import secrets
import string
from typing import Tuple, Optional
from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, JSONResponse
from google.cloud import storage
from google.oauth2 import service_account
import json

# Config from env
GCS_BUCKET = os.environ.get("GCS_BUCKET")
EXPIRY_SECONDS = int(os.environ.get("EXPIRY_SECONDS", "1800"))
CODE_LEN = 6
MAX_FILE_SIZE = 40 * 1024 * 1024  # 40 MB

if not GCS_BUCKET:
    raise RuntimeError("GCS_BUCKET environment variable must be set")

# Initialize GCS client (uses GOOGLE_APPLICATION_CREDENTIALS env var)
# Initialize GCS client
gcs_credentials_json = os.environ.get("GCS_CREDENTIALS_JSON")

if gcs_credentials_json:
    credentials_info = json.loads(gcs_credentials_json)
    credentials = service_account.Credentials.from_service_account_info(
        credentials_info
    )
    storage_client = storage.Client(
        project=credentials_info["project_id"],
        credentials=credentials,
    )
else:
    # Local development
    storage_client = storage.Client.from_service_account_json("gcs-key.json")
bucket = storage_client.bucket(GCS_BUCKET)

app = FastAPI(title="PDF Uploader (GCS)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten in prod
    allow_methods=["*"],
    allow_headers=["*"],
)

def generate_code(length=CODE_LEN) -> str:
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def make_blob_name(code: str, filename: str) -> str:
    ts = int(time.time())
    safe = filename.replace(" ", "_")
    return f"{code}_{ts}_{safe}"

def parse_blob_name(blob_name: str) -> Tuple[str, int, str]:
    # expected format: {code}_{timestamp}_{origname}
    parts = blob_name.split("_", 2)
    if len(parts) < 3:
        return (parts[0] if parts else "", 0, blob_name)
    code, ts_str, orig = parts[0], parts[1], parts[2]
    try:
        ts = int(ts_str)
    except:
        ts = 0
    return code, ts, orig

@app.get("/")
async def root():
    return {"status": "ok", "message": "PDF Uploader (GCS) running"}



import io
from pathlib import Path

DEBUG_SAVE_DIR = Path.cwd() / "debug_received"
DEBUG_SAVE_DIR.mkdir(exist_ok=True)

# inside app/main.py — upload endpoint (simple, binary-safe, multi-type)
@app.post("/upload")
async def upload_any_file(file: UploadFile = File(...)):
    # Basic size guard
    try:
        cleanup_expired()
    except Exception as e:
        print("[WARN] cleanup_expired failed:", e)
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(400, "File too large")
    code = generate_code()
    blob_name = make_blob_name(code, file.filename)  # keep same naming
    blob = bucket.blob(blob_name)

    # Use the file's reported content-type if available, otherwise fallback
    ctype = file.content_type or "application/octet-stream"

    # Upload binary safely (BytesIO or upload_from_file)
    import io
    bio = io.BytesIO(contents)
    bio.seek(0)
    blob.upload_from_file(bio, content_type=ctype)

    # Save metadata for bookkeeping & later backup/cleanup
    blob.metadata = {
        "code": code,
        "original_filename": file.filename,
        "content_type": ctype,
        "uploaded_at": str(int(time.time()))
    }
    blob.patch()

    return {"code": code, "expiry_seconds": EXPIRY_SECONDS, "blob_name": blob_name}


@app.get("/get/{code}")
async def get_file(code: str):
    # search for object with prefix {code}_
    try:
        cleanup_expired()
    except Exception as e:
        print("[WARN] cleanup_expired failed:", e)
    prefix = f"{code}_"
    blobs = list(storage_client.list_blobs(GCS_BUCKET, prefix=prefix, max_results=10))
    if not blobs:
        raise HTTPException(status_code=404, detail="File not found or expired.")
    blob = blobs[0]  # should be unique
    found_code, ts, orig_name = parse_blob_name(blob.name)
    if found_code != code:
        raise HTTPException(status_code=404, detail="File not found or expired.")
    if time.time() - ts > EXPIRY_SECONDS:
        # delete expired object
        try:
            blob.delete()
        except Exception:
            pass
        raise HTTPException(status_code=404, detail="File expired.")
    # generate short-lived signed URL (300s)
    try:
        url = blob.generate_signed_url(expiration=timedelta(seconds=300))
        return RedirectResponse(url)
    except Exception as e:
        # fallback: stream through server (not ideal for large files)
        return JSONResponse({"error": "Failed to generate signed url", "detail": str(e)}, status_code=500)

@app.post("/cleanup")
async def trigger_cleanup(background_tasks: BackgroundTasks):
    background_tasks.add_task(cleanup_expired)
    return {"status": "cleanup scheduled"}

@app.get("/signed-upload-url")
def get_signed_upload_url(filename: str, content_type: str = "application/octet-stream"):
    """
    Returns a signed URL that allows clients (mobile, PC, browser, any device)
    to upload files directly to Google Cloud Storage using a PUT request.
    This bypasses your FastAPI server for large file streaming.
    """
    code = generate_code()
    blob_name = make_blob_name(code, filename)

    blob = bucket.blob(blob_name)

    upload_url = blob.generate_signed_url(
        expiration=timedelta(minutes=15),  # client has 15 minutes to upload
        method="PUT",
        content_type=content_type,
    )

    # In future, you will store (code -> blob_name) in DB (Redis, SQLite, Firestore, etc.)
    # For now, return blob_name and code so client can later request `/get/<code>`
    return {
        "code": code,
        "upload_url": upload_url,
        "blob_name": blob_name,
    }

def cleanup_expired() -> int:
    """Delete objects older than EXPIRY_SECONDS. Return count deleted."""
    now = int(time.time())
    deleted = 0
    # paginate if bucket large (omitted for brevity)
    for blob in storage_client.list_blobs(GCS_BUCKET):
        code, ts, _ = parse_blob_name(blob.name)
        if ts == 0:
            continue
        if now - ts > EXPIRY_SECONDS:
            try:
                blob.delete()
                deleted += 1
            except Exception:
                pass
    return deleted

