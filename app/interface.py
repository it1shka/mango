from __future__ import annotations
import tkinter as tk
from tkinter import ttk


class Interface:
    '''
    Builds native Tkinter interface
    and saves elements in class fields.
    Additionally, contains some helper 
    functions
    '''

    window: tk.Tk
    url_text: tk.Text
    connect_button: ttk.Button
    open_browser_button: ttk.Button
    create_database_button: ttk.Button
    create_collection_button: ttk.Button
    navigation_treeview: ttk.Treeview

    def __init__(self) -> None:
        self._build_window()
        self._build_url_text()
        self._build_navigation()
        self._build_explorer()

    def _build_window(self) -> None:
        '''Creates Tk window'''
        self.window = tk.Tk()
        self.window.title('Mango')
        self.window.attributes('-fullscreen', True)

    def _build_url_text(self) -> None:
        '''
        Adds widget that allows you to connect
        to particular MongoDB instance
        '''
        widget = ttk.Frame(self.window)
        label = ttk.Label(widget, text='Connect to: ')
        self.url_text = tk.Text(widget, height=1, width=50)
        self.connect_button = ttk.Button(widget, text='Connect')
        self.create_database_button = ttk.Button(widget, text='Create database')
        self.create_collection_button = ttk.Button(widget, text='Create collection')
        self.open_browser_button = ttk.Button(widget, text='Open in browser')
        children = [
            label, self.url_text, 
            self.connect_button, 
            self.create_database_button,
            self.create_collection_button,
            self.open_browser_button
        ]
        for each in children:
            each.pack(side=tk.LEFT)
        widget.config(padding=5, borderwidth=1, relief='solid')
        widget.pack(side=tk.TOP, fill='x')
    
    def _build_navigation(self) -> None:
        '''Adds navigation Treeview on the left side'''
        widget = ttk.Frame(self.window)
        widget.config(borderwidth=1, relief='solid')
        widget.pack(side=tk.LEFT, fill='y')
        self.navigation_treeview = ttk.Treeview(widget, show='tree')
        scrollbar = ttk.Scrollbar(
            widget,
            orient=tk.VERTICAL,
            command=self.navigation_treeview.yview,
        )
        self.navigation_treeview.config(yscrollcommand=scrollbar.set)
        scrollbar.pack(side=tk.RIGHT, fill='y')
        self.navigation_treeview.pack(fill='both', expand=True)

    def _build_explorer(self) -> None:
        '''Builds main view to edit documents'''
        widget = ttk.Frame(self.window)
        widget.config(borderwidth=1, relief='solid')
        # TODO:
        widget.pack(side=tk.RIGHT, fill='both', expand=True)

    # helper functions

    def clear_navigation(self) -> None:
        '''
        Traverses all children of navigation
        and deletes them one by one
        '''
        tree = self.navigation_treeview
        for elem in tree.get_children():
            tree.delete(elem)

    def insert_new_database(self, db: str, collection: str) -> None:
        '''Inserts database with one collection'''
        db_root = self.navigation_treeview.insert('', tk.END, text=db)
        self.navigation_treeview.insert(db_root, tk.END, text=collection)
