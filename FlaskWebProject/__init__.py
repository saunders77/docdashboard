"""
The flask application package.
"""

from flask import Flask
app = Flask(__name__)

import FlaskWebProject.views
try:
    import FlaskWebProject.api_put
except:
    raise