from flask import Blueprint, jsonify
from sqlalchemy import func
from app.models.secex import Secex
from app import db

blueprint = Blueprint('secex_api', __name__, url_prefix='/secex')

@blueprint.route('/')
def list():
    query = Secex.query.limit(10)
    return jsonify(data=[dict(secex) for secex in query.all()], headers=['year', 'month', 'hs_07', 'country', 'uf_ibge', 'sh4', 'mun_ibge', 'value', 'kg'])


@blueprint.route('/states/')
def states():
    secex = db.session.query(Secex.uf_ibge, func.sum(Secex.value), func.sum(Secex.kg)).group_by(Secex.uf_ibge).all()
    return jsonify(data=secex, headers=['ibge_uf', 'value', 'kg'])
