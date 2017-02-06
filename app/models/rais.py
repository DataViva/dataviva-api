from sqlalchemy import Column, Integer, String, Numeric, func, distinct
from app import db

class Rais(db.Model):
    __tablename__      = 'rais'
    region             = Column(String(1), primary_key=True)
    mesoregion         = Column(String(4), primary_key=True)
    microregion        = Column(String(5), primary_key=True)
    state              = Column(String(2), primary_key=True)
    municipality       = Column(String(7), primary_key=True)
    occupation_family  = Column(String(4), primary_key=True)
    occupation_group   = Column(String(1), primary_key=True)
    industry_class     = Column(String(5), primary_key=True)
    industry_division  = Column(String(2), primary_key=True)
    industry_section   = Column(String(1), primary_key=True)
    establishment      = Column(String(14), primary_key=True)
    employee           = Column(String(11), primary_key=True)
    ethnicity          = Column(String(2), primary_key=True)
    establishment_size = Column(String(2), primary_key=True)
    gender             = Column(String(1), primary_key=True)
    legal_nature       = Column(String(2), primary_key=True)
    literacy           = Column(String(2), primary_key=True)
    simple             = Column(String(2), primary_key=True)
    year               = Column(Integer, primary_key=True)
    age                = Column(Integer)
    wage               = Column(Numeric(17,2))


    @classmethod
    def dimensions(cls):
        return [
            'region',
            'mesoregion',
            'microregion',
            'state',
            'municipality',
            'occupation_family',
            'occupation_group',
            'industry_class',
            'industry_division',
            'industry_section',
            'establishment',
            'employee',
            'ethnicity',
            'establishment_size',
            'gender',
            'legal_nature',
            'literacy',
            'simple',
            'year',
        ]

    @classmethod
    def aggregate(cls, value):
        return {
            'average_age': func.avg(cls.age),
            'average_wage': func.avg(cls.wage),
            'wage': func.sum(cls.wage),
            'jobs': func.count(cls.employee),
            'average_establishment_size': func.count(cls.employee) / func.count(distinct(cls.establishment))    
        }[value]

    @classmethod
    def values(cls):
        return ['average_age', 'average_wage', 'wage', 'jobs', 'average_establishment_size']
