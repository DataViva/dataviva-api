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
    hs_07 = factory.Sequence(lambda n: '%04d' % n)
    country = factory.Sequence(lambda n: '%03d' % n)
    uf_ibge = factory.Sequence(lambda n: '%02d' % n)
    sh4 = factory.Sequence(lambda n: '%04d' % n)
    mun_ibge = factory.Sequence(lambda n: '%07d' % n)
    value = Decimal(10000)
    kg = Decimal(10000)