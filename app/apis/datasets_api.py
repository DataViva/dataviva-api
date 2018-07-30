from importlib import import_module
from flask import Blueprint, jsonify, request
from sqlalchemy import func, distinct
from inflection import singularize
from app import cache, flask
from app.helpers.cache_helper import api_cache_key

blueprint = Blueprint('api', __name__, url_prefix='/')


@blueprint.route('years/<dataset>/')
@cache.cached(key_prefix=api_cache_key('years_dataset'))
def years(dataset):
    # global model
    model = get_model(dataset)
    entities = get_columns(['year'], model)
    query = model.query.with_entities(*entities).distinct().order_by('year')
    if flask.config['HIDE_DATA']:
        query = query.filter_by(hidden=False)
    query_result = [year[0] for year in query.all()]
    return jsonify(years=query_result)


@blueprint.route('<dataset>/<path:path>/')
@cache.cached(key_prefix=api_cache_key('dataset'))
def api(dataset, path):
    # global model
    model = get_model(dataset)

    dimensions = [singularize(item) for item in path.split('/')]
    if invalid_dimension(dimensions, model):
        return 'Error', 403

    filters = {k: v for k, v in request.args.to_dict().items() if k in model.dimensions()}
    counts = [c for c
              in [singularize(item) for item in request.args.getlist('count')]
              if c in model.dimensions()]

    if flask.config['HIDE_DATA']:
        filters['hidden'] = False
    values = get_values(request, model)

    group_columns = get_columns(dimensions, model)
    count_columns = get_columns(counts, model)
    aggregated_values = [model.aggregate(v) for v in values]

    headers = get_headers(group_columns)           \
        + get_headers(count_columns, '_count') \
        + values
    entities = group_columns                               \
        + [func.count(distinct(col)) for col in count_columns] \
        + aggregated_values
    query = model.query.with_entities(*entities)
    query = query.filter_by(**filters).group_by(*group_columns)

    direction = request.args.get('direction', '')
    order = request.args.get('order', None)
    if order:
        if order in model.dimensions():
            order_by = getattr(model, order)
        else:
            order_by = model.aggregate(order)

        if direction.lower() == 'desc':
            order_by = order_by.desc()

        query = query.order_by(order_by)

    limit = request.args.get('limit', None)
    if limit:
        query = query.limit(limit)

    for field, value in get_not_equal_filters(request):
        query = query.filter(getattr(model, field) != value)

    return jsonify(data=query.all(), headers=headers)


def get_model(dataset):
    class_name = ''.join([x.title() for x in dataset.split('_')])
    model = getattr(import_module('app.models.' + dataset), class_name)
    return model


def get_values(req, model):
    values = [v for v in req.args.getlist('value') if v in model.values()]
    return values if values else model.values()


def get_not_equal_filters(req):
    not_filters = [(field[:-1], req.args[field]) for field
                   in req.args.keys()
                   if field.endswith('!')]
    return not_filters


def get_headers(columns, suffix=''):
    return [column.key + suffix for column in columns]


def get_columns(dimensions, model):
    return [getattr(model, dimension) for dimension in dimensions]


def invalid_dimension(dimensions, model):
    return not set(dimensions).issubset(set(model.dimensions()))
