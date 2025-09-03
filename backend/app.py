

from flask import Flask, request, jsonify, session
from flask_cors import CORS
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
from bson import ObjectId
import os
from datetime import datetime
import logging
from dotenv import load_dotenv
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'your-secret-key-here-change-in-production')

ADMIN_USERNAME = os.getenv('ADMIN_USERNAME')
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD')

# Configure CORS for React frontend
CORS(app, 
     supports_credentials=True, 
     origins=['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001'],
     allow_headers=['Content-Type', 'Authorization'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])

# MongoDB connection with error handling
try:
    client = MongoClient(os.environ.get('MONGO_URI'))
    db = client['prayatna_db']
    # Test connection
    client.admin.command('ping')
    logger.info("Successfully connected to MongoDB")
except Exception as e:
    logger.error(f"Failed to connect to MongoDB: {e}")
    # Use local MongoDB as fallback
    try:
        client = MongoClient('mongodb://localhost:27017/')
        db = client['prayatna_db']
        client.admin.command('ping')
        logger.info("Connected to local MongoDB")
    except Exception as local_err:
        logger.error(f"Failed to connect to local MongoDB: {local_err}")
        raise

# Collections
users_collection = db['users']
teams_collection = db['teams']
sports_collection = db['sports']
rankings_collection = db['rankings']
players_collection = db['players']
audit_collection = db['audit_log']

# Updated sports and teams lists
SPORTS = ['Football', 'Cricket', 'Basketball', 'Badminton', 'Table Tennis', 'Yoga', 'Chess','Athletics','Volleyball']
TEAMS = [
    'Silver Falcons', 'Black Archers', 'Desert Hawks', 'Gladiators', 
    'Tridents', 'Warlords', 'Snow Leopard', 'Firebirds'
]

# Audit logging function
def log_action(action, details=None):
    try:
        audit_entry = {
            'user_id': session.get('user_id'),
            'username': session.get('username'),
            'action': action,
            'details': details,
            'timestamp': datetime.now(),
            'ip_address': request.remote_addr
        }
        audit_collection.insert_one(audit_entry)
    except Exception as e:
        logger.error(f"Failed to log action: {e}")



# Initialize database with default data
def init_db():
    try:
        # Create default admin user if doesn't exist
        if not users_collection.find_one({'username': 'admin'}):
            users_collection.insert_one({
                'username': ADMIN_USERNAME,
                'password': generate_password_hash(ADMIN_PASSWORD),
                'role': 'admin',
                'created_at': datetime.now()
            })
            logger.info("Created default admin user")
        
        # Initialize teams if don't exist
        existing_teams = set(team['name'] for team in teams_collection.find({}, {'name': 1}))
        for team in TEAMS:
            if team not in existing_teams:
                teams_collection.insert_one({
                    'name': team,
                    'captain': f'Captain of {team}',
                    'created_at': datetime.now()
                })
        
        # Initialize sports if don't exist
        existing_sports = set(sport['name'] for sport in sports_collection.find({}, {'name': 1}))
        for sport in SPORTS:
            if sport not in existing_sports:
                sports_collection.insert_one({
                    'name': sport,
                    'description': f'{sport} competition',
                    'created_at': datetime.now()
                })

        # ✅ Fix for rankings: add missing sports into existing documents
        for ranking in rankings_collection.find({}):
            updated_sports = ranking.get('sports', {})
            changed = False

            for sport in SPORTS:
                if sport not in updated_sports:
                    updated_sports[sport] = {team: 0.0 for team in TEAMS}
                    changed = True

            if changed:
                rankings_collection.update_one(
                    {'_id': ranking['_id']},
                    {'$set': {'sports': updated_sports, 'updated_at': datetime.now()}}
                )
                logger.info(f"Updated rankings for year {ranking.get('year')} with missing sports")

        logger.info("Database initialization completed")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")


# Initialize database with default data
# def init_db():
#     try:
#         # Create default admin user if doesn't exist
#           if not users_collection.find_one({'username': ADMIN_USERNAME}):
#             users_collection.insert_one({
#                 'username': ADMIN_USERNAME,
#                 'password': generate_password_hash(ADMIN_PASSWORD),
#                 'role': 'admin',
#                 'created_at': datetime.now()
#             })
#             logger.info("Created default admin user")
        
#         # Initialize teams if don't exist
#         existing_teams = set(team['name'] for team in teams_collection.find({}, {'name': 1}))
#         for team in TEAMS:
#             if team not in existing_teams:
#                 teams_collection.insert_one({
#                     'name': team,
#                     'captain': f'Captain of {team}',
#                     'created_at': datetime.now()
#                 })
        
#         # Initialize sports if don't exist
#         existing_sports = set(sport['name'] for sport in sports_collection.find({}, {'name': 1}))
#         for sport in SPORTS:
#             if sport not in existing_sports:
#                 sports_collection.insert_one({
#                     'name': sport,
#                     'description': f'{sport} competition',
#                     'created_at': datetime.now()
#                 })
        
#         logger.info("Database initialization completed")
#     except Exception as e:
#         logger.error(f"Database initialization failed: {e}")

# Error handler
@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal error: {error}")
    return jsonify({'error': 'Internal server error'}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

# Authentication routes
@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'message': 'No data provided'}), 400
        
        username = data.get('username', '').strip()
        password = data.get('password', '')
        
        if not username or not password:
            return jsonify({'success': False, 'message': 'Username and password required'}), 400
        
        user = users_collection.find_one({'username': username})
        if user and check_password_hash(user['password'], password):
            session['user_id'] = str(user['_id'])
            session['username'] = user['username']
            session['role'] = user['role']
            
            log_action('login', {'username': username})
            
            return jsonify({
                'success': True, 
                'role': user['role'],
                'username': user['username']
            })
        
        log_action('login_failed', {'username': username, 'reason': 'invalid_credentials'})
        return jsonify({'success': False, 'message': 'Invalid credentials'}), 401
        
    except Exception as e:
        logger.error(f"Login error: {e}")
        return jsonify({'success': False, 'message': 'Server error occurred'}), 500

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    try:
        username = session.get('username')
        log_action('logout', {'username': username})
        session.clear()
        return jsonify({'success': True})
    except Exception as e:
        logger.error(f"Logout error: {e}")
        return jsonify({'success': False, 'message': 'Logout failed'}), 500

@app.route('/api/auth/check', methods=['GET'])
def check_auth():
    try:
        if 'user_id' in session:
            return jsonify({
                'authenticated': True, 
                'role': session.get('role'),
                'username': session.get('username')
            })
        return jsonify({'authenticated': False})
    except Exception as e:
        logger.error(f"Auth check error: {e}")
        return jsonify({'authenticated': False})

# Teams routes
@app.route('/api/teams', methods=['GET'])
def get_teams():
    try:
        teams = list(teams_collection.find({}, {'_id': 0, 'name': 1, 'captain': 1}))
        # Ensure all teams are present
        existing_names = {team['name'] for team in teams}
        for team_name in TEAMS:
            if team_name not in existing_names:
                teams.append({'name': team_name, 'captain': f'Captain of {team_name}'})
        
        return jsonify(teams)
    except Exception as e:
        logger.error(f"Error fetching teams: {e}")
        return jsonify([{'name': team, 'captain': f'Captain of {team}'} for team in TEAMS]), 200

# Sports routes
@app.route('/api/sports', methods=['GET'])
def get_sports():
    try:
        sports = list(sports_collection.find({}, {'_id': 0, 'name': 1, 'description': 1}))
        # Ensure all sports are present
        existing_names = {sport['name'] for sport in sports}
        for sport_name in SPORTS:
            if sport_name not in existing_names:
                sports.append({'name': sport_name, 'description': f'{sport_name} competition'})
        
        return jsonify(sports)
    except Exception as e:
        logger.error(f"Error fetching sports: {e}")
        return jsonify([{'name': sport, 'description': f'{sport} competition'} for sport in SPORTS]), 200

# Rankings routes
@app.route('/api/rankings/<int:year>', methods=['GET'])
def get_rankings(year):
    try:
        rankings = rankings_collection.find_one({'year': year})
        if not rankings:
            # Create default rankings if don't exist
            default_rankings = {
                'year': year,
                'overall': {team: 0 for team in TEAMS},
                'sports': {sport: {team: 0 for team in TEAMS} for sport in SPORTS},
                'created_at': datetime.now(),
                'updated_at': datetime.now()
            }
            rankings_collection.insert_one(default_rankings)
            rankings = default_rankings
            logger.info(f"Created default rankings for year {year}")
        
        # Remove MongoDB _id field
        rankings.pop('_id', None)
        return jsonify(rankings)
    
    except Exception as e:
        logger.error(f"Error fetching rankings for year {year}: {e}")
        # Return default structure on error
        return jsonify({
            'year': year,
            'overall': {team: 0 for team in TEAMS},
            'sports': {sport: {team: 0 for team in TEAMS} for sport in SPORTS}
        })

@app.route('/api/rankings/<int:year>', methods=['PUT'])
def update_rankings(year):
    if 'user_id' not in session:
        return jsonify({'error': 'Authentication required'}), 401
    
    try:
        data = request.get_json()
        data['updated_at'] = datetime.now()
        data['updated_by'] = session.get('username')
        
        result = rankings_collection.update_one(
            {'year': year},
            {'$set': data},
            upsert=True
        )
        
        log_action('update_rankings', {'year': year, 'modified_count': result.modified_count})
        return jsonify({'success': True, 'modified': result.modified_count > 0})
    except Exception as e:
        logger.error(f"Error updating rankings: {e}")
        return jsonify({'error': 'Failed to update rankings'}), 500

# Players routes
@app.route('/api/players/<int:year>/<sport>', methods=['GET'])
def get_players(year, sport):
    try:
        players = list(players_collection.find({
            'year': year,
            'sport': sport
        }, {'_id': 0}))
        return jsonify(players)
    except Exception as e:
        logger.error(f"Error fetching players: {e}")
        return jsonify([])

@app.route('/api/players/<int:year>/<sport>', methods=['POST'])
def add_player(year, sport):
    if 'user_id' not in session:
        return jsonify({'error': 'Authentication required'}), 401
    
    try:
        data = request.get_json()
        if not data or not data.get('name') or not data.get('team'):
            return jsonify({'error': 'Name and team are required'}), 400
            
        player_data = {
            'year': year,
            'sport': sport,
            'team': data.get('team'),
            'name': data.get('name'),
            'position': data.get('position', ''),
            'created_at': datetime.now(),
            'created_by': session.get('username')
        }
        
        result = players_collection.insert_one(player_data)
        log_action('add_player', {'year': year, 'sport': sport, 'player': data.get('name')})
        return jsonify({'success': True, 'id': str(result.inserted_id)})
    except Exception as e:
        logger.error(f"Error adding player: {e}")
        return jsonify({'error': 'Failed to add player'}), 500

@app.route('/api/players/<player_id>', methods=['DELETE'])
def delete_player(player_id):
    if 'user_id' not in session:
        return jsonify({'error': 'Authentication required'}), 401
    
    try:
        if not ObjectId.is_valid(player_id):
            return jsonify({'error': 'Invalid player ID'}), 400
            
        result = players_collection.delete_one({'_id': ObjectId(player_id)})
        log_action('delete_player', {'player_id': player_id})
        return jsonify({'success': True, 'deleted': result.deleted_count > 0})
    except Exception as e:
        logger.error(f"Error deleting player: {e}")
        return jsonify({'error': 'Failed to delete player'}), 500

@app.route('/api/years', methods=['GET'])
def get_available_years():
    try:
        years = rankings_collection.distinct('year')
        if not years:
            current_year = datetime.now().year
            years = [current_year]
        return jsonify(sorted(years, reverse=True))
    except Exception as e:
        logger.error(f"Error fetching years: {e}")
        current_year = datetime.now().year
        return jsonify([current_year, current_year - 1])

# Admin routes (optional)
@app.route('/api/admin/audit-log', methods=['GET'])
def get_audit_log():
    if session.get('role') != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    
    try:
        limit = int(request.args.get('limit', 50))
        logs = list(audit_collection.find({}, {'_id': 0}).sort('timestamp', -1).limit(limit))
        return jsonify(logs)
    except Exception as e:
        logger.error(f"Error fetching audit logs: {e}")
        return jsonify({'error': 'Failed to fetch audit logs'}), 500

if __name__ == '__main__':
    init_db()
    app.run(debug=True, host='0.0.0.0', port=5000)