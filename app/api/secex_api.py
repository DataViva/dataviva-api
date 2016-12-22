from flask import Blueprint, jsonify, request
from sqlalchemy import func
from app.models.secex import Secex
from app import db

blueprint = Blueprint('secex_api', __name__, url_prefix='/secex')
valid_dimensions = set(['state', 'product', 'trade_partner'])

@blueprint.route('/')
def list():
    query = Secex.query.limit(10)
    return jsonify(data=[dict(secex) for secex in query.all()], headers=[ "year", "month", "product", "country", "state", "port", "municipality", "value", "kg", "trade_type",])

@blueprint.route('/states/')
def states():
    if not set(request.args.keys()).issubset(valid_dimensions):
        return 'erro', 403

    dimensions = [Secex.state]

    columns = dimensions + [func.sum(Secex.value), func.sum(Secex.kg)]
    query = Secex.query.with_entities(*columns).filter_by(**request.args.to_dict()).group_by(*dimensions)

    return jsonify(data=query.all(), headers=['state', 'value', 'kg'])


@blueprint.route('/states/products/')
def states_products():
    if not set(request.args.keys()).issubset(valid_dimensions):
        return 'erro', 403

    dimensions = [Secex.state, Secex.product]

    columns = dimensions + [func.sum(Secex.value), func.sum(Secex.kg)]
    query = Secex.query.with_entities(*columns).filter_by(**request.args.to_dict()).group_by(*dimensions)

    return jsonify(data=query.all(), headers=['state', 'product', 'value', 'kg'])