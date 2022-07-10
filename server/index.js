import express from "express";
import helmet from "helmet";
import Database from "better-sqlite3";

// Setup express
const app = express();
const port = 3000;
app.use(express.json());
app.use(helmet());

// Setup database
const db = new Database("./database/data.db");

// Serve the static site
app.get("/", (req, res) => {
  res.send("Homepage");
});

// Return all instances, pageable per 100 rows - useful for debugging
app.get("/api/fermentation-data", (req, res) => {
  const page = req.query.page || 0;
  const data = db.prepare("SELECT * from instances LIMIT ?, 100").all(page);
  res.json(data);
});

// Return date ranges for individual instances by user
app.get("/api/fermentation-data/:user/", (req, res) => {
  const user = req.params.user;
  const data = db
    .prepare(
      "SELECT timestamp, device_name from instances WHERE user = ? ORDER BY device_name"
    )
    .all(user);

  // Add epoch time so we can easily calculate intervals
  data.map((n) => {
    n.epoch = new Date(n.timestamp).getTime();
  });

  const instances = [];

  if (data.length === 1) {
    // A single instance recorded so return just that one even though it's not a range
    instances.push({
      deviceName: data[0].device_name,
      startDate: data[0].timestamp,
      endDate: data[0].timestamp,
    });
  } else if (data.length > 1) {
    // Multiple instances recorded, seperate by deviations in the timestamp intervals
    let lastInterval = data[1].epoch - data[0].epoch;
    let lastStartingDate = data[0].timestamp;
    for (var i = 1; i < data.length; i++) {
      const interval = data[i].epoch - data[i - 1].epoch;
      if (interval !== lastInterval) {
        instances.push({
          deviceName: data[0].device_name,
          startDate: lastStartingDate,
          endDate: data[i].timestamp,
        });
        lastInterval = lastInterval;
        lastStartingDate = data[i].timestamp;
      }
    }
  }

  res.json(instances);
});

// Returns data between two dates
app.get("/api/fermentation-data/:user/:deviceName", (req, res) => {
  const dateStart = req.query?.start || "1970-01-01 00:00:00";
  const dateEnd = req.query?.end || "2038-01-19 3:14:00";

  // Get current data
  const deviceData = db
    .prepare(
      "SELECT * from instances WHERE user = ? AND device_name = ? ORDER BY id DESC LIMIT 1"
    )
    .get(req.params.user, req.params.deviceName);

  // Get historical data - limit this to timestamp, temp, and gravity to reduce db query payload
  const instanceData = db
    .prepare(
      "SELECT temperature, gravity, timestamp from instances WHERE user = ? AND device_name = ? AND timestamp BETWEEN ? AND ?"
    )
    .all(req.params.user, req.params.deviceName, dateStart, dateEnd);

  res.json({
    current: {
      timestamp: deviceData.timestamp,
      gravity: deviceData.gravity,
      temperature: deviceData.temperature,
      temperatureUnit: deviceData.temperature_units,
      battery: deviceData.battery,
      singalStrength: deviceData.rssi,
      interval: deviceData.interval,
    },
    historical: {
      timestamp: instanceData.map((n) => n.timestamp),
      gravity: instanceData.map((n) => n.gravity),
      temperature: instanceData.map((n) => n.temperature),
    },
  });
});

// Download a csv of the instance
app.get("/api/export-data/:user/:deviceName", (req, res) => {});

// Commit new data
app.post("/api/fermentation-data/:user", (req, res) => {
  const values = [
    req.params.user,
    req.body?.name,
    req.body?.temperature,
    req.body?.gravity,
    req.body?.angle,
    req.body?.battery,
    req.body?.RSSI,
    req.body?.temp_units,
    req.body?.interval,
  ];
  const query = db
    .prepare(
      "INSERT INTO instances (user, device_name, temperature, gravity, angle, battery, rssi, temperature_units, interval) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .run(...values);

  if (query.changes === 1) {
    res.json({ ok: true });
  } else {
    res.status(400).json({ ok: false });
  }
});

// Delete data within a date range
app.delete("/api/fementation-data/:user/:deviceName", (req, res) => {});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
