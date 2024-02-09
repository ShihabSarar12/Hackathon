
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getStations, getWallet, getTrainStops, updateBalance, createDatabase} from './database.js';

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
        res.status(500).json({ error: 'Internal Server Error'});
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

app.put('/api/wallets/:wallet_ID', async (req, res) =>{
    const { wallet_ID } = req.params;
    const { recharge } = req.body;
    const { data, error } = await updateBalance(recharge, wallet_ID);
});

app.listen(port, () =>{
    console.log('Server is running on ' + port);
    console.log(`Listening on http://localhost:${port}/`);
});

