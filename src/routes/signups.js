const express = require('express');
const { getDatabase } = require('../db/database');

const router = express.Router();

router.post('/', (req, res) => {
  const db = getDatabase();
  const { volunteer_id, event_id, notes } = req.body;
  if (!volunteer_id || !event_id) {
    return res.status(400).json({ error: 'volunteer_id and event_id are required' });
  }

  const volunteer = db.prepare('SELECT * FROM volunteers WHERE id = ?').get(volunteer_id);
  if (!volunteer) return res.status(404).json({ error: 'Volunteer not found' });

  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(event_id);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  if (event.max_volunteers) {
    const count = db.prepare(
      "SELECT COUNT(*) as count FROM signups WHERE event_id = ? AND status != 'cancelled'"
    ).get(event_id);
    if (count.count >= event.max_volunteers) {
      return res.status(409).json({ error: 'Event is full' });
    }
  }

  try {
    const result = db.prepare(
      'INSERT INTO signups (volunteer_id, event_id, notes) VALUES (?, ?, ?)'
    ).run(volunteer_id, event_id, notes || null);
    const signup = db.prepare('SELECT * FROM signups WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(signup);
  } catch (err) {
    if (err.message.includes('UNIQUE constraint')) {
      return res.status(409).json({ error: 'Volunteer is already signed up for this event' });
    }
    throw err;
  }
});

router.put('/:id', (req, res) => {
  const db = getDatabase();
  const { status, hours_logged, notes } = req.body;
  const existing = db.prepare('SELECT * FROM signups WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Signup not found' });

  db.prepare(
    'UPDATE signups SET status = ?, hours_logged = ?, notes = ? WHERE id = ?'
  ).run(
    status || existing.status,
    hours_logged !== undefined ? hours_logged : existing.hours_logged,
    notes !== undefined ? notes : existing.notes,
    req.params.id
  );
  const signup = db.prepare('SELECT * FROM signups WHERE id = ?').get(req.params.id);
  res.json(signup);
});

router.delete('/:id', (req, res) => {
  const db = getDatabase();
  const result = db.prepare('DELETE FROM signups WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Signup not found' });
  res.status(204).send();
});

router.get('/volunteer/:volunteerId', (req, res) => {
  const db = getDatabase();
  const signups = db.prepare(`
    SELECT s.*, e.title, e.start_date, e.end_date, e.location
    FROM signups s
    JOIN events e ON s.event_id = e.id
    WHERE s.volunteer_id = ?
    ORDER BY e.start_date ASC
  `).all(req.params.volunteerId);
  res.json(signups);
});

module.exports = router;
