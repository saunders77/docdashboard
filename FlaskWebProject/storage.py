from azure.storage import TableService, Entity
from flask.json import dumps

table_name = 'testtable'

table_service = TableService(account_name = "docdash", account_key = "2f5QoMeIsCOsT6aitQqbcoH/ydSFnqwCxQIPpE0JEtQJR0o9Frqzc9btgLVZ9Y8wbhd7CRj9Q//X8qWku8fl3w==")
table_service.create_table(table_name)

def add_data_to_doc(docid, data, time):
    ensure_doc(docid)
    e = Entity()
    e.PartitionKey = docid
    e.RowKey = "{:015}".format(int(time))
    e.data = dumps(data)
    table_service.insert_or_replace_entity(table_name, e.PartitionKey, e.RowKey, e)

def ensure_doc(docid):
    table_service.insert_or_replace_entity(table_name, docid, docid, dict())

