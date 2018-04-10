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
flask.json_encoder = ApiJSONEncoder

db = SQLAlchemy(flask)
redis = Redis(flask)
manager = Manager(flask)
cors = CORS(flask)
cache = Cache(flask, config={
    'CACHE_TYPE': flask.config['CACHE_TYPE'],
    'CACHE_KEY_PREFIX': flask.config['CACHE_KEY_PREFIX'],
    'CACHE_DEFAULT_TIMEOUT': flask.config['CACHE_DEFAULT_TIMEOUT'],
    'CACHE_REDIS_HOST': flask.config['REDIS_HOST'],
    'CACHE_REDIS_PORT': flask.config['REDIS_PORT'],
    'CACHE_REDIS_DB': flask.config['REDIS_DB']
})

register_blueprints(flask, 'apis')
