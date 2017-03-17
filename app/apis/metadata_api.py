from flask import Blueprint, jsonify, request
from inflection import singularize
from app import redis
from os import path
import pickle

blueprint = Blueprint('metadata_api', __name__, url_prefix='/metadata')

@blueprint.route('/<string:data>/<string:id>')
@blueprint.route('/<string:data>')
def api(data, id=None):
    exceptions = [
        'cnes_ind_sus',
        'cnes_tipodeurgencia',
        'cnes_atendhos',
        'cnes_coletres'
    ]

    if data not in exceptions:
        data = singularize(data)

    if id:
        data = data + '/' + id

    return jsonify(pickle.loads(redis.get(data)))
