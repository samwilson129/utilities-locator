import mysql.connector
from mysql.connector import Error

def create_triggers():
    try:
        conn = mysql.connector.connect(
            host='localhost',
            user='root',
            password='Sarang@433',
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

            trigger_3 = '''
            CREATE TRIGGER handle_report_delete
            AFTER INSERT ON report
            FOR EACH ROW
            BEGIN
                IF NEW.action = 'delete' THEN
                    CASE NEW.utility_type
                        WHEN 'atm' THEN
                            DELETE FROM atm WHERE name = NEW.name;
                        WHEN 'bus_stops' THEN
                            DELETE FROM bus_stops WHERE stop_name = NEW.name;
                        WHEN 'malls' THEN
                            DELETE FROM malls WHERE mall_name = NEW.name;
                        WHEN 'metro_station' THEN
                            DELETE FROM metro_station WHERE station_name = NEW.name;
                        WHEN 'restaurant' THEN
                            DELETE FROM restaurant WHERE name = NEW.name;
                    END CASE;
                END IF;
            END;
            '''
            cursor.execute(trigger_3)
            print("Triggers created successfully!")

    except Error as e:
        print(f"Error: {e}")

    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

create_triggers()
