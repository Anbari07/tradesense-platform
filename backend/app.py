from flask import Flask, jsonify, request
from flask_cors import CORS
from market import get_us_stock_data, get_moroccan_stock_data
from models import db, User, Challenge, Trade

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tradesense.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

with app.app_context():
    db.create_all()

# --- L'ARBITRE ---
def check_challenge_rules(challenge):
    if challenge.status != 'active': return challenge.status
    start = challenge.start_balance
    current = challenge.current_equity
    
    if current <= (start * 0.90): challenge.status = 'failed'
    elif current >= (start * 1.10): challenge.status = 'passed'
        
    db.session.commit()
    return challenge.status

@app.route('/')
def home():
    return jsonify({"message": "TradeSense API Ready", "status": "online"})

@app.route('/api/price/<ticker>')
def get_price(ticker):
    data = get_moroccan_stock_data(ticker) if ticker in ['IAM', 'ATW'] else get_us_stock_data(ticker)
    return jsonify(data) if data else (jsonify({"error": "Ticker inconnu"}), 404)

@app.route('/api/start_challenge', methods=['POST'])
def start_challenge():
    user = User.query.first()
    if not user:
        user = User(username="Trader1")
        db.session.add(user)
        db.session.commit()
    
    Challenge.query.filter_by(user_id=user.id).delete()
    
    new_challenge = Challenge(user_id=user.id, start_balance=100000, current_equity=100000, status='active')
    db.session.add(new_challenge)
    db.session.commit()
    return jsonify({"message": "Challenge Démarré !", "balance": 100000})

@app.route('/api/trade', methods=['POST'])
def execute_trade():
    data = request.json
    challenge = Challenge.query.filter_by(status='active').first()
    
    if not challenge: return jsonify({"error": "Aucun challenge actif"}), 400

    ticker = data.get('ticker')
    amount = float(data.get('amount'))
    
    market_data = get_moroccan_stock_data(ticker) if ticker in ['IAM', 'ATW'] else get_us_stock_data(ticker)
    if not market_data: return jsonify({"error": "Marché fermé"}), 500
    
    import random
    pnl_value = amount * random.uniform(-0.05, 0.05)
    challenge.current_equity += pnl_value
    
    new_trade = Trade(
        challenge_id=challenge.id, symbol=ticker, type=data.get('type'),
        entry_price=market_data['price'], volume=amount/market_data['price'],
        profit=pnl_value, status='closed'
    )
    db.session.add(new_trade)
    db.session.commit()
    
    new_status = check_challenge_rules(challenge)
    return jsonify({"message": "Ordre exécuté", "new_balance": challenge.current_equity, "status": new_status})

@app.route('/api/account')
def get_account():
    challenge = Challenge.query.order_by(Challenge.id.desc()).first()
    if not challenge: return jsonify(None)
    return jsonify({"balance": challenge.current_equity, "status": challenge.status, "start_balance": challenge.start_balance})

if __name__ == '__main__':
    app.run(debug=True, port=5000)

    