require('dotenv').config();
const express = require('express');
const cors = require('cors');

const geminiRoutes = require('./routes/gemini');
const stakeholderRoutes = require('./routes/stakeholders');
const userRoutes = require('./routes/user');

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '2mb' }));

// Routes
app.use('/api/gemini', geminiRoutes);
app.use('/api/stakeholders', stakeholderRoutes);
app.use('/api/user', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Vision of Venture API running' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Vision of Venture API running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}\n`);
});
