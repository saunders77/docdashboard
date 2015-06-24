"""
Routes and views for the flask application.
"""


def api_put(params):
    client_id = params["clientid"]
    doc_id = params["docid"]
    stats = params["stats"]

    return "", 200
