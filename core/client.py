from __future__ import annotations
import pymongo
import json
from bson import ObjectId

CONNECTION_TIMEOUT = 2000
PAGE_SIZE = 5


class Client:
    '''CRUD operations manager'''

    _client: pymongo.MongoClient | None

    def __init__(self) -> None:
        self._client = None

    def disconnect(self) -> None:
        '''If connection exists, disconnects'''
        if not self._client:
            return
        self._client.close()
        self._client = None

    def connect(self, connection_str: str) -> bool:
        '''
        Connects to MongoDB using connection string.
        If connection was successful, returns True.
        Otherwise, returns False
        '''
        self.disconnect()
        try:
            self._client = pymongo.MongoClient(
                connection_str,
                serverSelectionTimeoutMS=CONNECTION_TIMEOUT,
                socketTimeoutMS=CONNECTION_TIMEOUT,
            )
            self._client.server_info()
            return True
        except Exception:
            print('Failed to connect')
            self.disconnect()
            return False

    def __enter__(self) -> Client:
        '''Used for \'with\' context manager'''
        return self

    def __exit__(self, exc_type, exc_value, exc_tb) -> None:
        '''Used for \'with\' context manager cleanup'''
        self.disconnect()

    @property
    def databases(self) -> list[str]:
        '''
        Returns list of databases from currect connection.
        In case there is no connection, returns empty list
        '''
        if not self._client:
            return []
        return self._client.list_database_names()
    
    def collections(self, db_name: str) -> list[str]:
        '''
        Returns list of collections for the given database.
        if connection or database doesn't exist,
        returns empty list
        '''
        if not self._client:
            return []
        database = self._client.get_database(db_name)
        if database is None:
            return []
        return database.list_collection_names()
    
    def create_database(self, new_db: str, init_collection: str) -> bool:
        '''Creates new MongoDB database with at least 1 collection'''
        try:
            db = self._client[new_db]
            db.create_collection(init_collection)
            return True
        except Exception:
            print('Failed to create the database')
            return False

    def create_collection(self, existing_db: str, collection: str) -> bool:
        '''Creates collection for given database'''
        try:
            existing_dbs = self._client.list_database_names()
            if existing_db not in existing_dbs:
                return False
            self._client[existing_db].create_collection(collection)
            return True
        except Exception:
            print('Failed to create the collection')
            return False

    def delete_database(self, database: str) -> bool:
        '''Deletes database with given name'''
        try:
            self._client.drop_database(database)
            return True
        except Exception:
            print('Failed to delete the database')
            return False

    def delete_collection(self, parent_db: str, collection: str) -> bool:
        '''Deletes collection for the specified database'''
        try:
            db = self._client[parent_db]
            db.drop_collection(collection)
            return True
        except Exception:
            print('Failed to delete the collection')
            return False

    def rename_collection(self, parent_db: str, collection: str, new_name: str) -> bool:
        '''Renames collection for the given database'''
        try:
            db = self._client[parent_db]
            collection = db.get_collection(collection)
            collection.rename(new_name)
            return True
        except Exception:
            print('Failed to rename the collection')
            return False

    def get_cursor(self, db: str, col: str, search: str) -> pymongo.cursor.Cursor | None:
        '''Primitive method to get cursor from the given search'''
        try:
            database = self._client[db]
            collection = database.get_collection(col)
            search = search.strip()
            query: dict
            if not search:
                query = dict()
            else:
                query = json.loads(search)
            cursor = collection.find(query)
            return cursor
        except Exception:
            print('Failed to get the cursor')
            return None

    def get_page(self, db: str, col: str, search: str, page: int) -> list | None:
        '''Gets specific page of documents using the search'''
        try:
            cursor = self.get_cursor(db, col, search)
            cursor = cursor.skip(PAGE_SIZE * page).limit(PAGE_SIZE)
            documents = []
            for document in cursor:
                documents.append(document)
            return documents
        except Exception:
            print('Search failed')
            return None

    def get_page_general(self, db: str, col: str, search: str, \
        page: int, page_size: int) -> list | None:
        '''
        Used for Web API. 
        Copypaste of the `get_page` function.
        '''
        try:
            cursor = self.get_cursor(db, col, search)
            cursor = cursor.skip(page_size * page).limit(page_size)
            documents = []
            for document in cursor:
                documents.append(document)
            return documents
        except Exception:
            print('Search failed')
            return None

    def new_document(self, db: str, col: str, doc: str) -> bool:
        '''Inserts a new document'''
        try:
            database = self._client[db]
            collection = database.get_collection(col)
            data = json.loads(doc)
            collection.insert_one(data)
            return True
        except Exception:
            print('Failed to insert document')
            return False

    def delete_document(self, db: str, col: str, _id: str) -> bool:
        '''Deletes document by specified ID'''
        try:
            database = self._client[db]
            collection = database.get_collection(col)
            collection.find_one_and_delete({'_id': ObjectId(_id)})
            return True
        except Exception:
            print('Failed to delete document')
            return False

    def edit_document(self, db: str, col: str, _id: str, \
        path: list[str | int], new_value: str | int) -> bool:
        try:
            database = self._client[db]
            collection = database.get_collection(col)
            doc = collection.find_one({'_id': ObjectId(_id)})
            current = doc
            for each in path[:-1]:
                currect = current[each]
            current[path[-1]] = new_value
            collection.update_one({'_id': ObjectId(_id)}, {'$set': doc}, upsert=False)
            return True
        except Exception:
            print('Failed to change document')
            return False

    def edit_document_general(self, db: str, col: str, _id: str, \
        new_value: str) -> bool:
        '''Function used with Web API'''
        try:
            database = self._client[db]
            collection = database.get_collection(col)
            new_document = json.loads(new_value)
            new_document['_id'] = ObjectId(_id)
            collection.update_one(
                {'_id': ObjectId(_id)},
                {'$set': new_document},
                upsert=False
            )
            return True
        except Exception:
            print('Failed to edit document')
            return False
