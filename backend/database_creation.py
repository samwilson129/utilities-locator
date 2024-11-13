import mysql.connector
from mysql.connector import Error

def initialize_database():
    try:
        conn = mysql.connector.connect(
            host='localhost',
            user='root',
            password='Sarang@433'
        )
        
        if conn.is_connected():
            cursor = conn.cursor()
            cursor.execute('''
            -- Main DDL statements
            DROP DATABASE IF EXISTS utilities_locator; 
            CREATE DATABASE utilities_locator;

            USE utilities_locator;

            CREATE TABLE additional_location (
                location VARCHAR(500),
                latitude FLOAT,
                longitude FLOAT
            );

            CREATE TABLE location (
                location VARCHAR(500),
                latitude FLOAT,
                longitude FLOAT
            );

            CREATE TABLE atm (
                name VARCHAR(50),
                address VARCHAR(500),
                phone VARCHAR(20),
                email VARCHAR(50),
                zip INT
            );

            CREATE TABLE bus_stops (
                stop_name VARCHAR(100),
                num_trips_in_stop INT,
                boothcode INT
            );

            CREATE TABLE bus_arrival (
                bus_name VARCHAR(100),
                stop_name VARCHAR(100)
            );

            CREATE TABLE malls (
                mall_name VARCHAR(50),
                address VARCHAR(200)
            );

            CREATE TABLE metro_station (
                station_name VARCHAR(50),
                line VARCHAR(50),
                layout VARCHAR(50),
                short_form VARCHAR(20)
            );

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

            -- Key constraints
            ALTER TABLE location ADD CONSTRAINT pk_location PRIMARY KEY (location);
            ALTER TABLE atm ADD CONSTRAINT pk_atm PRIMARY KEY (address);
            ALTER TABLE bus_stops ADD CONSTRAINT pk_bus_stops PRIMARY KEY (stop_name);
            ALTER TABLE bus_arrival ADD CONSTRAINT pk_bus_arrival PRIMARY KEY (bus_name, stop_name);
            ALTER TABLE bus_arrival ADD CONSTRAINT fk_bus_arrival_stop FOREIGN KEY (stop_name) REFERENCES bus_stops(stop_name);
            ALTER TABLE malls ADD CONSTRAINT pk_malls PRIMARY KEY (mall_name);
            ALTER TABLE metro_station ADD CONSTRAINT pk_metro_station PRIMARY KEY (station_name);
            ALTER TABLE restaurant ADD CONSTRAINT pk_restaurant PRIMARY KEY (address);
            ALTER TABLE atm ADD CONSTRAINT fk_atm_location FOREIGN KEY (address) REFERENCES location(location);
            ALTER TABLE malls ADD CONSTRAINT fk_malls_location FOREIGN KEY (address) REFERENCES location(location);
            ALTER TABLE bus_stops ADD CONSTRAINT fk_bus_stops_location FOREIGN KEY (stop_name) REFERENCES location(location);
            ALTER TABLE additional_location ADD CONSTRAINT pk_additional_location PRIMARY KEY (location);
            ALTER TABLE metro_station ADD CONSTRAINT fk_metro_station_location FOREIGN KEY(station_name) REFERENCES additional_location(location);''')
            print("Database setup, tables, triggers, and procedures created successfully!")

    except Error as e:
        print(f"Error: {e}")

    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()
    
    run_insert_statements_from_file('additional_location_insertion.sql')
    run_insert_statements_from_file('location_insertion.sql')
    run_insert_statements_from_file('atm_insertion.sql')
    run_insert_statements_from_file('mall_insertion.sql')
    run_insert_statements_from_file('bus_stop_insertion.sql')
    run_insert_statements_from_file('bus_arrival.sql')
    run_insert_statements_from_file('metro_station_insertion.sql')
    run_insert_statements_from_file('restaurant_insertion.sql')

def run_insert_statements_from_file(sql_file_path):
    try:
        conn = mysql.connector.connect(
            host='localhost',
            user='root',
            password='Sarang@433',
            database='utilities_locator',
        )
        
        if conn.is_connected():
            cursor = conn.cursor()
            with open(sql_file_path, 'r') as file:
                sql_script = file.read()
                for statement in sql_script.split(';'):
                    if statement.strip():  
                        cursor.execute(statement) 
            conn.commit()
            print(f"Data inserted successfully from {sql_file_path}")

    except Error as e:
        print(f"Error: {e}")

    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

initialize_database()
