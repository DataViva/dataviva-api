# -*- coding: utf-8 -*-
import boto3
from app import flask


def read_csv(filename):
    client = boto3.client(
        's3',
        aws_access_key_id=flask.config['S3_ACCESS_KEY'],
        aws_secret_access_key=flask.config['S3_SECRET_KEY'],
    )

    obj = client.get_object(Bucket='dataviva-etl', Key=filename)
    
    return obj['Body']

def save_json(filename, object):
    client = boto3.client(
        's3',
        aws_access_key_id=flask.config['S3_ACCESS_KEY'],
        aws_secret_access_key=flask.config['S3_SECRET_KEY'],
    )

    obj = client.put_object(Bucket='api-metadata', Key=filename, Body=object, ContentType='application/json')
