from sqlalchemy import Column, Integer, String, Numeric, func
from app import db

class Rais(db.Model):
    __tablename__        = 'rais'
    occupation           = Column(String(6), primary_key=True)
    cnae                 = Column(String(5), primary_key=True)
    cnae_section         = Column(String(1), primary_key=True)
    cnae_division        = Column(String(2), primary_key=True)
    literacy             = Column(String(1), primary_key=True)
    establishment        = Column(String(14), primary_key=True)
    simple               = Column(String(1), primary_key=True)
    municipality         = Column(String(7), primary_key=True)
    employee             = Column(String(11), primary_key=True)
    ethnicity            = Column(String(2), primary_key=True)
    gender               = Column(String(1), primary_key=True)
    establishment_size   = Column(String(1), primary_key=True)
    year                 = Column(Integer, primary_key=True)
    age                  = Column(Integer)
    wage_received        = Column(Numeric(17,2))
    average_monthly_wage = Column(Numeric(17,2))

    @classmethod
    def dimensions(cls):
        return [
            'occupation',
            'cnae',
            'cnae_section',
            'cnae_division',
            'literacy',
            'establishment',
            'simple',
            'municipality',
            'employee',
            'ethnicity',
            'gender',
            'establishment_size',
            'year',
        ]

    @classmethod
    def agg_values(cls):
        return [
            func.avg(cls.age),
            func.avg(cls.average_monthly_wage),
            func.sum(cls.wage_received),
            func.count(cls.employee),
        ]

    @classmethod
    def value_headers(cls):
        return ['age', 'average_monthly_wage', 'wage_received', 'jobs']
