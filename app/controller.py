from __future__ import annotations
from core import Client
from .interface import Interface


class Controller:
    '''
    Acts as medium between
    MongoDB client and
    Tkinter interface
    '''

    _client: Client
    _iface: Interface

    def __init__(self, client: Client, iface: Interface) -> None:
        self._client = client
        self._iface = iface

    def start(self) -> None:
        '''Starts the application'''
        ...
        self._iface.window.mainloop()
