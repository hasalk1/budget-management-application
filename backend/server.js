import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import url from 'url'; 
import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import cors from 'cors';  

const app = express();
const port = 3000;

// Enable CORS
app.use(cors());

// Middleware for parsing JSON bodies
app.use(bodyParser.json());

// Fix for __dirname in ES modules
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the 'frontend' folder
app.use(express.static(path.join(__dirname, '../frontend')));

// Route to serve the register.html page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/register.html')); 
});

// Use routes
app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/transactions', transactionRoutes);
app.use('/budget', budgetRoutes);


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
