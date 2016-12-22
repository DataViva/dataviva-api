import factory
import logging 
from random import randint
from decimal import Decimal
from app import db
from app.models.secex import Secex

logging.getLogger("factory").setLevel(logging.WARN)

class SecexFactory(factory.alchemy.SQLAlchemyModelFactory):

    class Meta:
        model = Secex
        sqlalchemy_session = db.session

    year = 2016
    month = 11
    product = factory.Sequence(lambda n: '%04d' % n)
    country = factory.Sequence(lambda n: '%03d' % n)
    state = factory.Sequence(lambda n: '%02d' % n)
    port = factory.Sequence(lambda n: '%04d' % n)
    municipality = factory.Sequence(lambda n: '%07d' % n)
    value = Decimal(10000)
    kg = Decimal(10000)
    trade_type = 'import'