import subprocess
import sys
import threading
import os
import time
import json
import urllib.request
import urllib.error
from datetime import datetime

LOG_FILE = "startup.log"


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
    """Log output to both console and file with timestamp"""
    import io
    
    # Use BufferedReader for more reliable cross-platform reading
    stdout = io.TextIOWrapper(process.stdout, encoding='utf-8', errors='replace', line_buffering=True)
    
    try:
        while True:
            line = stdout.readline()
            if not line:
                # Check if process is still running
                if process.poll() is not None:
                    break
                # Small sleep to avoid busy waiting
                import time
                time.sleep(0.1)
                continue
            
            try:
                timestamp = datetime.now().strftime("%H:%M:%S")
                log_line = f"[{timestamp}] [{name}] {line.strip()}"
                print(log_line)
                # Write to log file
                try:
                    with open(LOG_FILE, "a", encoding="utf-8") as f:
                        f.write(log_line + "\n")
                except:
                    pass
                sys.stdout.flush()
            except Exception as e:
                pass
    finally:
        stdout.close()


def log_error(process, name):
    """Log stderr output to both console and file with timestamp"""
    if process.stderr is None:
        return
    
    import io
    import time
    
    # Use BufferedReader for more reliable reading
    stderr = io.TextIOWrapper(process.stderr, encoding='utf-8', errors='replace', line_buffering=True)
    
    try:
        while True:
            line = stderr.readline()
            if not line:
                # Check if process is still running
                if process.poll() is not None:
                    break
                time.sleep(0.1)
                continue
            
            timestamp = datetime.now().strftime("%H:%M:%S")
            log_line = f"[{timestamp}] [{name}-ERR] {line.strip()}"
            print(log_line, file=sys.stderr)
            try:
                with open(LOG_FILE, "a", encoding="utf-8") as f:
                    f.write(log_line + "\n")
            except:
                pass
            sys.stderr.flush()
    except Exception:
        pass
    finally:
        stderr.close()

def start_frontend():
    print("[System] Starting frontend...", flush=True)

    frontend_env = os.environ.copy()
    frontend_env.setdefault("NEXT_TELEMETRY_DISABLED", "1")
    frontend_env.setdefault("NO_UPDATE_NOTIFIER", "1")
    frontend_env.setdefault("npm_config_update_notifier", "false")
    # Enable verbose Next.js logging
    frontend_env.setdefault("NEXT_DEBUG", "1")

    # Don't capture output - let it print directly to console
    process = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=os.getcwd(),
        stdout=None,
        stderr=None,
        shell=True,
        env=frontend_env
    )
    return process

def cleanup_port(port):
    """Kill any process using the specified port"""
    try:
        result = subprocess.run(
            f'netstat -ano | findstr :{port} | findstr LISTENING',
            shell=True, capture_output=True, text=True
        )
        for line in result.stdout.strip().split(chr(10)):
            if line:
                parts = line.split()
                if len(parts) >= 5:
                    pid = parts[-1]
                    try:
                        subprocess.run(['taskkill', '//F', '//PID', pid], 
                                    stdout=subprocess.DEVNULL, 
                                    stderr=subprocess.DEVNULL)
                        print(f"[System] Killed process {pid} on port {port}")
                    except:
                        pass
    except:
        pass

def start_backend():
    print("[System] Cleaning up ports...", flush=True)
    cleanup_port(8000)
    cleanup_port(8001)
    cleanup_port(8002)
    cleanup_port(8003)
    
    print("[System] Starting backend...", flush=True)

    backend_dir = os.path.join(os.getcwd(), "backend")
    backend_env = os.environ.copy()
    # Ensure backend sibling packages (e.g. modules/) are importable in reload subprocesses.
    backend_env["PYTHONPATH"] = backend_dir + os.pathsep + backend_env.get("PYTHONPATH", "")
    
    # Don't capture output - let it print directly to console
    process = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8003", "--reload", "--log-level", "debug"],
        cwd=backend_dir,
        stdout=None,
        stderr=None,
        env=backend_env
    )
    return process

def main():
    # Clear/initialize log file with header
    try:
        with open(LOG_FILE, "w", encoding="utf-8") as f:
            f.write(f"=== OpenLearner Startup Log - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} ===\n\n")
    except:
        pass
    
    frontend_proc = None
    backend_proc = None
    try:
        if not check_gemini_connectivity():
            print("[System] Startup aborted because Gemini API is unreachable.")
            sys.exit(1)

        frontend_proc = start_frontend()
        backend_proc = start_backend()

        # Both now print directly to console
        print("[System] Services started. Press Ctrl+C to stop.", flush=True)

        while True:
            time.sleep(1)

            if frontend_proc.poll() is not None:
                print("[System] Frontend process stopped.")
                break
            if backend_proc.poll() is not None:
                print("[System] Backend process stopped.")
                break


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
