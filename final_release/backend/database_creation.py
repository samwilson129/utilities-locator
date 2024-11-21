import mysql.connector
from mysql.connector import Error

def create_database_and_tables():
    try:
        conn = mysql.connector.connect(
            host='localhost',
            user='root',
            password='root'
        )

        if conn.is_connected():
            cursor = conn.cursor()

            # Drop and create database
            cursor.execute("DROP DATABASE IF EXISTS utilities_locator;")
            cursor.execute("CREATE DATABASE utilities_locator;")
            cursor.execute("USE utilities_locator;")
            conn.commit()

            # Create tables
            cursor.execute('''
                CREATE TABLE additional_location (
                    location VARCHAR(500),
                    latitude FLOAT,
                    longitude FLOAT
                );
            ''')

            cursor.execute('''
                CREATE TABLE location (
                    location VARCHAR(500),
                    latitude FLOAT,
                    longitude FLOAT
                );
            ''')

            cursor.execute('''
                CREATE TABLE atm (
                    name VARCHAR(50),
                    address VARCHAR(500),
                    phone VARCHAR(20),
                    email VARCHAR(50),
                    zip INT
                );
            ''')

            cursor.execute('''
                CREATE TABLE bus_stops (
                    stop_name VARCHAR(100),
                    num_trips_in_stop INT,
                    boothcode INT
                );
            ''')

            cursor.execute('''
                CREATE TABLE bus_arrival (
                    bus_name VARCHAR(100),
                    stop_name VARCHAR(100)
                );
            ''')

            cursor.execute('''
                CREATE TABLE malls (
                    mall_name VARCHAR(50),
                    address VARCHAR(200)
                );
            ''')

            cursor.execute('''
                CREATE TABLE metro_station (
                    station_name VARCHAR(50),
                    line VARCHAR(50),
                    layout VARCHAR(50),
                    short_form VARCHAR(20)
                );
            ''')

            cursor.execute('''
                CREATE TABLE restaurant (
                    address VARCHAR(1000),
                    name VARCHAR(100),
                    online_order ENUM('Yes', 'No'),
                    book_table ENUM('Yes', 'No'),
                    rate VARCHAR(50),
                    votes INT,
                    phone VARCHAR(100),
                    location VARCHAR(50),
                    rest_type VARCHAR(50),
                    dish_liked VARCHAR(200),
                    cuisines VARCHAR(100),
                    approx_cost INT,
                    listed_in VARCHAR(50)
                );
            ''')

            cursor.execute('''
                CREATE TABLE report (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    utility_type VARCHAR(50) NOT NULL,
                    name VARCHAR(100) NOT NULL,
                    action ENUM('update', 'delete') NOT NULL,
                    reason TEXT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            ''')

            print("Database and tables created successfully!")

    except Error as e:
        print(f"Error: {e}")

    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

if __name__ == "__main__":
    create_database_and_tables()
