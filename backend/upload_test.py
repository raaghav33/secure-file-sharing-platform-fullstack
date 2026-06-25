# upload_test.py
import os, requests, sys

PATH = r"sample.pdf"  # ← change if your file is different
if not os.path.exists(PATH):
    print("ERROR: file not found at", PATH); sys.exit(1)

print("local file path:", PATH)
size = os.path.getsize(PATH)
print("local file size (bytes):", size)

URL = "http://127.0.0.1:8000/upload"
with open(PATH, "rb") as f:
    files = {"file": (os.path.basename(PATH), f, "application/pdf")}
    r = requests.post(URL, files=files, timeout=120)
    print("status", r.status_code)
    print("response text:")
    print(r.text)
