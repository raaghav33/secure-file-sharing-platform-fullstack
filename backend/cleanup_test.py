# cleanup_test.py
import requests, os, time
BASE = "http://127.0.0.1:8000"

r = requests.post(f"{BASE}/cleanup", timeout=30)
print("POST /cleanup ->", r.status_code, r.text)

# Optional: wait a few seconds for background job to run
time.sleep(3)

# To verify deletion from GCS we either:
#  - Use server's listing via an endpoint (not implemented), or
#  - Use google-cloud-storage client locally (requires GOOGLE_APPLICATION_CREDENTIALS env var)
print("You should next run gcs_check.py with the 'code' to confirm object presence/absence.")
