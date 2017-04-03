from flask import Blueprint, jsonify, request
from importlib import import_module

blueprint = Blueprint('search_api', __name__, url_prefix='/search')

@blueprint.route('/<string:model>')
def api(model):
    global Model
    class_name = model.title() + 'Search'
    model_name = model + '_search'
    Model = getattr(import_module('app.models.' + model_name), class_name)

    query_string = request.args.get('query')

    if not query_string:
        return 'Query is missing', 400

    query = Model.query.filter(Model.search.contains(query_string))

    return jsonify(data=[q.serialize() for q in query.all()])
