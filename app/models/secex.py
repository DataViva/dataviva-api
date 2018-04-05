from sqlalchemy import Column, Integer, String, BigInteger, func, Boolean
from app import db

class Secex(db.Model):
    __tablename__   = 'secex'
    year            = Column(Integer, primary_key=True)
    month           = Column(Integer, primary_key=True)
    type            = Column(String(6), primary_key=True)
    continent       = Column(String(2), primary_key=True)
    country         = Column(String(3), primary_key=True)
    region          = Column(String(1), primary_key=True)
    mesoregion      = Column(String(4), primary_key=True)
    microregion     = Column(String(5), primary_key=True)
    state           = Column(String(2), primary_key=True)
    municipality    = Column(String(7), primary_key=True)
    port            = Column(String(4), primary_key=True)
    product_section = Column(String(2), primary_key=True)
    product_chapter = Column(String(2), primary_key=True)
    product         = Column(String(4), primary_key=True)
    value           = Column(BigInteger)
    kg              = Column(BigInteger)
    hidden          = Column(Boolean)

    @classmethod
    def dimensions(cls):
        return [
            'year',
            'month',
            'type',
            'continent',
            'country',
            'region',
            'mesoregion',
            'microregion',
            'state',
            'municipality',
            'port',
            'product_section',
            'product_chapter',
            'product',
        ]

    @classmethod
    def aggregate(cls, value):
        return {
            'value': func.sum(cls.value),
            'kg': func.sum(cls.kg),
        }[value]

    @classmethod
    def values(cls):
        return ['value', 'kg']
