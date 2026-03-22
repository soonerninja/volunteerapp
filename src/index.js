const express = require('express');
const cors = require('cors');
const { closeDatabase } = require('./db/database');
const volunteersRouter = require('./routes/volunteers');
const eventsRouter = require('./routes/events');
const signupsRouter = require('./routes/signups');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/volunteers', volunteersRouter);
app.use('/api/events', eventsRouter);
app.use('/api/signups', signupsRouter);

app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const server = app.listen(PORT, () => {
  console.log(`Volunteer app listening on port ${PORT}`);
});

process.on('SIGTERM', () => {
  closeDatabase();
  server.close();
});

module.exports = app;
