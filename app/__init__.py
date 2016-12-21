from os import getenv
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_runner import Manager
from app.helpers.blueprints_helper import register_blueprints
from app.helpers.json_encoder_helper import ApiJSONEncoder

flask = Flask(__name__)
flask.config.from_object('config.'+ getenv('ENV', 'Development'))
flask.json_encoder = ApiJSONEncoder

db = SQLAlchemy(flask)
manager = Manager(flask)

register_blueprints(flask, 'api')
