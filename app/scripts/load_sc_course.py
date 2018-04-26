# -*- coding: utf-8 -*-
import json
import pandas as pd
import pickle
from app import redis
from flask_script import Command
from s3 import read_csv, save_json

class LoadScCourse(Command):
    
    """
    Load school courses metadata
    """

    def run(self):
        csv = read_csv('redshift/attrs/attrs_sc_course.csv')
        df = pd.read_csv(
            csv,
            sep=';',
            header=0,
            names=['id', 'name_en', 'name_pt'],
            converters={
                "id": str
            }
        )

        sc_courses = {}
        sc_courses_field = {}

        for _, row in df.iterrows():

            if len(row['id']) == 2:
                sc_course_field = {
                    'name_pt': row["name_pt"],
                    'name_en': row["name_en"]
                }

                redis.set('sc_course_field/' + str(row['id']), pickle.dumps(sc_course_field))
                sc_courses_field[row['id']] = sc_course_field

            elif len(row['id']) == 5:
                sc_course = {
                    'name_pt': row["name_pt"],
                    'name_en': row["name_en"]
                }

                redis.set('sc_course/' + str(row['id']), pickle.dumps(sc_course))
                sc_courses[row['id']] = sc_course

        save_json('attrs_sc_course.json', json.dumps(sc_courses, ensure_ascii=False))
        save_json('attrs_sc_course_field.json', json.dumps(sc_courses_field, ensure_ascii=False))

        print "SC Courses loaded."