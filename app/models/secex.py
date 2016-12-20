from sqlalchemy import Column, Integer, String, Numeric
from app import db

class Secex(db.Model):
    __tablename__ = 'secex'
    year = Column(Integer, primary_key=True)
    month = Column(Integer, primary_key=True)
    hs_07 = Column(String(4), primary_key=True)
    country = Column(String(3), primary_key=True)
    uf_ibge = Column(String(2), primary_key=True)
    sh4 = Column(String(4), primary_key=True)
    mun_ibge = Column(String(7), primary_key=True)
    value = Column(Numeric(17,2))
    kg = Column(Numeric(17,2))

    def __iter__(self):
        yield "year", self.year
        yield "month", self.month
        yield "hs_07", self.hs_07
        yield "country", self.country
        yield "uf_ibge", self.uf_ibge
        yield "sh4", self.sh4
        yield "mun_ibge", self.mun_ibge
        yield "value", str(self.value)
        yield "kg", str(self.kg)