from __future__ import annotations
import pymongo


CONNECTION_TIMEOUT = 2000


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
