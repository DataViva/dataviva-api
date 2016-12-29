from flask import Blueprint, jsonify, request
from app import redis
from os import path
import pickle

blueprint = Blueprint('metadata_api', __name__, url_prefix='/metadata')

@blueprint.route('/<path:data>')
def api(data):
    content = {
        path.basename(data): pickle.loads(redis.get(data))
    }
    return jsonify(**content)