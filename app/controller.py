from __future__ import annotations
import tkinter as tk
from tkinter import messagebox
from tkinter import simpledialog
from tkinter import ttk
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
    _page: int

    def __init__(self, client: Client, iface: Interface) -> None:
        self._client = client
        self._iface = iface
        self._page = 0

    def start(self) -> None:
        '''Starts the application'''
        self._bind_iface()
        self._iface.window.mainloop()

    def _bind_iface(self) -> None:
        '''Attaches listeners to UI elements'''
        self._iface.connect_button.config(command=self._handle_connect)
        self._iface.create_database_button.config(command=self._handle_create_database)
        self._iface.create_collection_button.config(command=self._handle_create_collection)
        self._iface.create_document_button.config(command=self._handle_create_document)
        self._iface.navigation_treeview.bind('<BackSpace>', self._handle_navigation_delete)
        self._iface.navigation_treeview.bind('R', self._handle_rename_collection)
        self._iface.search_button.config(command=self._handle_search)
        self._iface.prev_page_button.config(command=self._handle_search_prev)
        self._iface.next_page_button.config(command=self._handle_search_next)
        # TODO: complete
    
    def _handle_create_document(self) -> None:
        '''Creates new document and inserts into new collection'''
        # copypaste from _handle_search
        collection = self._iface.navigation_treeview.focus()
        if not collection:
            messagebox.showwarning(title='Warning', message='Select a collection first!')
            return
        database = self._iface.navigation_treeview.parent(collection)
        if not database:
            messagebox.showwarning(title='Warning', message='Select a collection first!')
            return
        db = self._iface.navigation_treeview.item(database)['text']
        col = self._iface.navigation_treeview.item(collection)['text']
        # create a popup with text field
        popup = tk.Toplevel()
        label = ttk.Label(popup, text='New document:', padding=10)
        label.pack(side=tk.TOP, fill='x')
        button = ttk.Button(popup, text='Insert')
        button.pack(side=tk.BOTTOM)
        text_area = tk.Text(popup)
        text_area.pack(fill='both', expand=True)
        # setting the handler
        def _insert() -> None:
            raw_doc = text_area.get('1.0', tk.END)
            verdict = self._client.new_document(db, col, raw_doc)
            if not verdict:
                messagebox.showerror(title='Failure', message='Failed to create document')
            else:
                popup.destroy()
        button.config(command=_insert)

    def _handle_search_start(self) -> None:
        '''Starts searching from the first page'''
        self._page = 0
        self._handle_search()

    def _handle_search_prev(self) -> None:
        '''Goes to the previous page and initiates a search'''
        self._page = max(0, self._page - 1)
        self._handle_search()

    def _handle_search_next(self) -> None:
        '''Goes to the next page and initiates a search'''
        self._page += 1
        self._handle_search()

    def _handle_search(self) -> None:
        '''Handles searching for elements with specified page from self._page'''
        collection = self._iface.navigation_treeview.focus()
        if not collection:
            messagebox.showwarning(title='Warning', message='Select a collection first!')
            return
        database = self._iface.navigation_treeview.parent(collection)
        if not database:
            messagebox.showwarning(title='Warning', message='Select a collection first!')
            return
        db = self._iface.navigation_treeview.item(database)['text']
        col = self._iface.navigation_treeview.item(collection)['text']
        search = self._iface.search_entry.get()
        documents = self._client.get_page(db, col, search, page=self._page)
        if documents is None:
            messagebox.showerror(title='Failure', message='Failed to search')
        else:
            self._iface.insert_documents(documents)

    def _handle_rename_collection(self, event: tk.Event) -> None:
        '''Renames collection'''
        current_id = self._iface.navigation_treeview.focus()
        if not current_id:
            return
        parent = self._iface.navigation_treeview.parent(current_id)
        if not parent:
            return
        database = self._iface.navigation_treeview.item(parent)['text']
        collection = self._iface.navigation_treeview.item(current_id)['text']
        new_name = simpledialog.askstring('Collection edit', 'New name: ')
        if not new_name:
            return
        verdict = self._client.rename_collection(database, collection, new_name)
        if verdict:
            self._iface.navigation_treeview.item(current_id, text=new_name)
        else:
            messagebox.showerror(
                title='Failure',
                message='Failed to rename the collection'
            )

    def _handle_connect(self) -> None:
        '''Connects to new MongoDB client'''
        dest = self._iface.url_text.get('1.0', tk.END + '-1c')
        verdict = self._client.connect(dest)
        if verdict:
            self._update_navigation()
        else:
            messagebox.showerror(
                title='Connection failure',
                message='URL is invalid'
            )
            self._iface.clear_navigation()

    def _handle_create_database(self) -> None:
        '''Creates database + initial collection'''
        database_name = simpledialog.askstring('Database name', 'Name: ')
        collection_name = simpledialog.askstring('Collection name', 'Name: ')
        verdict = self._client.create_database(database_name, collection_name)
        if not verdict:
            messagebox.showerror(
                title='Failure',
                message='Failed to create database'
            )
            return
        self._iface.insert_new_database(database_name, collection_name)

    def _handle_create_collection(self) -> None:
        '''Creates collection for a given database'''
        database_name = simpledialog.askstring('Existing DB name', 'Existing DB: ')
        collection_name = simpledialog.askstring('New collection', 'New collection name: ')
        verdict = self._client.create_collection(database_name, collection_name)
        if not verdict:
            messagebox.showerror(
                title='Failure',
                message='Failed to create collection'
            )
            return
        self._iface.insert_collection(database_name, collection_name)

    def _handle_navigation_delete(self, event: tk.Event) -> None:
        '''Handles deletion of database/collection'''
        selected = self._iface.navigation_treeview.selection()
        confirmed = messagebox.askyesno(title='Warning', message='Are you sure?')
        if not confirmed:
            return
        for each in selected:
            parent = self._iface.navigation_treeview.parent(each)
            verdict: str
            if not parent: # database
                database = self._iface.navigation_treeview.item(each)['text']
                verdict = self._client.delete_database(database)
            else: # collection
                database = self._iface.navigation_treeview.item(parent)['text']
                collection = self._iface.navigation_treeview.item(each)['text']
                verdict = self._client.delete_collection(database, collection)
            if verdict:
                self._iface.navigation_treeview.delete(each)
            else:
                messagebox.showerror(
                    title='Failure',
                    message='Failed to delete the item'
                )

    def _update_navigation(self) -> None:
        '''Reads all databases and collections'''
        self._iface.clear_navigation()
        tree = self._iface.navigation_treeview
        for db_name in self._client.databases:
            db_root = tree.insert('', tk.END, text=db_name)
            for collection_name in self._client.collections(db_name):
                collection_root = tree.insert(db_root, tk.END, text=collection_name)
