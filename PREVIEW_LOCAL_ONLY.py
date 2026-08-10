import http.server, socketserver, webbrowser, threading
from pathlib import Path
PORT=8766
ROOT=Path(__file__).resolve().parent
class H(http.server.SimpleHTTPRequestHandler):
    def __init__(self,*a,**k): super().__init__(*a,directory=str(ROOT),**k)
threading.Timer(1,lambda:webbrowser.open(f"http://localhost:{PORT}")).start()
with socketserver.TCPServer(("127.0.0.1",PORT),H) as s:
    print(f"Mobile app preview: http://localhost:{PORT}")
    print("Students do NOT need this once the app is hosted on HTTPS.")
    s.serve_forever()
