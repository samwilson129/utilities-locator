from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.sql import func
from datetime import datetime

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///base_database.sql' 
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class Facility(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(50), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'type': self.type,
            'latitude': self.latitude,
            'longitude': self.longitude
        }

@app.route('/api/facilities', methods=['GET'])
def get_facilities():
    facility_type = request.args.get('type', 'all')
    query = Facility.query

    if facility_type != 'all':
        query = query.filter_by(type=facility_type)

    facilities = query.all()
    return jsonify([facility.to_dict() for facility in facilities])

@app.route('/api/facilities/nearby', methods=['GET'])
def get_nearby_facilities():
    lat = request.args.get('lat', type=float)
    lon = request.args.get('lon', type=float)
    radius = request.args.get('radius', default=5, type=float)  # in kilometers

    if lat is None or lon is None:
        return jsonify({'error': 'Latitude and longitude are required'}), 400

    # This is a simple distance calculation. For more accuracy, consider using PostGIS or a similar geo library
    nearby_facilities = Facility.query.filter(
        func.acos(func.sin(func.radians(lat)) * func.sin(func.radians(Facility.latitude)) + 
                  func.cos(func.radians(lat)) * func.cos(func.radians(Facility.latitude)) * 
                  func.cos(func.radians(Facility.longitude) - (func.radians(lon)))) * 6371 <= radius
    ).all()

    return jsonify([facility.to_dict() for facility in nearby_facilities])

@app.route('/api/facilities', methods=['POST'])
def add_facility():
    data = request.json
    new_facility = Facility(
        name=data['name'],
        type=data['type'],
        latitude=data['latitude'],
        longitude=data['longitude']
    )
    db.session.add(new_facility)
    db.session.commit()
    return jsonify(new_facility.to_dict()), 201

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)