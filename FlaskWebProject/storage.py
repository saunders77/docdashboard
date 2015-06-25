from azure.storage import TableService, Entity
from flask.json import dumps
import datetime

table_name = 'testtable'
doc_partition = 'docs'

table_service = TableService(account_name = "docdash", account_key = "2f5QoMeIsCOsT6aitQqbcoH/ydSFnqwCxQIPpE0JEtQJR0o9Frqzc9btgLVZ9Y8wbhd7CRj9Q//X8qWku8fl3w==")
table_service.create_table(table_name)

def add_data_to_doc(docid, data, time):
    ensure_doc(docid)
    e = Entity()
    e.PartitionKey = docid
    e.RowKey = "{:015}".format(int(time))
    e.charcount = data["charcount"]
    table_service.insert_or_replace_entity(table_name, e.PartitionKey, e.RowKey, e)

def ensure_doc(docid):
    table_service.insert_or_replace_entity(table_name, doc_partition, docid, dict())

def get_data_for_doc(docid):
    timevalues = table_service.query_entities(table_name, "PartitionKey eq '" + docid + "'")
    data = []
    for timevalue in timevalues:
        data.append([datetime.datetime.utcfromtimestamp(int(timevalue.RowKey)), timevalue.charcount])
    return data

def get_time_created(docid):
    try:
        doc = table_service.get_entity(table_name, doc_partition, docid)
        return doc.Timestamp
    except:
        return None

