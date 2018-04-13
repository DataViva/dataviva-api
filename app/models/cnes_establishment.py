from sqlalchemy import Column, Integer, String, func, Boolean
from app import db

class CnesEstablishment(db.Model):
    __tablename__               = 'cnes_establishment'
    year                        = Column(Integer, primary_key=True)
    region                      = Column(String(1), primary_key=True)
    mesoregion                  = Column(String(4), primary_key=True)
    microregion                 = Column(String(5), primary_key=True)
    state                       = Column(String(2), primary_key=True)
    municipality                = Column(String(7), primary_key=True)
    establishment               = Column(String(7), primary_key=True)
    unit_type                   = Column(String(2), primary_key=True)
    sus_bond                    = Column(String(1), primary_key=True)
    provider_type               = Column(String(2), primary_key=True)
    ambulatory_attention        = Column(String(1), primary_key=True)
    hospital_attention          = Column(String(1), primary_key=True)
    emergency_facility          = Column(String(1), primary_key=True)
    ambulatory_care_facility    = Column(String(1), primary_key=True)
    surgery_center_facility     = Column(String(1), primary_key=True)
    obstetrical_center_facility = Column(String(1), primary_key=True)
    neonatal_unit_facility      = Column(String(1), primary_key=True)
    hospital_care               = Column(String(1), primary_key=True)
    selective_waste_collection  = Column(String(1), primary_key=True)
    dependency_level            = Column(String(1), primary_key=True)
    health_region               = Column(String(5), primary_key=True)
    administrative_sphere       = Column(String(2), primary_key=True)
    tax_withholding             = Column(String(2), primary_key=True)
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
            'establishment',
            'unit_type',
            'sus_bond',
            'provider_type',
            'ambulatory_attention',
            'hospital_attention',
            'emergency_facility',
            'ambulatory_care_facility',
            'surgery_center_facility',
            'obstetrical_center_facility',
            'neonatal_unit_facility',
            'hospital_care',
            'selective_waste_collection',
            'dependency_level',
            'health_region',
            'administrative_sphere',
            'tax_withholding',
            'hierarchy_level',
        ]

    @classmethod
    def aggregate(cls, value):
        return {
            'establishments': func.count(cls.establishment)
        }[value]

    @classmethod
    def values(cls):
        return ['establishments']
