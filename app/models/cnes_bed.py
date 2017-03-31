from sqlalchemy import Column, Integer, String, func
from app import db

class CnesBed(db.Model):
    __tablename__                               = 'cnes_bed'
    year                                        = Column(Integer, primary_key=True)
    region                                      = Column(String(1), primary_key=True)
    mesoregion                                  = Column(String(4), primary_key=True)
    microregion                                 = Column(String(5), primary_key=True)
    state                                       = Column(String(2), primary_key=True)
    municipality                                = Column(String(7), primary_key=True)
    establishment                               = Column(String(7), primary_key=True)
    unit_type                                   = Column(String(2), primary_key=True)
    bed_type                                    = Column(String(1), primary_key=True)
    bed_type_per_specialty                      = Column(String(2), primary_key=True)
    number_existing_bed                         = Column(Integer, primary_key=True)
    number_existing_contract                    = Column(Integer, primary_key=True)
    number_sus_bed                              = Column(Integer, primary_key=True)
    number_non_sus_bed                          = Column(Integer, primary_key=True)
    health_region                               = Column(String(5), primary_key=True)

    @classmethod    
    def dimensions(cls):
        return [
            'year',
            'region',
            'mesoregion',
            'microregion',
            'state',
            'municipality',
            'establishment',
            'unit_type',
            'bed_type',
            'bed_type_per_specialty',
            'health_region'
        ]

    @classmethod
    def aggregate(cls, value):
        return {
            'beds': func.count(cls.number_existing_bed),
            'number_existing_bed': func.sum(cls.number_existing_bed),
            'number_existing_contract': func.sum(cls.number_existing_contract),
            'number_sus_bed': func.sum(cls.number_sus_bed),
            'number_non_sus_bed': func.sum(cls.number_non_sus_bed),
        }[value]

    @classmethod
    def values(cls):
        return ['beds', 'number_existing_bed', 'number_existing_contract', 'number_sus_bed', 'number_non_sus_bed']
