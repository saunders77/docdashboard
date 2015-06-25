"""
Routes and views for the flask application.
"""

from datetime import datetime
from flask import render_template, request
from FlaskWebProject import app
import FlaskWebProject.api_put as api_put
import FlaskWebProject.api_get as api_get

@app.route('/')
@app.route('/home')
def home():
    """Renders the home page."""
    return render_template(
        'index.html',
        title='Home Page',
        year=datetime.now().year,
    )

@app.route('/contact')
def contact():
    """Renders the contact page."""
    return render_template(
        'contact.html',
        title='Contact',
        year=datetime.now().year,
        message='Your contact page.'
    )

@app.route('/about')
def about():
    """Renders the about page."""
    return render_template(
        'about.html',
        title='About',
        year=datetime.now().year,
        message='Your application description page.'
    )

@app.route('/api/<endpoint>', methods=["GET", "POST"])
def api(endpoint):
    """Responds to api requests"""
    if endpoint == "put":
        return api_put.api_put(request.values)
    elif endpoint == "get":
        return api_get.api_get(request.values)

@app.route('/api/debug')
def debug():
    return str(sys.version)

