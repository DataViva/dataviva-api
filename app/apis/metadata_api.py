from flask import Blueprint, jsonify, redirect
from inflection import singularize
from app import redis, flask
import pickle

blueprint = Blueprint('metadata_api', __name__, url_prefix='/metadata')


@blueprint.route('/<string:data>/<string:id>')
def item(data, id):
    item = "{}/{}".format(singularize(data), id)

    return jsonify(pickle.loads(redis.get(item)))

@blueprint.route('/<string:data>')
def all(data):
    file_name = "{}.json".format(singularize(data))

    return redirect(flask.config['S3_PUBLIC_BUCKET_URL'] + file_name)
