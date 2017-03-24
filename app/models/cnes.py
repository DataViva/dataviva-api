from sqlalchemy import Column, Integer, String, func
from app import db

class Cnes(db.Model):
    __tablename__ = 'cnes'
    id            = Column(String(7), primary_key=True)
    name_pt       = Column(String(255), primary_key=True)
    name_en       = Column(String(255), primary_key=True)
    region        = Column(String(1), primary_key=True)
    mesoregion    = Column(String(4), primary_key=True)
    microregion   = Column(String(5), primary_key=True)
    state         = Column(String(2), primary_key=True)
    municipality  = Column(String(7), primary_key=True)

    @classmethod    
    def dimensions(cls):
        return [
            'id',
            'name_pt',
            'name_en',
            'region',
            'mesoregion',
            'microregion',
            'state',
            'municipality',
        ]

    @classmethod
    def aggregate(cls, value):
        return {}[value]

    @classmethod
    def values(cls):
        return []
