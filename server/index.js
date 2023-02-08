import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';

import connectDB from './mongodb/connect.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json( { limit: '50mb' }));

app.get('/', async (req, res) => {
    res.send('Hello from DALL-E');
})

const startServer = async () => {
    try {
        connectDB(process.env.MONGODB_URL);
        app.listen(process.env.PORT, ()=> {
            console.log(`Server has started on port http://localhost:${process.env.PORT}`);
        })
    } catch (err) {
        console.log(err);   
    }
} 

startServer();