from flask import Blueprint, jsonify
from inflection import singularize
from app import redis
import pickle

blueprint = Blueprint('metadata_api', __name__, url_prefix='/metadata')


@blueprint.route('/<string:data>/<string:id>')
@blueprint.route('/<string:data>')
def api(data, id=None):
    data = singularize(data)

    if id:
        data = data + '/' + id

    return jsonify(pickle.loads(redis.get(data)))
