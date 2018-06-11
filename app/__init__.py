from os import getenv
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_redis import Redis
from flask_runner import Manager
from flask_cors import CORS, cross_origin
from flask.ext.cache import Cache
from app.helpers.blueprints_helper import register_blueprints
from app.helpers.json_encoder_helper import ApiJSONEncoder

flask = Flask(__name__)
flask.config.from_object('config.'+ getenv('ENV', 'Development'))
flask.config['JSON_AS_ASCII'] = False
flask.json_encoder = ApiJSONEncoder

db = SQLAlchemy(flask)
redis = Redis(flask)
manager = Manager(flask)
cors = CORS(flask)
cache = Cache(flask)

register_blueprints(flask, 'apis')
