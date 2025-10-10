server.js
const express = require('express');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: '🚀 Resume Builder API - By Md Farooq',
    status: 'SUCCESS - Working from GitHub App!',
    student: 'Md Farooq'
  });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
