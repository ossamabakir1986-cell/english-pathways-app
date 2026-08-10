from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
import webbrowser, threading, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
url = "http://localhost:8765"
threading.Timer(1.0, lambda: webbrowser.open(url)).start()
print("English Placement Test is running at", url)
print("Keep this window open during the test. Press Ctrl+C after finishing.")
ThreadingHTTPServer(("127.0.0.1", 8765), SimpleHTTPRequestHandler).serve_forever()
