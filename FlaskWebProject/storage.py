from azure.storage import TableService, Entity

table_service = TableService(account_name = "docdash", account_key = "2f5QoMeIsCOsT6aitQqbcoH/ydSFnqwCxQIPpE0JEtQJR0o9Frqzc9btgLVZ9Y8wbhd7CRj9Q//X8qWku8fl3w==")
table_service.create_table('testtable')
pass
