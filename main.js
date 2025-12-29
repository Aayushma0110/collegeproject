import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import router from "./src/routes/routes.js";
import fileUpload from 'express-fileupload';
import path from 'path';


dotenv.config();


const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(fileUpload()); 

app.use('/api', router);


app.get('/', (req, res) => {
    res.send('Hello from Express.js server!');
});


app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
