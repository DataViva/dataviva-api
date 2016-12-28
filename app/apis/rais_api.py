from flask import Blueprint, jsonify, request, render_template
from sqlalchemy import func, distinct
from inflection import singularize
from app.models.secex import Rais as Model
from app import db

blueprint = Blueprint('secex_api', __name__, url_prefix='/secex')

@blueprint.route('/<path:path>/')
def api(path):
    dimensions = map(singularize, path.split('/'))
    if invalid_dimension(dimensions):
        return 'Error', 403
        
    filters = {k: v for k, v in request.args.to_dict().iteritems() if k in Model.dimensions()}
    counts = [c for c in map(singularize, request.args.getlist('count')) if c in Model.dimensions()]

    count_columns = get_columns(counts)
    group_columns = get_columns(dimensions)
    headers = get_headers(group_columns) + get_headers(count_columns, '_count') + Model.value_headers()

    entities = group_columns + map(lambda x: func.count(distinct(x)), count_columns) + Model.agg_values()
    query = Model.query.with_entities(*entities).filter_by(**filters).group_by(*group_columns)

    return jsonify(data=query.all(), headers=headers)

def get_headers(columns, suffix=''):
    return map(lambda x: x.key + suffix, columns)

def get_columns(dimensions):
    return [getattr(Model, dimension) for dimension in dimensions]

def invalid_dimension(dimensions):
    return not set(dimensions).issubset(set(Model.dimensions()))
