from flask import Blueprint, jsonify
from app.models.secex import Secex

blueprint = Blueprint('secex_api', __name__, url_prefix='/secex')

@blueprint.route("/")
def list():
    query = Secex.query.limit(10)
    return jsonify([dict(secex) for secex in query.all()])