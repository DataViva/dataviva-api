from sqlalchemy import Column, Integer, String, func, distinct
from app import db

class Sc(db.Model):
    __tablename__    = 'sc'
    year                      = Column(Integer, primary_key=True)
    region                    = Column(String(1), primary_key=True)
    mesoregion                = Column(String(4), primary_key=True)
    microregion               = Column(String(5), primary_key=True)
    state                     = Column(String(2), primary_key=True)
    municipality              = Column(String(7), primary_key=True)
    university                = Column(String(5), primary_key=True)
    sc_course_field           = Column(String(2), primary_key=True)
    sc_course                 = Column(String(5), primary_key=True)
    sc_school                 = Column(String(8), primary_key=True)
    sc_class                  = Column(String(8), primary_key=True)
    administrative_dependency = Column(String(1), primary_key=True)
    age                       = Column(Integer)
    gender                    = Column(String(1), primary_key=True)
    ethnicity                 = Column(String(2), primary_key=True)

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
            'sc_course_field',
            'sc_course',
            'sc_school',
            'sc_class',
            'administrative_dependency',
            'gender',
            'ethnicity',
        ]

    @classmethod
    def aggregate(cls, value):
        return {
            'average_age': func.avg(cls.age),
            'students': func.count(),
            'classes': func.count(distinct(cls.sc_class)),
            'average_class_size': func.count() / func.count(distinct(cls.sc_class)),
            'schools': func.count(distinct(cls.sc_school)),
        }[value]

    @classmethod
    def values(cls):
        return ['average_age', 'students', 'classes', 'average_class_size', 'schools']