import json
from flask import Blueprint, jsonify, redirect
from inflection import singularize
from app import redis, flask

blueprint = Blueprint('metadata_api', __name__, url_prefix='/metadata')


@blueprint.route('/<string:data>/<string:id_item>')
def get_item(data, id_item):
    item = "{}/{}".format(singularize(data), id_item)

    return jsonify(json.loads(redis.get(item)))


@blueprint.route('/<string:data>')
def get_all(data):
    file_name = "{}.json".format(singularize(data))

    return redirect(flask.config['S3_PUBLIC_BUCKET_URL'] + file_name)
