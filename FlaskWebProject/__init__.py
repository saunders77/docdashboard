"""
The flask application package.
"""

import sys
from os.path import join, dirname
sys.path.append(join(dirname(__file__), "lib"))

from flask import Flask
app = Flask(__name__)

import FlaskWebProject.views