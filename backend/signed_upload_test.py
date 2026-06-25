# signed_upload_test.py
import os, requests, time
BASE = "http://127.0.0.1:8000"   # change if deployed
FILE = "D:\COLLEGE\DISCRETE MATHS\DMNM_s.pdf"
assert os.path.exists(FILE), f"{FILE} not found"

# Step 1: ask server for a signed upload URL
params = {"filename": os.path.basename(FILE), "content_type": "application/pdf"}
r = requests.get(f"{BASE}/signed-upload-url", params=params, timeout=30)
print("GET /signed-upload-url ->", r.status_code)
j = r.json()
print("Signed URL response:", j)
code = j["code"]
upload_url = j["upload_url"]

# Step 2: Upload file with HTTP PUT using returned signed URL
with open(FILE, "rb") as f:
    headers = {"Content-Type": "application/pdf"}
    put_resp = requests.put(upload_url, data=f, headers=headers, timeout=120)
print("PUT to signed URL -> status:", put_resp.status_code, put_resp.text[:200])

# Step 3: Check server's /get/{code} to get signed-download URL (it will redirect)
get_resp = requests.get(f"{BASE}/get/{code}", allow_redirects=False)
print("GET /get/{code} -> status:", get_resp.status_code)
if get_resp.status_code in (301,302,307):
    print("Redirect location (signed download):", get_resp.headers.get("location"))
elif get_resp.status_code == 200:
    print("Returned directly:", get_resp.text[:200])
else:
    print("GET error:", get_resp.status_code, get_resp.text)
