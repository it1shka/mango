'''Entry point of the application'''

from __future__ import annotations
from core import Client, create_api
from flask import send_from_directory
from typing import Any, Literal
import webbrowser
from threading import Timer
import sys
import app


PORT = 3131
BROWSER_DELAY = 3.0


def get_app_type() -> Literal['native'] | Literal['web']:
    '''
    If arg == `native`, runs Tkinter GUI.
    If arg == `web`, launches web server and opens browser.
    Else, requests input again
    '''
    app_type: str
    if len(sys.argv) >= 2:
        app_type = sys.argv[1]
    else:
        app_type = None
    while app_type not in ['native', 'web']:
        app_type = input('Please, provide app type (native/web): ').strip()
    return app_type


def launch_web(client: Client) -> None:
    '''Launches web interface'''

    app = create_api(client)
    
    @app.route('/<path:path>')
    def handle_static(path: str) -> Any:
        '''Serves static files from `web` folder'''
        return send_from_directory('web', path)

    @app.route('/')
    def handle_index() -> Any:
        '''Serves index.html for route `/`'''
        return send_from_directory('web', 'index.html')

    print(app.url_map)

    print('Browser will be open in 3 seconds')
    timer = Timer(BROWSER_DELAY, lambda: webbrowser.open_new(f'http://localhost:{PORT}/'))
    timer.start()
    app.run(host='localhost', port=PORT)


if __name__ == '__main__':
    app_type = get_app_type()
    with Client() as client:
        if app_type == 'native':
            app.run(client)
        else:
            launch_web(client)
