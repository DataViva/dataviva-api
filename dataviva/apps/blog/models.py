from dataviva import db
from sqlalchemy import ForeignKey


class Post(db.Model):
    __tablename__ = 'blog_post'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(400))
    author = db.Column(db.String(100))
    text_call = db.Column(db.String(500))
    text_content = db.Column(db.Text(4194304))
    thumb = db.Column(db.Text(4194304))
    postage_date = db.Column(db.DateTime)
    active = db.Column(db.Boolean)
    subject = db.relationship('PostSubject', backref='blog_post', lazy='eager')

    def subject_str(self):
        return self.subject[0].name

    def date_str(self):
        return self.postage_date.strftime('%d/%m/%Y')

    def __repr__(self):
        return '<Post %r>' % (self.title)


class PostSubject(db.Model):
    __tablename__ = 'blog_subject'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50))
    post_id = db.Column(db.Integer, ForeignKey('blog_post.id'))

    def __init__(self, name=None):
        self.name = name

    def __repr__(self):
        return '<PostSubject %r>' % (self.name)
