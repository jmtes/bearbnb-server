#!/usr/bin/python3
""" version 1 api """
from flask import Flask, Blueprint, request, jsonify
from models import storage
from api.v1.views import app_views
from os import getenv

app = Flask(__name__)


app.register_blueprint(app_views)


@app.errorhandler(404)
def handle_404(ex):
    ''' Handle 404 error. '''
    if request.path.startswith('/api/v1/'):
        return jsonify(error='Not found'), 404


@app.teardown_appcontext
def teardown(exception):
    """close storage"""
    return storage.close()


if __name__ == "__main__":
    app.run(host=getenv('HBNB_API_HOST'),
            port=getenv('HBNB_API_PORT'),
            threaded=True)
