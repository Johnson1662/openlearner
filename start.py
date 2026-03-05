import subprocess
import sys
import threading
import os
import time
import json
import urllib.request
import urllib.error


def load_local_env():
    try:
        from dotenv import load_dotenv
    except ImportError:
        return

    env_local = os.path.join(os.getcwd(), ".env.local")
    env_default = os.path.join(os.getcwd(), ".env")

    if os.path.exists(env_local):
        load_dotenv(env_local, override=False)
    if os.path.exists(env_default):
        load_dotenv(env_default, override=False)


def check_gemini_connectivity() -> bool:
    load_local_env()

    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    model = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

    if not api_key:
        print("[System] Gemini check failed: GEMINI_API_KEY/GOOGLE_API_KEY is missing.")
        return False

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    payload = {
        "contents": [{"parts": [{"text": "ping"}]}],
        "generationConfig": {"maxOutputTokens": 1, "temperature": 0},
    }

    request = urllib.request.Request(
        url=url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=15) as response:
            if 200 <= response.status < 300:
                print(f"[System] Gemini basic connectivity check passed (model: {model}, ping-only).")
                print("[System] Note: this check does not validate long JSON generation latency.")
                return True
            print(f"[System] Gemini check failed with status: {response.status}")
            return False
    except urllib.error.HTTPError as e:
        error_text = e.read().decode("utf-8", errors="replace")
        print(f"[System] Gemini check failed (HTTP {e.code}): {error_text}")
        return False
    except Exception as e:
        print(f"[System] Gemini check failed: {e}")
        return False

def log_output(process, name):
    for line in iter(process.stdout.readline, ""):
        try:
            # Try to print normally, fallback to replacing non-encodable chars
            sys.stdout.write(f"[{name}] {line.strip()}\n")
            sys.stdout.flush()
        except UnicodeEncodeError:
            # Encode with 'replace' to safely handle chars the terminal can't display
            safe_line = line.strip().encode(sys.stdout.encoding, errors='replace').decode(sys.stdout.encoding)
            sys.stdout.write(f"[{name}] {safe_line}\n")
            sys.stdout.flush()
    process.stdout.close()

def start_frontend():
    print("[System] Starting frontend...")

    process = subprocess.Popen(
        ["npm", "run", "dev"],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        encoding='utf-8',
        shell=True
    )
    return process

def start_backend():
    print("[System] Starting backend...")

    backend_dir = os.path.join(os.getcwd(), "backend")
    process = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        encoding='utf-8',
        cwd=backend_dir
    )
    return process

def main():
    frontend_proc = None
    backend_proc = None
    try:
        if not check_gemini_connectivity():
            print("[System] Startup aborted because Gemini API is unreachable.")
            sys.exit(1)

        frontend_proc = start_frontend()
        backend_proc = start_backend()


        frontend_thread = threading.Thread(target=log_output, args=(frontend_proc, "Frontend"), daemon=True)
        backend_thread = threading.Thread(target=log_output, args=(backend_proc, "Backend"), daemon=True)

        frontend_thread.start()
        backend_thread.start()


        while True:
            time.sleep(1)

            if frontend_proc.poll() is not None:
                print("[System] Frontend process stopped.")
                break
            if backend_proc.poll() is not None:
                print("[System] Backend process stopped.")
                break

    except KeyboardInterrupt:
        print("\n[System] Stopping services...")
        if 'frontend_proc' in locals() and frontend_proc:
            frontend_proc.terminate()
        if 'backend_proc' in locals() and backend_proc:
            backend_proc.terminate()
        sys.exit(0)
    except Exception as e:
        print(f"[System] Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
