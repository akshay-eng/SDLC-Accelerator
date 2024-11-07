from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class CacheToken(db.Model):
    __tablename__ = "accesstoken"
    id = db.Column(db.Integer, primary_key=True)
    access_key = db.Column(db.String(450), unique=True, nullable=False)
    token = db.Column(db.String(2000), unique=True, nullable=False)
    expiry = db.Column(db.Integer, nullable=False)
