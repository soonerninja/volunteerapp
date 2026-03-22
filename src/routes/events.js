const express = require('express');
const { getDatabase } = require('../db/database');

const router = express.Router();

router.get('/', (req, res) => {
  const db = getDatabase();
  const { status } = req.query;
  let query = 'SELECT * FROM events';
  const params = [];
  if (status) {
    query += ' WHERE status = ?';
    params.push(status);
  }
  query += ' ORDER BY start_date ASC';
  const events = db.prepare(query).all(...params);
  res.json(events);
});

router.get('/:id', (req, res) => {
  const db = getDatabase();
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  const signups = db.prepare(`
    SELECT s.*, v.first_name, v.last_name, v.email
    FROM signups s
    JOIN volunteers v ON s.volunteer_id = v.id
    WHERE s.event_id = ?
  `).all(req.params.id);

  res.json({ ...event, signups });
});

router.post('/', (req, res) => {
  const db = getDatabase();
  const { title, description, location, start_date, end_date, max_volunteers } = req.body;
  if (!title || !start_date || !end_date) {
    return res.status(400).json({ error: 'title, start_date, and end_date are required' });
  }
  const result = db.prepare(
    'INSERT INTO events (title, description, location, start_date, end_date, max_volunteers) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(title, description || null, location || null, start_date, end_date, max_volunteers || null);
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(event);
});

router.put('/:id', (req, res) => {
  const db = getDatabase();
  const { title, description, location, start_date, end_date, max_volunteers, status } = req.body;
  const existing = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Event not found' });

  db.prepare(
    'UPDATE events SET title = ?, description = ?, location = ?, start_date = ?, end_date = ?, max_volunteers = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  ).run(
    title || existing.title,
    description !== undefined ? description : existing.description,
    location !== undefined ? location : existing.location,
    start_date || existing.start_date,
    end_date || existing.end_date,
    max_volunteers !== undefined ? max_volunteers : existing.max_volunteers,
    status || existing.status,
    req.params.id
  );
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  res.json(event);
});

router.delete('/:id', (req, res) => {
  const db = getDatabase();
  const result = db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Event not found' });
  res.status(204).send();
});

module.exports = router;
