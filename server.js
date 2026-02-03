const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'https://resumerocket.tech';

// Basic security & logging
app.set('trust proxy', true);
app.use(helmet());
app.use(morgan('tiny'));

// CORS (allow frontend origin and credentials if you use cookies)
app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true,
  exposedHeaders: ['Content-Disposition'] // expose Content-Disposition so front-end can read filename
}));

// Body parsing with a sensible limit
app.use(express.json({ limit: '1mb' }));

// Serve static build files from a dedicated folder
app.use(express.static(path.join(__dirname, 'public')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Resume Builder API is running',
    timestamp: new Date().toISOString()
  });
});

// Example: file download endpoint (illustration)
// app.get('/api/resume/:id/download', async (req, res, next) => {
//   // produce fileBuffer / filePath
//   res.setHeader('Content-Type', 'application/pdf');
//   res.setHeader('Content-Disposition', 'attachment; filename="resume.pdf"');
//   // if streaming: stream.pipe(res)
//   res.send(fileBuffer);
// });

// Don't let the SPA catch API calls — return 404 for unknown /api/* routes
app.get('/api/*', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// Serve index.html for all other routes (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
