from sqlalchemy import Column, Integer, String, BigInteger, func, Boolean
from app import db


class Comtrade(db.Model):
    __tablename__ = 'comtrade'
    year = Column(Integer, primary_key=True)
    continent = Column(String(2), primary_key=True)
    country = Column(String(3), primary_key=True)
    product_section = Column(String(2), primary_key=True)
    product_charpter = Column(String(2), primary_key=True)
    product = Column(String(4), primary_key=True)
    weight = Column(BigInteger)
    value = Column(BigInteger)
    hidden = Column(Boolean)

    @classmethod
    def dimensions(cls):
        return [
            'year',
            'continent',
            'country',
            'product_section',
            'product_charpter',
            'product'
        ]

    @classmethod
    def aggregate(cls, value):
        return {
            'weight': func.sum(cls.weight),
            'value': func.sum(cls.value),
        }[value]

    @classmethod
    def values(cls):
        return ['weight', 'value']
