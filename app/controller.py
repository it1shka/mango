from __future__ import annotations
import tkinter as tk
from tkinter import messagebox
from tkinter import simpledialog
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
        self._iface.create_database_button.config(command=self._handle_create_database)
        self._iface.create_collection_button.config(command=self._handle_create_collection)
        self._iface.navigation_treeview.bind('<BackSpace>', self._handle_navigation_delete)
        # TODO: add rest
        
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

    def _handle_navigation_select(self) -> None:
        '''Handle tree selection of database/collection'''
        ...

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
