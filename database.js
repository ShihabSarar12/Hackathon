import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();
const pool = mysql
  .createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB,
  })
  .promise();

const createDatabase = async () => {
  const dropdb = await pool.query(`DROP DATABASE IF EXISTS ??;`, [
    process.env.MYSQL_DB,
  ]);
  const createdb = await pool.query("CREATE DATABASE IF NOT EXISTS ??;", [
    process.env.MYSQL_DB,
  ]);
  const stations = await pool.query(`CREATE TABLE stations (
        station_id INT NOT NULL AUTO_INCREMENT,
        station_name VARCHAR(100) NOT NULL,
        longitude FLOAT NOT NULL,
        latitude FLOAT NOT NULL,
        PRIMARY KEY (station_id)
    )`);

  const trains = await pool.query(`
    CREATE TABLE IF NOT EXISTS trains (
        train_id INT NOT NULL AUTO_INCREMENT,
        train_name VARCHAR(100) NOT NULL,
        capacity INT NOT NULL,
        PRIMARY KEY (train_id)
    )
`);
  const train_stops = await pool.query(`
CREATE TABLE IF NOT EXISTS train_stops (
    stop_id INT NOT NULL AUTO_INCREMENT,
    train_id INT,
    station_id INT,
    arrival_time TIME,
    departure_time TIME,
    fare INT,
    PRIMARY KEY (stop_id),
    FOREIGN KEY (train_id) REFERENCES trains(train_id),
    FOREIGN KEY (station_id) REFERENCES stations(station_id)
)
`);
};

const getTrainStopsData = async () => {
  try {
    const [data] = await pool.query(
      "SELECT `stop_id`, `train_id`, `station_id`, `arrival_time`, `departure_time`, `fare` FROM `train_stops` WHERE 1"
    );
    return {
      data,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: error.code,
    };
  }
};

const getTrainsData = async () => {
  try {
    const [data] = await pool.query(
      "SELECT `train_id`, `train_name`, `capacity` FROM `trains` WHERE 1"
    );
    return {
      data,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: error.code,
    };
  }
};

const getStations = async () => {
  try {
    const [data] = await pool.query(`SELECT * FROM stations;`);
    return {
      data,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: error.code,
    };
  }
};

const getTrainStops = async (stationId) => {
  try {
    const [data] = await pool.query(
      `
              SELECT train_stops.train_id, arrival_time, departure_time
              FROM train_stops
              JOIN trains ON train_stops.train_id = trains.train_id
              WHERE station_id = ?
              ORDER BY IFNULL(departure_time, '23:59') ASC, IFNULL(arrival_time, '23:59') ASC, trains.train_id ASC;
          `,
      [stationId]
    );
    return {
      data,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: error.code,
    };
  }
};

const getWallet = async (wallet_id) => {
  try {
    const [data] = await pool.query(
      `SELECT * FROM wallets INNER JOIN users ON wallets.user_id = users.user_id WHERE wallet_id = ?;`,
      [wallet_id]
    );
    return {
      data,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: error.code,
    };
  }
};

export {
  createDatabase,
  getStations,
  getTrainStops,
  getWallet,
  getTrainStopsData,
  getTrainsData,
};
