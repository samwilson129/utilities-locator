import mysql.connector

def create_report_procedure():

    conn = mysql.connector.connect(
        host='localhost',
        user='root',
        password='root',
        database='utilities_locator'
    )
   
    cursor = conn.cursor()
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

        cursor.execute(procedure)
        conn.commit()  

        print("Stored procedure 'report_utility' created successfully.")

    except mysql.connector.Error as err:
        print(f"Error: {err}")
    
    finally:
        cursor.close()
        conn.close()
def create_report_statistics_procedure():
    conn = mysql.connector.connect(
        host='localhost',
        user='root',
        password='root',
        database='utilities_locator'
    )

    cursor = conn.cursor()
    procedure = '''
    CREATE PROCEDURE report_statistics()
BEGIN
    SELECT COUNT(*) AS total_reports
    FROM report;

    SELECT utility_type, COUNT(*) AS total_reports_per_utility
    FROM report
    GROUP BY utility_type;

    SELECT action, COUNT(*) AS total_reports_per_action
    FROM report
    GROUP BY action;

    SELECT AVG(CHAR_LENGTH(reason)) AS avg_reason_length
    FROM report;

    SELECT utility_type, action, COUNT(*) AS total_reports
    FROM report
    GROUP BY utility_type, action;

    SELECT utility_type AS most_reported
    FROM report
    GROUP BY utility_type
    HAVING COUNT(*) = (
        SELECT MAX(report_count)
        FROM (
            SELECT COUNT(*) AS report_count
            FROM report
            GROUP BY utility_type
        ) AS report_counts
    )
    LIMIT 1;

    SELECT utility_type AS most_updated
    FROM report
    WHERE action = 'update'
    GROUP BY utility_type
    HAVING COUNT(*) = (
        SELECT MAX(update_count)
        FROM (
            SELECT COUNT(*) AS update_count
            FROM report
            WHERE action = 'update'
            GROUP BY utility_type
        ) AS update_counts
    )
    LIMIT 1;
END;
'''

    try:
        cursor.execute(procedure)
        conn.commit()
        print("Procedure 'report_statistics' created successfully.")
    except mysql.connector.Error as err:
        print(f"Error: {err}")
    finally:
        cursor.close()
        conn.close()

create_report_statistics_procedure()

create_report_procedure()
