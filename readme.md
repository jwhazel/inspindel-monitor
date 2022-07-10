# iSpindel Monitor

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

`CREATE TABLE devices(id INTEGER PRIMARY KEY AUTOINCREMENT, user text, device_name text, temperature_units text, battery real, rssi real, interval integer, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL);`