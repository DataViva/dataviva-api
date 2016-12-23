from flask import Blueprint, jsonify, request
from sqlalchemy import func
from inflection import singularize
from app.models.secex import Secex
from app import db

blueprint = Blueprint('secex_api', __name__, url_prefix='/secex')

@blueprint.route('/<path:path>/')
def api(path):
    dimensions = map(singularize, path.split('/'))

    if invalid_dimension(request.args.keys()) or invalid_dimension(dimensions):
        return 'Error', 403

    filters = request.args.to_dict()
    group_columns = [getattr(Secex, dimension) for dimension in dimensions]

    columns = group_columns + [func.sum(Secex.value), func.sum(Secex.kg)]
    query = Secex.query.with_entities(*columns).filter_by(**filters).group_by(*group_columns)

    return jsonify(data=query.all(), headers=dimensions + ['value', 'kg'])


def invalid_dimension(dimensions):
    return not set(dimensions).issubset(set(['state', 'product', 'country']))
