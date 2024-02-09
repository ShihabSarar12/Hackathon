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
    const dropdb = await pool.query('DROP DATABASE IF EXISTS ??', [process.env.MYSQL_DB]);
    const createdb = await pool.query('CREATE DATABASE IF NOT EXISTS ??', [process.env.MYSQL_DB]);
    const stations = await pool.query(`
        CREATE TABLE stations (
            station_id INT NOT NULL AUTO_INCREMENT,
            station_name VARCHAR(100) NOT NULL,
            longitude FLOAT NOT NULL,
            latitude FLOAT NOT NULL,
            PRIMARY KEY (station_id)
        )
    `);
    const users = await pool.query(`
        CREATE TABLE users (
            user_id INT NOT NULL AUTO_INCREMENT,
            user_name VARCHAR(100) NOT NULL,
            balance INT NOT NULL,
            PRIMARY KEY (user_id)
        )
    `);
    const wallets = await pool.query(`
        CREATE TABLE wallets (
            wallet_id INT NOT NULL AUTO_INCREMENT,
            user_id INT NOT NULL,
            balance INT NOT NULL,
            PRIMARY KEY (wallet_id),
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
        )
    `);
    const trains = await pool.query(`
        CREATE TABLE trains (
            train_id INT NOT NULL AUTO_INCREMENT,
            train_name VARCHAR(100) NOT NULL,
            capacity INT NOT NULL,
            PRIMARY KEY (train_id)
        )
    `);
    const tickets = await pool.query(`
        CREATE TABLE tickets (
            ticket_id INT NOT NULL AUTO_INCREMENT,
            wallet_id INT NOT NULL,
            time_after TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
            station_from INT NOT NULL,
            station_to INT NOT NULL,
            PRIMARY KEY (ticket_id),
            FOREIGN KEY (wallet_id) REFERENCES wallets(wallet_id) ON DELETE CASCADE,
            FOREIGN KEY (station_from) REFERENCES stations(station_id) ON DELETE CASCADE,
            FOREIGN KEY (station_to) REFERENCES stations(station_id) ON DELETE CASCADE
        )
    `);
    const train_stops = await pool.query(`
        CREATE TABLE train_stops (
            stop_id INT NOT NULL AUTO_INCREMENT,
            train_id INT NOT NULL,
            station_id INT NOT NULL,
            arrival_time TIME NOT NULL,
            departure_time TIME NOT NULL,
            fare INT NOT NULL,
            PRIMARY KEY (stop_id),
            FOREIGN KEY (train_id) REFERENCES trains(train_id) ON DELETE CASCADE,
            FOREIGN KEY (station_id) REFERENCES stations(station_id) ON DELETE CASCADE
        )
    `);
};


const getWallet = async (wallet_id) =>{
    try{
        const [ data ] = await pool.query(`SELECT * FROM wallets INNER JOIN users ON wallets.user_id = users.user_id WHERE wallet_id = ?;`, [ wallet_id ]);
        if(data.length === 0){
            return {
                data: null,
                error: null
            }
        }
        return {
            data,
            error: null
        }
    } catch(error){
        return {
            data: null,
            error: error.code
        }
    }
}
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


const insertUser = async (user_id, user_name, balance) =>{
    try{
        const [ { insertId } ] = await pool.query(`INSERT INTO users VALUES(?, ?, ?);`,[user_id, user_name, balance]);
        const [ users ] = await pool.query(`SELECT * FROM users WHERE user_id = ? ;`, [ insertId ]);
        return {
            user: users[0],
            error: null
        }
    } catch(error){
        return {
            user: null,
            error: error.code
        }
    }
}
const insertStation = async (station_id,station_name,longitude,latitude) =>{
    try{
        const [ { insertId } ] = await pool.query(`INSERT INTO stations VALUES(?, ?, ?, ?);`,[station_id,station_name,longitude,latitude]);
        const [ stations ] = await pool.query(`SELECT * FROM stations WHERE station_id = ? ;`, [ insertId ]);
        console.log(insertId);
        return {
            station: stations[0],
            error: null
        }
    } catch(error){
        return {
            station: null,
            error: error.code
        }
    }
}

const insertTicket = async (wallet_id, time_after, station_from, station_to) => {
    try {
        // Insert the ticket into the database
        const [result] = await pool.query('INSERT INTO tickets (wallet_id, time_after, station_from, station_to) VALUES (?, ?, ?, ?)', [wallet_id, time_after, station_from, station_to]);
        const ticketId = result.insertId;

        // Fetch the inserted ticket from the database
        const [ticket] = await pool.query('SELECT * FROM tickets WHERE ticket_id = ?', [ticketId]);
        
        // Fetch the wallet balance
        const [wallet] = await pool.query('SELECT balance FROM wallets WHERE wallet_id = ?', [wallet_id]);

        // Fetch the list of stations in order of visits
        const [stations] = await pool.query('SELECT * FROM train_stops WHERE train_id = (SELECT train_id FROM train_stops WHERE stop_id = ?) ORDER BY stop_id ASC', [station_from]);

        // Format the stations data
        const formattedStations = stations.map(station => ({
            station_id: station.station_id,
            train_id: station.train_id,
            arrival_time: station.arrival_time,
            departure_time: station.departure_time
        }));

        // Add null arrival time for the first station and null departure time for the last station
        formattedStations[0].arrival_time = null;
        formattedStations[formattedStations.length - 1].departure_time = null;
        console.log(formattedStations);

        return {
            ticket_id: ticketId,
            wallet_id: wallet_id,
            balance: wallet[0].balance,
            stations: formattedStations
        };
    } catch (error) {
        return { ticket_id: null, error: error.message };
    }
};



export {
    getStations,
    getWallet,
    insertUser,
    insertStation,
    getTrainStops,
    insertTicket
}

