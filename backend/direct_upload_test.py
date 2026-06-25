# direct_upload_test.py
import os, requests
BASE = "http://127.0.0.1:8000"  # change if deployed
FILE = "D:\COLLEGE\DISCRETE MATHS\DMNM_s.pdf"  # path to a small test file

assert os.path.exists(FILE), f"{FILE} not found"
print("Local file size:", os.path.getsize(FILE))

url = f"{BASE}/upload"
with open(FILE, "rb") as f:
    files = {"file": (os.path.basename(FILE), f, "application/pdf")}
    r = requests.post(url, files=files, timeout=120)
print("POST /upload -> status:", r.status_code)
try:
    data = r.json()
    print("Response JSON:", data)
except:
    print("Response text:", r.text)
