"""Run the game on your laptop: python3 serve.py, then open http://localhost:8000

Same as `python3 -m http.server`, but tells the browser never to cache anything,
so every refresh picks up your latest changes.
"""

from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

PORT = 8000


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


handler = partial(NoCacheHandler, directory=Path(__file__).parent)
print(f"Game running at http://localhost:{PORT}  (Ctrl+C to stop)")
ThreadingHTTPServer(("", PORT), handler).serve_forever()
