# gcs_check.py
import os, sys
from google.cloud import storage
bucket_name = os.environ.get("GCS_BUCKET")
if not bucket_name:
    print("GCS_BUCKET env var required")
    sys.exit(1)
if len(sys.argv) < 2:
    print("Usage: python gcs_check.py <code>")
    sys.exit(1)
code = sys.argv[1]
client = storage.Client()
blobs = list(client.list_blobs(bucket_name, prefix=f"{code}_", max_results=50))
if not blobs:
    print("No blobs found for code:", code)
else:
    for b in blobs:
        print("Found:", b.name, "size:", b.size, "updated:", b.updated)
