from __future__ import annotations
import tkinter as tk
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
        self._bind_iface()
        self._iface.window.mainloop()

    def _bind_iface(self) -> None:
        '''Attaches listeners to UI elements'''
        self._iface.connect_button.config(command=self._handle_connect)
        # TODO: add rest
        
    def _handle_connect(self) -> None:
        '''Connects to new MongoDB client'''
        try:
            dest = self._iface.url_text.get('1.0', tk.END + '-1c')
            self._client.connect(dest)
        except Exception:
            self._client.disconnect()
        finally:
            self._update_navigation()

    def _update_navigation(self) -> None:
        '''Reads all databases and collections'''
        tree = self._iface.navigation_treeview
        for row in tree.get_children():
            tree.delete(row)
        for db_name in self._client.databases:
            db_root = tree.insert('', tk.END, text=db_name)
            for collection_name in self._client.collections(db_name):
                collection_root = tree.insert(db_root, tk.END, text=collection_name)
