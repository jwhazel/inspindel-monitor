# iSpindel Monitor
This is an open source package consisting of a frontend and backend that captures and displays data from the iSpindel  https://www.ispindel.de/

## Notes
* I believe this is the payload iSpindel sends as a POST: https://github.com/universam1/iSpindel/blob/master/pio/src/iSpindel.cpp#L683-L693

## SQLITE database structure:
`CREATE TABLE "instances" (
	"id"	INTEGER,
	"user"	TEXT,
	"device_name"	TEXT,
	"temperature"	REAL,
	"gravity"	REAL,
	"angle"	REAL,
	"temperature_units"	TEXT,
	"battery"	REAL,
	"rssi"	INTEGER,
	"interval"	INTEGER,
	"timestamp"	DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id" AUTOINCREMENT)
);`


## License
Beerware 🍺