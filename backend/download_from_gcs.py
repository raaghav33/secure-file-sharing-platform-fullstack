# download_from_gcs.py
from google.cloud import storage
import os, sys

bucket_name = os.environ.get("GCS_BUCKET")
if not bucket_name:
    print("GCS_BUCKET not set"); sys.exit(1)

client = storage.Client()
blobs = list(client.list_blobs(bucket_name, max_results=50))
if not blobs:
    print("No blobs found")
    sys.exit(1)

# pick most recently updated blob
blob = sorted(blobs, key=lambda x: x.updated, reverse=True)[0]
print("Selected blob:", blob.name, "size:", blob.size)

out = "downloaded_" + os.path.basename(blob.name)
blob.download_to_filename(out)
print("Downloaded to:", out, "size on disk:", os.path.getsize(out))
