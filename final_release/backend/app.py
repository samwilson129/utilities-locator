from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
import geopy.distance
import subprocess

app = Flask(__name__)
CORS(app)
initialized = False

# Functions to execute required setup scripts
def run_creation_script():
    try:
        subprocess.run(['python', 'database_creation.py'], check=True)
        print("Database creation script executed successfully.")
    except subprocess.CalledProcessError as e:
        print(f"Error running database creation script: {e}")

def run_trigger_creation():
    try:
        subprocess.run(['python', 'triggers.py'], check=True)
        print("Trigger creation script executed successfully.")
    except subprocess.CalledProcessError as e:
        print(f"Error running trigger creation script: {e}")

def run_procedure_creation():
    try:
        subprocess.run(['python', 'procedures.py'], check=True)
        print("Procedure creation script executed successfully.")
    except subprocess.CalledProcessError as e:
        print(f"Error running procedure creation script: {e}")

def run_keys_creation():
    try:
        subprocess.run(['python', 'keys.py'], check=True)
        print("Keys creation script executed successfully.")
    except subprocess.CalledProcessError as e:
        print(f"Error running key creation script: {e}")

def run_insertion_creation():
    try:
        subprocess.run(['python', 'insertion.py'], check=True)
        print("Insertion script executed successfully.")
    except subprocess.CalledProcessError as e:
        print(f"Error running insertion script: {e}")

# Initialize the database and run setup scripts
@app.before_request
def initialize():
    global initialized
    if not initialized:
        run_creation_script()
        run_keys_creation()
        run_insertion_creation()
        run_trigger_creation()
        run_procedure_creation()
        initialized = True

# Get database connection
def get_db_connection():
    try:
        conn = mysql.connector.connect(
            host='localhost',
            user='root',
            password='root',
            database='utilities_locator'
        )
        return conn
    except Error as e:
        print(f"Error: {e}")
        return None

# Fetch utilities with optimized queries
def get_utilities(utility_type, max_distance, user_lat, user_lon):
    conn = get_db_connection()
    utilities = []
    if conn:
        cursor = conn.cursor(dictionary=True)

        # Aggregate query for bus_stop
        if utility_type == "bus_stop":
            query = f"""
                SELECT 
                    bs.stop_name AS name, 
                    bs.num_trips_in_stop, 
                    bs.boothcode, 
                    l.latitude, 
                    l.longitude, 
                    ROUND(ST_DISTANCE_SPHERE(
                        POINT(l.longitude, l.latitude), 
                        POINT({user_lon}, {user_lat})
                    ) / 1000, 2) AS distance
                FROM bus_stops bs
                JOIN location l ON bs.stop_name = l.location
                HAVING distance <= {max_distance}
            """
            cursor.execute(query)

            # Fetching buses for each bus stop
            for row in cursor.fetchall():
                cursor.execute("""
                    SELECT b.bus_name
                    FROM bus_arrival b
                    WHERE b.stop_name = %s;
                """, (row["name"],))
                buses = cursor.fetchall()
                row["buses"] = [bus["bus_name"] for bus in buses]
                utilities.append(row)

        # General query structure for other utility types
        else:
            queries = {
                "atm": """
                    SELECT a.name, a.address, l.latitude, l.longitude, a.phone, a.email, a.zip
                    FROM atm a
                    JOIN location l ON a.address = l.location
                    WHERE ROUND(ST_DISTANCE_SPHERE(
                        POINT(l.longitude, l.latitude), 
                        POINT({user_lon}, {user_lat})
                    ) / 1000, 2) <= {max_distance};
                """,
                "mall": """
                    SELECT m.mall_name AS name, m.address, l.latitude, l.longitude
                    FROM malls m
                    JOIN location l ON m.address = l.location
                    WHERE ROUND(ST_DISTANCE_SPHERE(
                        POINT(l.longitude, l.latitude), 
                        POINT({user_lon}, {user_lat})
                    ) / 1000, 2) <= {max_distance};
                """,
                "metro_station": """
                    SELECT ms.station_name AS name, ms.line, ms.layout, ms.short_form, al.latitude, al.longitude
                    FROM metro_station ms
                    JOIN additional_location al ON ms.station_name = al.location
                    WHERE ROUND(ST_DISTANCE_SPHERE(
                        POINT(al.longitude, al.latitude), 
                        POINT({user_lon}, {user_lat})
                    ) / 1000, 2) <= {max_distance};
                """,
                "restaurant": """
                    SELECT r.name, r.address, l.latitude, l.longitude, r.phone, r.rate, r.online_order, r.book_table, 
                           r.votes, r.location, r.rest_type, r.dish_liked, r.cuisines, r.approx_cost, r.listed_in
                    FROM restaurant r
                    JOIN location l ON r.location = l.location
                    WHERE ROUND(ST_DISTANCE_SPHERE(
                        POINT(l.longitude, l.latitude), 
                        POINT({user_lon}, {user_lat})
                    ) / 1000, 2) <= {max_distance};
                """
            }

            if utility_type in queries:
                query = queries[utility_type].format(user_lon=user_lon, user_lat=user_lat, max_distance=max_distance)
                cursor.execute(query)
                for row in cursor.fetchall():
                    utilities.append(row)

        cursor.close()
        conn.close()
    return utilities

# Report utility (called from frontend)
def report_utility(utility_type, name, action, reason):
    conn = get_db_connection()
    if conn:
        cursor = conn.cursor()
        try:
            cursor.callproc('report_utility', [utility_type, name, action, reason])
            conn.commit()
            return True
        except mysql.connector.Error as e:
            print(f"Error: {e}")
            return False
        finally:
            cursor.close()
            conn.close()
    return False

# Flask route to report a utility
@app.route('/report_utility', methods=['POST'])
def report_utility_route():
    data = request.get_json()
    utility_type = data.get('type')
    name = data.get('name')
    action = data.get('action')
    reason = data.get('reason')
    success = report_utility(utility_type, name, action, reason)
    return jsonify({"success": success})

# Flask route to get utilities within a max distance
@app.route('/get_utilities', methods=['GET'])
def get_utilities_route():
    utility_type = request.args.get('type')
    max_distance_str = request.args.get('distance')
    user_lat = float(request.args.get('lat'))
    user_lon = float(request.args.get('lon'))
    try:
        max_distance = float(max_distance_str) if max_distance_str else 10.0
    except ValueError:
        max_distance = 10.0
    utilities = get_utilities(utility_type, max_distance, user_lat, user_lon)
    return jsonify(utilities)

# Main route
@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)

