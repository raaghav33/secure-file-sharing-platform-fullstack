# download_test.py
import sys, requests, os

BASE = "http://127.0.0.1:8000"
if len(sys.argv) < 2:
    print("Usage: python download_test.py <code>")
    sys.exit(1)
code = sys.argv[1]
r = requests.get(f"{BASE}/get/{code}", allow_redirects=True, stream=True, timeout=60)
print("GET /get/{code} final status:", r.status_code)
# if redirect happened, requests followed it; save content
out = f"downloaded_by_test_{code}.bin"
with open(out, "wb") as f:
    for chunk in r.iter_content(32768):
        if chunk: f.write(chunk)
print("Saved to:", out, "size:", os.path.getsize(out))
