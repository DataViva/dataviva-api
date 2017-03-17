from sqlalchemy import Column, Integer, String, func
from app import db

class CnesEstablishment(db.Model):
    __tablename__                   = 'cnes_establishment'
    year                            = Column(Integer, primary_key=True)
    region                          = Column(String(1), primary_key=True)
    mesoregion                      = Column(String(4), primary_key=True)
    microregion                     = Column(String(5), primary_key=True)
    state                           = Column(String(2), primary_key=True)
    municipality                    = Column(String(7), primary_key=True)
    cnes                            = Column(String(7), primary_key=True)
    establishment_type              = Column(String(2), primary_key=True)
    sus_bond                        = Column(String(1), primary_key=True)
    provider_type                   = Column(String(2), primary_key=True)
    ambulatory_attention            = Column(String(1), primary_key=True)
    hospital_attention              = Column(String(1), primary_key=True)
    emergency_facilities            = Column(String(1), primary_key=True)
    ambulatory_care_facilities      = Column(String(1), primary_key=True)
    surgery_center_facilities       = Column(Integer, primary_key=True)
    obstetrical_center_facilities   = Column(Integer, primary_key=True)
    neonatal_unit_facilities        = Column(String(1), primary_key=True)
    hospital_care                   = Column(String(1), primary_key=True)
    selective_waste_collection      = Column(String(1), primary_key=True)
    dependency_level                = Column(String(1), primary_key=True)
    health_region                   = Column(String(5), primary_key=True)
    administrative_sphere           = Column(String(2), primary_key=True)
    tax_withholding                 = Column(String(2), primary_key=True)
    hierarchy_level                 = Column(String(2), primary_key=True)
    unit_type                       = Column(String(2), primary_key=True)


    @classmethod    
    def dimensions(cls):
        return [
            'year',
            'region',
            'mesoregion',
            'microregion',
            'state',
            'municipality',
        ]

    @classmethod
    def aggregate(cls, value):
        return {
            'establishments': func.count(cls.cnes)
        }[value]

    @classmethod
    def values(cls):
        return ['establishments']
