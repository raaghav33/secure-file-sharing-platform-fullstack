# gcs_test_quick.py
from google.cloud import storage
import os, sys

bucket_name = os.environ.get("GCS_BUCKET")
if not bucket_name:
    print("GCS_BUCKET env var not set.")
    sys.exit(0)

try:
    client = storage.Client()
    bucket = client.bucket(bucket_name)
    if bucket.exists():
        print("Bucket exists and is accessible:", bucket_name)
    else:
        print("Bucket does not exist or SA lacks permission to view it.")
except Exception as e:
    print("Error connecting to GCS:", repr(e))
