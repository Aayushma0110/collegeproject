import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import router from "./src/routes/routes.js";
import fileUpload from 'express-fileupload';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendAppointmentReminders } from "./src/services/reminder.service.js";


dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5050;


app.use(express.json());
// Simple request logging to trace issues
app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
});
// Graceful JSON parse error handling
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ message: 'Invalid JSON payload', details: err.message });
    }
    next(err);
});
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
    
    // Start reminder scheduler - check every hour for reminders to send
    console.log('🔔 Starting appointment reminder scheduler...');
    
    // Run immediately on startup
    sendAppointmentReminders();
    
    // Then run every hour (3600000 milliseconds)
    setInterval(sendAppointmentReminders, 60 * 60 * 1000);
    
    console.log('✅ Reminder scheduler started (checks every hour)');
});
