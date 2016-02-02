# -*- coding: utf-8 -*-
from flask import Blueprint, render_template, g
from dataviva.apps.general.views import get_locale
from dataviva.api.attrs.services import Location as AttrsLocationService
from dataviva.api.secex.models import Ymb

mod = Blueprint('location', __name__,
                template_folder='templates',
                url_prefix='/<lang_code>/location',
                static_folder='static')


@mod.url_value_preprocessor
def pull_lang_code(endpoint, values):
    g.locale = values.pop('lang_code')


@mod.url_defaults
def add_language_code(endpoint, values):
    values.setdefault('lang_code', get_locale())


@mod.route('/')
def index():
    bra_id = '4mg'
    attrs_location_service = AttrsLocationService(bra_id='4mg')
    location_statistics = attrs_location_service.statistics()

    ''' Query básica para SECEX'''
    context['eci'] = Ymb.query.filter_by(bra_id=bra_id, month=0) \
        .order_by(desc(Ymb.year)).limit(1).first().eci

    return render_template('location/index.html', location_statistics=location_statistics, body_class='perfil-estado')
