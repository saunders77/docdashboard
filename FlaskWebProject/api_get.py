"""
The Get API implementation
"""

from flask import jsonify, abort
from flask.json import loads
from time import time
from uuid import uuid4

import FlaskWebProject.storage as storage

def api_get(params):
    client_id = params["clientid"]
    docs = loads(params["docs"])

    if not client_id:
        abort(404)

    response = dict()
    for docid, info in docs.items():
        response[docid] = dict(
            charcounts = storage.get_data_for_doc(docid),
            timecreated = storage.get_time_created(docid))
    return jsonify(dict(docs = response))