import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import geminiRoutes from './routes/gemini.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/gemini', geminiRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Vision To Venture backend running on http://localhost:${PORT}`);
});
