from __future__ import annotations
from flask import Flask, request
from .client import Client
from typing import Any
from bson import json_util


def create_api(client: Client) -> Flask:
    '''
    Function that builds flask web application.
    Returns app that can be run by calling .run method
    '''

    app = Flask('mango_api')
    
    @app.route('/api/connect', methods=['POST'])
    def handle_connect() -> Any:
        body = request.get_json()
        if 'conn_str' not in body:
            return 'Connection string was not provided', 400
        conn_str = body['conn_str']
        verdict = client.connect(conn_str)
        if not verdict:
            return 'Failed to connect', 500
        return 'Successfully connected'

    @app.route('/api/database/list', methods=['GET'])
    def handle_database_list() -> Any:
        return client.databases

    @app.route('/api/collection/list', methods=['GET'])
    def handle_collection_list() -> Any:
        if 'database' not in request.args:
            return 'Database was not provided', 400
        database = request.args.get('database')
        return client.collections(database)

    @app.route('/api/database/create', methods=['POST'])
    def handle_database_create() -> Any:
        body = request.get_json()
        if 'database' not in body or 'collection' not in body:
            return 'Database or collection were not provided', 400
        database, collection = body['database'], body['collection']
        verdict = client.create_database(database, collection)
        if not verdict:
            return 'Failed to create database', 500
        return 'Successfully created database'

    @app.route('/api/collection/create', methods=['POST'])
    def handle_collection_create() -> Any:
        body = request.get_json()
        if 'database' not in body or 'collection' not in body:
            return 'Database or collection were not provided', 400
        database, collection = body['database'], body['collection']
        verdict = client.create_collection(database, collection)
        if not verdict:
            return 'Failed to create collection', 500
        return 'Successfully created collection'

    @app.route('/api/database/delete', methods=['POST'])
    def handle_database_delete() -> Any:
        body = request.get_json()
        if 'database' not in body:
            return 'Database was not provided', 400
        database = body['database']
        verdict = client.delete_database(database)
        if not verdict:
            return 'Failed to delete database', 500
        return 'Successfully deleted database'

    @app.route('/api/collection/delete', methods=['POST'])
    def handle_collection_delete() -> Any:
        body = request.get_json()
        if 'database' not in body or 'collection' not in body:
            return 'Database or collection were not provided', 500
        database = body['database']
        collection = body['collection']
        verdict = client.delete_collection(database, collection)
        if not verdict:
            return 'Failed to delete collection', 500
        return 'Successfully deleted collection'

    @app.route('/api/collection/rename', methods=['POST'])
    def handle_collection_rename() -> Any:
        body = request.get_json()
        required_fields = ['database', 'collection', 'name']
        if any(map(lambda field: field not in body, required_fields)):
            return 'Some of the fields are missing', 400
        database = body['database']
        collection = body['collection']
        name = body['name']
        verdict = client.rename_collection(database, collection, name)
        if not verdict:
            return 'Failed to rename collection', 500
        return 'Successfully renamed collection'

    @app.route('/api/document/create', methods=['POST'])
    def handle_document_create() -> Any:
        body = request.get_json()
        required_fields = ['database', 'collection', 'document']
        if any(map(lambda field: field not in body, required_fields)):
            return 'Some of the fields are missing', 400
        database = body['database']
        collection = body['collection']
        document = body['document']
        verdict = client.new_document(database, collection, document)
        if not verdict:
            return 'Failed to create document', 500
        return 'Successfully created document'

    @app.route('/api/document/list', methods=['GET'])
    def handle_document_list() -> Any:
        args = request.args
        if 'database' not in args or 'collection' not in args:
            return 'Some of the fields are missing', 400
        database = args['database']
        collection = args['collection']
        query = '{}'
        if 'query' in args:
            query = args['query']
        page = 0
        if 'page' in args:
            page = int(args['page'])
        result = client.get_page_general(database, collection, query, page, 40)
        if result is None:
            return 'Failed to fetch documents', 500
        return json_util.dumps(result)

    @app.route('/api/document/edit', methods=['POST'])
    def handle_document_edit() -> Any:
        required_fields = ['database', 'collection', 'id', 'value']
        body = request.get_json()
        if any(map(lambda field: field not in body, required_fields)):
            return 'Some fields are missing', 400
        database = body['database']
        collection = body['collection']
        _id = body['id']
        new_value = body['value']
        verdict = client.edit_document_general(database, collection, _id, new_value)
        if not verdict:
            return 'Failed to edit document', 500
        return 'Successfully updated the document'

    @app.route('/api/document/delete', methods=['POST'])
    def handle_document_delete() -> Any:
        required_fields = ['database', 'collection', 'id']
        body = request.get_json()
        if any(map(lambda field: field not in body, required_fields)):
            return 'Some fields are missing', 400
        database = body['database']
        collection = body['collection']
        _id = body['id']
        verdict = client.delete_document(database, collection, _id)
        if not verdict:
            return 'Failed to delete the document', 500
        return 'Successfully deleted the document'

    return app
