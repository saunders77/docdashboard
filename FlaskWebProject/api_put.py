"""
The Put API implementation
"""

from flask import jsonify
from flask.json import loads
from uuid import uuid4

def api_put(params):
    client_id = params["clientid"]
    doc_id = params["docid"]
    stats = loads(params["stats"])

    if not client_id:
        client_id = uuid4().hex
    if not doc_id:
        doc_id = uuid4().hex

    return jsonify(clientid=client_id, docid = doc_id)