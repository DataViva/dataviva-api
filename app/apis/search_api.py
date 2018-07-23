# -*- coding: utf-8 -*-

from importlib import import_module
from unicodedata import normalize
from flask import Blueprint, jsonify, request

blueprint = Blueprint('search_api', __name__, url_prefix='/search')


@blueprint.route('/<string:model>')
def api(model):
    global Model
    class_name = model.title() + 'Search'
    model_name = model + '_search'
    Model = getattr(import_module('app.models.' + model_name), class_name)

    query_string = request.args.get('query')
    query_string = remove_accents(query_string).lower()

    if not query_string:
        return 'Query is missing', 400

    query = Model.query

    for word in query_string.split(' '):
        query = query.filter(Model.search.contains(word))

    return jsonify(data=[q.serialize() for q in query.all()])


def remove_accents(txt):
    return normalize('NFKD', txt.decode('utf-8')).encode('ASCII', 'ignore')
