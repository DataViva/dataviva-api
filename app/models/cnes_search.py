from sqlalchemy import Column, Integer, String, func
from app import db

class CnesSearch(db.Model):
    __tablename__ = 'cnes_search'
    id            = Column(String(7), primary_key=True)
    name          = Column(String(255), primary_key=True)
    region        = Column(String(255), primary_key=True)
    mesoregion    = Column(String(255), primary_key=True)
    microregion   = Column(String(255), primary_key=True)
    state         = Column(String(255), primary_key=True)
    municipality  = Column(String(255), primary_key=True)
    search        = Column(String(1000), primary_key=True)


    def serialize(self):
        return {
            'id': self.id,
            'name': self.name,
            'region': self.region,
            'mesoregion': self.mesoregion,
            'microregion': self.microregion,
            'state': self.state,
            'municipality': self.municipality,
            'search': self.search,
        }