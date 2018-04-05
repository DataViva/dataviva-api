from sqlalchemy import Column, Integer, String, func, Boolean
from app import db

class CnesProfessional(db.Model):
    __tablename__               = 'cnes_professional'
    year                        = Column(Integer, primary_key=True)
    region                      = Column(String(1), primary_key=True)
    mesoregion                  = Column(String(4), primary_key=True)
    microregion                 = Column(String(5), primary_key=True)
    state                       = Column(String(2), primary_key=True)
    municipality                = Column(String(7), primary_key=True)
    establishment               = Column(String(7), primary_key=True)
    unit_type                   = Column(String(2), primary_key=True)
    occupation_family           = Column(String(4), primary_key=True)
    occupation_group            = Column(String(1), primary_key=True)
    cns_number                  = Column(String(15), primary_key=True)
    professional_link           = Column(String(8), primary_key=True)
    sus_healthcare_professional = Column(String(1), primary_key=True)
    other_hours_worked          = Column(Integer, primary_key=True)
    hospital_hour               = Column(Integer, primary_key=True)
    ambulatory_hour             = Column(Integer, primary_key=True)
    health_region               = Column(String(5), primary_key=True)
    hierarchy_level             = Column(String(2), primary_key=True)
    hidden                      = Column(Boolean)

    @classmethod
    def dimensions(cls):
        return [
            'year',
            'region',
            'mesoregion',
            'microregion',
            'state',
            'municipality',
            'occupation_family',
            'occupation_group',
            'establishment',
            'unit_type',
            'cns_number',
            'professional_link',
            'sus_healthcare_professional',
            'health_region',
            'hierarchy_level',
        ]

    @classmethod
    def aggregate(cls, value):
        return {
            'professionals': func.count(),
            'other_hours_worked': func.sum(cls.other_hours_worked),
            'hospital_hour': func.sum(cls.hospital_hour),
            'ambulatory_hour': func.sum(cls.ambulatory_hour),
        }[value]

    @classmethod
    def values(cls):
        return ['professionals', 'other_hours_worked', 'hospital_hour', 'ambulatory_hour']
