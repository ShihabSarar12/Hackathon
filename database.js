import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB
}).promise();

const createDatabase = async () =>{
    const dropdb = await pool.query(`DROP DATABASE IF EXISTS ??;`, [ process.env.MYSQL_DB ]);
    const createdb = await pool.query('CREATE DATABASE IF NOT EXISTS ??;',[ process.env.MYSQL_DB ]);
    const stations = await pool.query(`CREATE TABLE stations (
        station_id INT NOT NULL AUTO_INCREMENT,
        station_name VARCHAR(100) NOT NULL,
        longitude FLOAT NOT NULL,
        latitude FLOAT NOT NULL,
        PRIMARY KEY (station_id)
    )`);
}

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