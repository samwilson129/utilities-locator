import mysql.connector
from mysql.connector import Error

def create_triggers():
    try:
        conn = mysql.connector.connect(
            host='localhost',
            user='root',
            password='root',
            database='utilities_locator',
        )

        if conn.is_connected():
            cursor = conn.cursor()


            trigger_1 = '''
            CREATE TRIGGER update_restaurant_rating_votes
            BEFORE UPDATE ON restaurant
            FOR EACH ROW
            BEGIN
                IF OLD.rate <> NEW.rate THEN
                    SET NEW.votes = OLD.votes + 1;
                END IF;
            END;
            '''
            cursor.execute(trigger_1)


            trigger_2 = '''
            CREATE TRIGGER update_bus_stop_trips
            AFTER INSERT ON bus_arrival
            FOR EACH ROW
            BEGIN
                UPDATE bus_stops
                SET num_trips_in_stop = num_trips_in_stop + 1
                WHERE stop_name = NEW.stop_name;
            END;
            '''
            cursor.execute(trigger_2)


            trigger_3_atm = '''
            CREATE TRIGGER update_atm_location
            BEFORE UPDATE ON atm
            FOR EACH ROW
            BEGIN
                -- Update address in location table
                UPDATE location
                SET location = NEW.address
                WHERE location = OLD.address;
            END;
            '''
            cursor.execute(trigger_3_atm)

            trigger_3_mall = '''
            CREATE TRIGGER update_mall_location
            BEFORE UPDATE ON malls
            FOR EACH ROW
            BEGIN
                -- Update address in location table
                UPDATE location
                SET location = NEW.address
                WHERE location = OLD.address;
            END;
            '''
            cursor.execute(trigger_3_mall)

            trigger_3_bus_stop = '''
            CREATE TRIGGER update_bus_stop_location
            BEFORE UPDATE ON bus_stops
            FOR EACH ROW
            BEGIN
                -- Update address in location table
                UPDATE location
                SET location = NEW.stop_name
                WHERE location = OLD.stop_name;
            END;
            '''
            cursor.execute(trigger_3_bus_stop)


            trigger_4 = '''
            CREATE TRIGGER update_metro_station_location
            BEFORE UPDATE ON metro_station
            FOR EACH ROW
            BEGIN
                -- Update address in additional_location table
                UPDATE additional_location
                SET location = NEW.station_name
                WHERE location = OLD.station_name;
            END;
            '''
            cursor.execute(trigger_4)

            conn.commit()
            print("Triggers created successfully!")

    except Error as e:
        print(f"Error: {e}")

    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()


create_triggers()
