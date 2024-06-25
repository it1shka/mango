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
    search_entry: tk.Entry
    connect_button: ttk.Button
    open_browser_button: ttk.Button
    create_database_button: ttk.Button
    create_collection_button: ttk.Button
    search_button: ttk.Button
    next_page_button: ttk.Button
    prev_page_button: ttk.Button
    navigation_treeview: ttk.Treeview
    documents_treeview: ttk.Treeview

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
        # creating search bar
        search_widget = ttk.Frame(widget, padding=10)
        search_label = ttk.Label(search_widget, text='Search: ')
        self.search_entry = ttk.Entry(search_widget)
        self.search_button = ttk.Button(search_widget, text='Go')
        self.prev_page_button = ttk.Button(search_widget, text='Prev page')
        self.next_page_button = ttk.Button(search_widget, text='Next page')
        left_pack = [
            search_label,
            self.search_entry,
            self.search_button,
            self.prev_page_button,
            self.next_page_button
        ]
        for each in left_pack:
            each.pack(side=tk.LEFT)
        search_widget.pack(side=tk.TOP, fill='x')
        # creating search list results as another treeview
        self.documents_treeview = ttk.Treeview(widget, show='tree')
        scrollbar = ttk.Scrollbar(
            widget,
            orient=tk.VERTICAL,
            command=self.documents_treeview.yview,
        )
        self.documents_treeview.config(yscrollcommand=scrollbar.set)
        scrollbar.pack(side=tk.RIGHT, fill='y')
        self.documents_treeview.pack(fill='both', expand=True)
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

    def insert_collection(self, target_db: str, collection: str) -> bool:
        '''Inserts a new collection into an existing database'''
        for db in self.navigation_treeview.get_children():
            item = self.navigation_treeview.item(db)
            if item['text'] != target_db:
                continue
            self.navigation_treeview.insert(db, tk.END, text=collection)
        return False
    
    def insert_documents(self, documents: list[dict]) -> None:
        '''
        Deletes old information from the treeview.
        Inserts all the documents into the documents tree.
        '''
        for child in self.documents_treeview.get_children():
            self.documents_treeview.delete(child)
        for doc in documents:
            root = self.documents_treeview.insert('', tk.END, text='Document')
            self._insert_document(doc, root)

    def _insert_document(self, document: dict, parent: str) -> None:
        '''Recursive function for document insertion'''
        for key, value in document.items():
            if type(value) is dict:
                nested_root = self.documents_treeview.insert(parent, tk.END, text=key)
                self._insert_document(value, nested_root)
                continue
            if type(value) is list:
                indexed = {index: value for index, value in enumerate(value)}
                nested_root = self.documents_treeview.insert(parent, tk.END, text=key)
                self._insert_document(indexed, nested_root)
                continue
            text = f'{key}: {value}'
            self.documents_treeview.insert(parent, tk.END, text=text)
