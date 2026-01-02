import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import router from "./src/routes/routes.js";
import fileUpload from 'express-fileupload';
import path from 'path';
import { fileURLToPath } from 'url';


dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(fileUpload()); 

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', router);


app.get('/', (req, res) => {
    res.send('Hello from Doctor Appointment System Backend!');
});


app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
