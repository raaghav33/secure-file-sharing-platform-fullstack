# inspect_bytes.py
import glob, os

# find server saved and downloaded files
debug_files = sorted(glob.glob("debug_received/*"), key=os.path.getmtime, reverse=True)
downloaded_files = sorted(glob.glob("downloaded_*"), key=os.path.getmtime, reverse=True)

if not debug_files:
    print("No debug_received files found.")
    exit()

if not downloaded_files:
    print("No downloaded_ files found.")
    exit()

debug_path = debug_files[0]
down_path = downloaded_files[0]

def inspect(path):
    size = os.path.getsize(path)
    with open(path, "rb") as f:
        head = f.read(64)
    print("FILE:", path)
    print(" Size:", size)
    print(" First bytes hex:", head.hex())
    print(" Starts with %PDF ? ", head.startswith(b"%PDF"))
    print("-" * 60)

print("Inspecting server-saved file:")
inspect(debug_path)

print("Inspecting GCS-downloaded file:")
inspect(down_path)
