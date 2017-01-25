from sqlalchemy import Column, Integer, String, BigInteger, func
from app import db

class Secex(db.Model):
    __tablename__   = 'secex'
    year            = Column(Integer, primary_key=True)
    month           = Column(Integer, primary_key=True)
    type            = Column(String(6), primary_key=True)
    continent       = Column(String(2), primary_key=True)
    country         = Column(String(3), primary_key=True)
    state           = Column(String(2), primary_key=True)
    mesoregion      = Column(String(4), primary_key=True)
    microregion     = Column(String(5), primary_key=True)
    municipality    = Column(String(7), primary_key=True)
    port            = Column(String(4), primary_key=True)
    product_section = Column(String(2), primary_key=True)
    product_chapter = Column(String(2), primary_key=True)
    product         = Column(String(4), primary_key=True)
    value           = Column(BigInteger)
    kg              = Column(BigInteger)

    @classmethod
    def dimensions(cls):
        return [
            'year',
            'month',
            'type',
            'continent',
            'country',
            'state',
            'mesoregion',
            'microregion',
            'municipality',
            'port',
            'product_section',
            'product_chapter',
            'product',
        ]

    @classmethod
    def agg_values(cls):
        return [func.sum(cls.value), func.sum(cls.kg)]

    @classmethod
    def value_headers(cls):
        return ['value', 'kg']
