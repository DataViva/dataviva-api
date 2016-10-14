# -*- coding: utf-8 -*-
from flask.ext.wtf import Form
from wtforms import HiddenField, TextField, TextAreaField, DateField, BooleanField, validators, ValidationError
from dataviva.utils.custom_fields import TagsField
from models import Subject


def english_field(message):

    def _english_field(form, field):
        if form.dual_language.data and not field.data:
            raise ValidationError(message)

    return _english_field


class RegistrationForm(Form):

    title_pt = TextField('title_pt', validators=[
        validators.Required(u"Por favor, insira o título do post."),
        validators.Length(max=400)
    ])

    title_en = TextField('title_en', validators=[
        validators.Length(max=400),
        english_field(u"Por favor, insira o título do post.")
    ])

    show_home = BooleanField('show_home')

    dual_language = BooleanField('dual_language')

    author = TextField('author', validators=[
        validators.Required(u"Por favor, insira o autor do post."),
        validators.Length(max=100)
    ])

    publish_date = DateField('publish_date', validators=[
        validators.Required(u"Por favor, insira a data do post.")],
        format='%d/%m/%Y',
        description='Formato da data: dia/mês/ano'
    )

    subject_pt = TagsField('subject_pt',
        choices=[],
        validators=[
            validators.Required(u"Por favor, insira a categoria do post."),
    ])

    subject_en = TagsField('subject_en',
        choices=[],
        validators=[
            english_field(u"Por favor, insira a categoria do post.")
        ])

    text_call_pt = TextAreaField('text_call_pt', validators=[
        validators.Required(u"Por favor, insira uma chamada para o post."),
        validators.Length(max=500)
    ])

    text_call_en = TextAreaField('text_call_en', validators=[
        validators.Length(max=500),
        english_field(u"Por favor, insira uma chamada para o post.")
    ])

    text_content_pt = HiddenField('text_content_pt', validators=[
        validators.Required(u"Por favor, insira o conteúdo do post.")
    ]) 

    text_content_en = HiddenField('text_content_en', validators=[
        english_field(u"Por favor, insirao conteúdo do post.")
    ])

    thumb = HiddenField('thumb', validators=[
        validators.Required(u"Por favor, insira uma imagem para a chamada.")
    ])
