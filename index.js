
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { getStations, getWallet, insertStation, insertUser,getTrainStops, insertTicket } from './database.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.SERVER_PORT || 8080;
const initializeDatabase = async () =>{
    const response = await createDatabase();
}

initializeDatabase();

app.get('/',()=>{
    res.status(200).json({
        message: 'Connected!'
    })
})


app.get('/api/stations', async (req, res) =>{
    const { data, error } = await getStations();
    res.status(200).json({
        stations: data
    });
    return;
});
app.post('/api/stations', async (req, res) =>{
    const {station_id,station_name,longitude,latitude} = req.body;
    const { station, error } = await insertStation(station_id,station_name,longitude,latitude);
    if(error){
        res.status(404),json({
            message: `${error}: Error occured!`
        })
        return;
    }
    console.log( station);
    res.status(200).json( station);
});



app.post('/api/tickets', async (req, res) =>{
    const { wallet_id, time_after, station_from, station_to } = req.body;
    const { ticket, error } = await insertTicket(wallet_id, time_after, station_from, station_to); // Change insertStation to insertTicket
    if(error){
        res.status(404).json({ // Corrected syntax: Change ,json to .json
            message: `${error}: Error occurred!`
        });
        return;
    }
    console.log(ticket);
    res.status(201).json(ticket); // Change status to 201 for successful creation of a resource
});


app.post('/api/users', async (req, res) =>{
    const { user_id, user_name, balance } = req.body;
    const { user, error } = await insertUser(user_id, user_name, balance);
    if(error){
        res.status(404),json({
            message: `${error}: Error occured!`
        })
        return;
    }
    console.log(user);
    res.status(200).json(user);
});

app.get('/api/stations/:station_id/trains', async (req, res) => {
    const { station_id } = req.params;

    try {
        const { data, error } = await getTrainStops(station_id);

        if (error) {
            res.status(500).json({
                error: 'Internal Server Error',
            });
            return;
        }

        res.status(200).json({
            station_id,
            trains: data,
        });
    } catch (error) {
        console.error('Error fetching train stops:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/wallets/:wallet_ID', async (req, res) =>{
    const { wallet_ID } = req.params;
    const { data, error } = await getWallet(wallet_ID);
    if(!data){
        res.status(404).json({
            message: `wallet with id: ${wallet_ID} was not found`
        });
        return;
    }
    const { wallet_id, user_id, balance, user_name } = data[0];
    res.status(200).json({
        wallet_id,
        wallet_balance: balance,
        wallet_user: {
            user_id,
            user_name
        }
    });
    return;
});

app.listen(port, () =>{
    console.log('Server is running on ' + port);
    console.log(`Listening on http://localhost:${port}/`);
});

