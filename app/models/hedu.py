from sqlalchemy import Column, Integer, String, func
from app import db

class Hedu(db.Model):
    __tablename__     = 'hedu'
    year              = Column(Integer, primary_key=True)
    region            = Column(String(1), primary_key=True)
    mesoregion        = Column(String(4), primary_key=True)
    microregion       = Column(String(5), primary_key=True)
    state             = Column(String(2), primary_key=True)
    municipality      = Column(String(7), primary_key=True)
    university        = Column(String(5), primary_key=True)
    hedu_course_field = Column(String(2), primary_key=True)
    hedu_course       = Column(String(6), primary_key=True)
    shift             = Column(String(2), primary_key=True)
    graduates         = Column(String(2), primary_key=True)
    entrants          = Column(String(2), primary_key=True)
    gender            = Column(String(2), primary_key=True)
    ethnicity         = Column(String(2), primary_key=True)
    age               = Column(Integer)

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
            'hedu_course_field',
            'hedu_course',
            'shift',
            'graduates',
            'entrants',
            'gender',
            'ethnicity',
        ]

    @classmethod
    def aggregate(cls, value):
        return {
            'average_age': func.avg(cls.age),
            'students': func.count(),
        }[value]

    @classmethod
    def values(cls):
        return ['average_age', 'students']
