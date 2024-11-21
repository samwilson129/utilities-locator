import mysql.connector

db = mysql.connector.connect(
    host="localhost",
    user="root", 
    password="root", 
    database="utilities_locator"
)

cursor = db.cursor()
cursor.execute("ALTER TABLE location ADD CONSTRAINT pk_location PRIMARY KEY (location);")
cursor.execute("ALTER TABLE atm ADD CONSTRAINT pk_atm PRIMARY KEY (address);")
cursor.execute("ALTER TABLE bus_stops ADD CONSTRAINT pk_bus_stops PRIMARY KEY (stop_name);")
cursor.execute("ALTER TABLE bus_arrival ADD CONSTRAINT pk_bus_arrival PRIMARY KEY (bus_name, stop_name);")
cursor.execute("ALTER TABLE malls ADD CONSTRAINT pk_malls PRIMARY KEY (mall_name);")
cursor.execute("ALTER TABLE metro_station ADD CONSTRAINT pk_metro_station PRIMARY KEY (station_name);")
cursor.execute("ALTER TABLE restaurant ADD CONSTRAINT pk_restaurant PRIMARY KEY (address(255));")
cursor.execute("ALTER TABLE additional_location ADD CONSTRAINT pk_additional_location PRIMARY KEY (location);")
cursor.execute("ALTER TABLE bus_arrival ADD CONSTRAINT fk_bus_arrival_stop FOREIGN KEY (stop_name) REFERENCES bus_stops(stop_name) ON UPDATE CASCADE ON DELETE CASCADE;")
cursor.execute("ALTER TABLE atm ADD CONSTRAINT fk_atm_location FOREIGN KEY (address) REFERENCES location(location) ON UPDATE CASCADE ON DELETE CASCADE;")
cursor.execute("ALTER TABLE malls ADD CONSTRAINT fk_malls_location FOREIGN KEY (address) REFERENCES location(location) ON UPDATE CASCADE ON DELETE CASCADE;")
cursor.execute("ALTER TABLE bus_stops ADD CONSTRAINT fk_bus_stops_location FOREIGN KEY (stop_name) REFERENCES location(location) ON UPDATE CASCADE ON DELETE CASCADE;")
cursor.execute("ALTER TABLE metro_station ADD CONSTRAINT fk_metro_station_location FOREIGN KEY (station_name) REFERENCES additional_location(location) ON UPDATE CASCADE ON DELETE CASCADE;")

db.commit()

cursor.close()
db.close()
