from sqlalchemy import Column, Integer, String, Numeric, func
from app import db

class Hedu(db.Model):
    __tablename__           = 'hedu'
    id_university;          = Column(String(4), primary_key=True)                   
    adm_category;           = Column(String(1), primary_key=True)
    academic_organization;  = Column(String(1), primary_key=True)
    id_course;              = Column(String(6), primary_key=True)
    degree;                 = Column(String(1), primary_key=True)
    modality;               = Column(String(1), primary_key=True)
    level;                  = Column(String(1), primary_key=True)
    id_student;             = Column(String(8), primary_key=True)
    id_Enrolled;            = Column(String(1), primary_key=True)
    id_Graduates;           = Column(String(1), primary_key=True)
    id_Entrants;            = Column(String(1), primary_key=True)
    year_entry;             = Column(Integer, primary_key=True)
    gender;                 = Column(String(1), primary_key=True)
    age;                    = Column(Integer)
    ethnicity;              = Column(String(1), primary_key=True)
    municipality;           = Column(String(7), primary_key=True)
    co_Course;              = Column(String(6), primary_key=True)
    name_Course;            = Column(String(255), primary_key=True)
    morning;                = Column(String(1), primary_key=True)
    evening;                = Column(String(1), primary_key=True)
    night;                  = Column(String(1), primary_key=True)
    full_time;              = Column(String(1), primary_key=True)
    year                    = Column(Integer, primary_key=True)


    @classmethod    
    def dimensions(cls):
        return [
            'id_university',
            'adm_category',
            'academic_organization',
            'id_course',
            'degree',
            'modality',
            'level',
            'id_student',
            'id_Enrolled',
            'id_Graduates',
            'id_Entrants',
            'year_entry',
            'gender',
            'age',
            'ethnicity',
            'municipality',
            'co_Course',
            'name_Course',
            'morning',
            'evening',
            'night',
            'full_time',
            'year',
        ]

    @classmethod
    def agg_values(cls):
        return [
            func.avg(cls.age),
            func.count(cls.id_student),
            func.count(cls.id_university),
            func.count(cls.year_entry),
            func.count(cls.municipality)          
        ] 

    @classmethod
    def value_headers(cls):
        return ['age', 'id_student', 'id_university', 'year_entry', 'municipality']



