import express, { json } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getStations, getWallet, insertUser } from './database.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.SERVER_PORT || 8080;
// const initDb = async () =>{
//     const response = await createDatabase();
// }

app.get('/api/stations', async (req, res) =>{
    const { data, error } = await getStations();
    res.status(200).json({
        stations: data
    });
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
    res.status(200).json(user);
});

app.get('api/stations/:station_id/trains', async (req, res) =>{
    const { station_id } = req.params;
    //TODO: have to store datetime and sort in asc on dept time if same then asc on arrv time
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