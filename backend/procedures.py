import mysql.connector

def create_report_procedure():
    # Connect to MySQL database
    conn = mysql.connector.connect(
        host='localhost',
        user='root',
        password='root',
        database='utilities_locator'
    )
    
    cursor = conn.cursor()

    # SQL procedure for reporting utilities
    procedure = """
    CREATE PROCEDURE report_utility(
        IN utility_type VARCHAR(50),
        IN utility_name VARCHAR(100),
        IN action ENUM('update', 'delete'),
        IN reason TEXT
    )
    BEGIN
        INSERT INTO report (utility_type, name, action, reason)
        VALUES (utility_type, utility_name, action, reason);
    END;
    """

    try:
        # Create the new stored procedure
        cursor.execute(procedure)
        conn.commit()  # Commit the changes

        print("Stored procedure 'report_utility' created successfully.")

    except mysql.connector.Error as err:
        print(f"Error: {err}")
    
    finally:
        cursor.close()
        conn.close()

# Call the function to create the procedure
create_report_procedure()
