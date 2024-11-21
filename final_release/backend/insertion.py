import mysql.connector
from mysql.connector import Error

def run_insert_statements_from_file(sql_file_path):
    try:
        conn = mysql.connector.connect(
            host='localhost',
            user='root',
            password='root',
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

if __name__ == "__main__":
    files = [
        'additional_location_insertion.sql',
        'location_insertion.sql',
        'atm_insertion.sql',
        'mall_insertion.sql',
        'bus_stop_insertion.sql',
        'bus_arrival.sql',
        'metro_station_insertion.sql',
        'restaurant_insertion.sql',
    ]

    for file in files:
        run_insert_statements_from_file(file)
