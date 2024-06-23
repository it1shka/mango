from __future__ import annotations
import tkinter as tk
from tkinter import ttk


class Interface:
    '''
    Builds native Tkinter interface
    and saves elements in class fields
    '''

    window: tk.Tk
    url_input: tk.Text
    connect_button: ttk.Button
    open_browser_button: ttk.Button

    def __init__(self) -> None:
        self._build_window()
        self._build_url_input()

    def _build_window(self) -> None:
        '''Creates Tk window'''
        self.window = tk.Tk()
        self.window.title('Mango')
        self.window.attributes('-fullscreen', True)

    def _build_url_input(self) -> None:
        '''
        Adds widget that allows you to connect
        to particular MongoDB instance
        '''
        widget = ttk.Frame(self.window)
        label = ttk.Label(widget, text='Connect to: ')
        self.url_input = tk.Text(widget, height=1)
        self.connect_button = ttk.Button(widget, text='Connect')
        self.open_browser_button = ttk.Button(widget, text='Open in browser')
        children = [label, self.url_input, self.connect_button, self.open_browser_button]
        for each in children:
            each.pack(side=tk.LEFT)
        widget.config(padding=5, borderwidth=1, relief='solid')
        widget.pack(side=tk.TOP, fill='x')
