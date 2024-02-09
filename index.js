
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getStations, getWallet,getTrainStopsData, getTrainsData,getTrainStops} from './database.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.SERVER_PORT || 8080;
const initializeDatabase = async () =>{
    const response = await createDatabase();
}


app.get('/api/stations', async (req, res) =>{
    const { data, error } = await getStations();
    res.status(200).json({
        stations: data
    });
    return;
});

app.get('/api/train_stops', async (req, res) => {
    const { data, error } = await getTrainStopsData();
    res.status(200).json({
      train_stops: data,
      error,
    });
  });
  
  app.get('/api/trains', async (req, res) => {
    const { data, error } = await getTrainsData();
    res.status(200).json({
      trains: data,
      error,
    });
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


app.get('api/wallets/:wallet_id', async (req, res) =>{
    const { wallet_id } = req.params;
    const { data, error } = await getWallet(wallet_id);
    if(!data){
        res.status(404).json({
            message: `wallet with id: ${wallet_id} was not found`
        });
        return;
    }
    res.status(200).json({
        data
    });
    return;
});

app.listen(port, () =>{
    console.log('Server is running on ' + port);
    console.log(`Listening on http://localhost:${port}/`);
});

