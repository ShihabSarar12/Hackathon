import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB
}).promise();

// const createDatabase = async () =>{
//     const dropdb = await pool.query(`DROP DATABASE IF EXISTS ??;`, [ process.env.MYSQL_DB ]);
//     const  createdb = await pool.query('CREATE DATABASE IF NOT EXISTS ??;',[ process.env.MYSQL_DB ]);
//     const stations = await pool.query(`CREATE TABLE stations (
//         station_id INT NOT NULL AUTO_INCREMENT,
//         station_name VARCHAR(100) NOT NULL,
//         longitude FLOAT NOT NULL,
//         latitude FLOAT NOT NULL,
//         PRIMARY KEY (station_id)
//     )`);

// }
const createDatabase = async () => {
    const dropdb = await pool.query('DROP DATABASE IF EXISTS ??', [process.env.MYSQL_DB]);
    const createdb = await pool.query('CREATE DATABASE IF NOT EXISTS ??', [process.env.MYSQL_DB]);
    
    // Create stations table
    const stations = await pool.query(`
        CREATE TABLE stations (
            station_id INT NOT NULL AUTO_INCREMENT,
            station_name VARCHAR(100) NOT NULL,
            longitude FLOAT NOT NULL,
            latitude FLOAT NOT NULL,
            PRIMARY KEY (station_id)
        )
    `);
    
    // Create users table
    const users = await pool.query(`
        CREATE TABLE users (
            user_id INT NOT NULL AUTO_INCREMENT,
            user_name VARCHAR(100) NOT NULL,
            balance INT NOT NULL,
            PRIMARY KEY (user_id)
        )
    `);
    
    // Create wallets table
    const wallets = await pool.query(`
        CREATE TABLE wallets (
            wallet_id INT NOT NULL AUTO_INCREMENT,
            user_id INT NOT NULL,
            balance INT NOT NULL,
            PRIMARY KEY (wallet_id),
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
        )
    `);
    
    // Create trains table
    const trains = await pool.query(`
        CREATE TABLE trains (
            train_id INT NOT NULL AUTO_INCREMENT,
            train_name VARCHAR(100) NOT NULL,
            capacity INT NOT NULL,
            PRIMARY KEY (train_id)
        )
    `);
    
    // Create tickets table
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
    
    // Create train_stops table
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
    
    // Optionally, you can check for errors and handle them
};


const getStations = async () =>{   
    try{
        const [ data ] = await pool.query(`SELECT * FROM stations;`);
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

const getWallet = async (wallet_id) =>{
    try{
        const [ data ] = await pool.query(`SELECT * FROM wallets INNER JOIN users ON wallets.user_id = users.user_id WHERE wallet_id = ?;`, [ wallet_id ]);
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

export {
    getStations,
    getWallet
}