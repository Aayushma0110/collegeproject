import express from 'express';
import dotenv from 'dotenv';
import cors from'cors';
import router from './src/routes/routes.js';
import path  from 'path'

dotenv.config();
const app =express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({extended:false}));

//middleware to parse json body
app.use(cors());



app.use('/api', router);
app.get ('/',(req,res)=>{
    res.send('Hello from express js server!');
});

app.listen(PORT, () => {
    console.log(`server is running on http//localhost:${PORT}`);
});