from sqlalchemy import Column, Integer, String, func, Boolean
from app import db


class Hedu(db.Model):
    __tablename__ = 'hedu'
    year = Column(Integer, primary_key=True)
    region = Column(String(1), primary_key=True)
    mesoregion = Column(String(4), primary_key=True)
    microregion = Column(String(5), primary_key=True)
    state = Column(String(2), primary_key=True)
    municipality = Column(String(7), primary_key=True)
    university = Column(String(5), primary_key=True)
    university_campus = Column(String(7), primary_key=True)
    funding_type = Column(String(1), primary_key=True)
    school_type = Column(String(1), primary_key=True)
    hedu_course_field = Column(String(2), primary_key=True)
    hedu_course = Column(String(6), primary_key=True)
    enrolled = Column(String(12), primary_key=True)
    graduate = Column(String(1), primary_key=True)
    entrant = Column(String(1), primary_key=True)
    academic_degree = Column(String(2), primary_key=True)
    distance_learning = Column(String(1), primary_key=True)
    shift = Column(String(2), primary_key=True)
    gender = Column(String(2), primary_key=True)
    age = Column(Integer)
    ethnicity = Column(String(2), primary_key=True)
    state_of_birth = Column(String(2), primary_key=True)
    municipality_of_birth = Column(String(7), primary_key=True)
    admission_year = Column(String(4))
    admission_month = Column(String(2))
    hidden = Column(Boolean)

    @classmethod
    def dimensions(cls):
        return [
            'year',
            'region',
            'mesoregion',
            'microregion',
            'state',
            'municipality',
            'university',
            'university_campus',
            'funding_type',
            'school_type',
            'hedu_course_field',
            'hedu_course',
            'enrolled',
            'graduate',
            'entrant',
            'academic_degree',
            'distance_learning',
            'shift',
            'gender',
            'age',
            'ethnicity',
            'state_of_birth',
            'municipality_of_birth',
            'admission_year',
            'admission_month'
        ]

    @classmethod
    def aggregate(cls, value):
        return {
            'enrolleds': func.count(),
            'entrants': func.sum(cls.entrant),
            'graduates': func.sum(cls.graduate),
            'average_age': func.avg(cls.age)
        }[value]

    @classmethod
    def values(cls):
        return ['enrolleds', 'entrants', 'graduates', 'average_age']
