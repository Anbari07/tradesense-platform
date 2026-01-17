from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    challenges = db.relationship('Challenge', backref='owner', lazy=True)

class Challenge(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    start_balance = db.Column(db.Float, default=5000.0)
    current_equity = db.Column(db.Float, default=5000.0)
    status = db.Column(db.String(20), default='active')
    start_date = db.Column(db.DateTime, default=datetime.utcnow)
    trades = db.relationship('Trade', backref='challenge', lazy=True)

class Trade(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    challenge_id = db.Column(db.Integer, db.ForeignKey('challenge.id'), nullable=False)
    symbol = db.Column(db.String(10), nullable=False)
    type = db.Column(db.String(4), nullable=False)
    entry_price = db.Column(db.Float, nullable=False)
    volume = db.Column(db.Float, nullable=False)
    exit_price = db.Column(db.Float, nullable=True)
    profit = db.Column(db.Float, nullable=True)
    status = db.Column(db.String(10), default='open')
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    