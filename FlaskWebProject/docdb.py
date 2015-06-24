from base64 import b64decode, b64encode
from datetime import datetime, timezone
from email.utils import format_datetime
from urllib.request import Request, urlopen, URLError

import hmac
import urllib.parse

_master_key = b"XsWhZNILrzCw9LmzfODXOOPPdUkD/V1r1QNJERvMmHNAPs8GD6ipYQQPw1IZ6fm1lGAl8GBfsQ0CBppAkS/3tg=="
_urlbase = "https://docdashboard.documents.azure.com/"
db_id = "tqtFAA=="

def get_authorization_string(verb, resource_type, resource_id, date, master_key):
    key = b64decode(master_key)
    text = '\n'.join([verb, resource_type, resource_id, date, "", ""]).lower().encode()
    msg = b64encode(hmac.new(master_key, text, "sha256").digest())
    msg = msg.decode()
    return urllib.parse.quote("type={}&ver={}&sig={}".format("master", "1.0", msg), b'-_.!~*\'()')

def _get_db():
    date = format_datetime(datetime.now(timezone.utc), True)
    auth_string = get_authorization_string("get", "dbs", db_id, date, _master_key)
    req = Request(
        _urlbase + "dbs/" + db_id,
        headers = {
            "authorization": auth_string,
            "x-ms-date": date
        }
    )
    try:
        resp = urlopen(req)
        print(resp.read())
    except URLError as e:
        print(e)
