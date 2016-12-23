from sqlalchemy import Column, Integer, String, Numeric, BigInteger
from app import db

class Secex(db.Model):
    __tablename__ = 'secex'
    year = Column(Integer, primary_key=True)
    month = Column(Integer, primary_key=True)
    product = Column(String(4), primary_key=True)
    country = Column(String(3), primary_key=True)
    state = Column(String(2), primary_key=True)
    port = Column(String(4), primary_key=True)
    municipality = Column(String(7), primary_key=True)
    value = Column(BigInteger)
    kg = Column(BigInteger)
    trade_type = Column(String(6), primary_key=True)

    def __iter__(self):
        yield "year", self.year
        yield "month", self.month
        yield "product", self.product
        yield "country", self.country
        yield "state", self.state
        yield "port", self.port
        yield "municipality", self.municipality
        yield "value", self.value
        yield "kg", self.kg
        yield "trade_type", self.trade_type
