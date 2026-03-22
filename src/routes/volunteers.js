const express = require('express');
const { getDatabase } = require('../db/database');

const router = express.Router();

router.get('/', (req, res) => {
  const db = getDatabase();
  const volunteers = db.prepare('SELECT * FROM volunteers ORDER BY created_at DESC').all();
  res.json(volunteers);
});

router.get('/:id', (req, res) => {
  const db = getDatabase();
  const volunteer = db.prepare('SELECT * FROM volunteers WHERE id = ?').get(req.params.id);
  if (!volunteer) return res.status(404).json({ error: 'Volunteer not found' });
  res.json(volunteer);
});

router.post('/', (req, res) => {
  const db = getDatabase();
  const { first_name, last_name, email, phone, skills, availability } = req.body;
  if (!first_name || !last_name || !email) {
    return res.status(400).json({ error: 'first_name, last_name, and email are required' });
  }
  try {
    const result = db.prepare(
      'INSERT INTO volunteers (first_name, last_name, email, phone, skills, availability) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(first_name, last_name, email, phone || null, skills || null, availability || null);
    const volunteer = db.prepare('SELECT * FROM volunteers WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(volunteer);
  } catch (err) {
    if (err.message.includes('UNIQUE constraint')) {
      return res.status(409).json({ error: 'A volunteer with this email already exists' });
    }
    throw err;
  }
});

router.put('/:id', (req, res) => {
  const db = getDatabase();
  const { first_name, last_name, email, phone, skills, availability } = req.body;
  const existing = db.prepare('SELECT * FROM volunteers WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Volunteer not found' });

  db.prepare(
    'UPDATE volunteers SET first_name = ?, last_name = ?, email = ?, phone = ?, skills = ?, availability = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  ).run(
    first_name || existing.first_name,
    last_name || existing.last_name,
    email || existing.email,
    phone !== undefined ? phone : existing.phone,
    skills !== undefined ? skills : existing.skills,
    availability !== undefined ? availability : existing.availability,
    req.params.id
  );
  const volunteer = db.prepare('SELECT * FROM volunteers WHERE id = ?').get(req.params.id);
  res.json(volunteer);
});

router.delete('/:id', (req, res) => {
  const db = getDatabase();
  const result = db.prepare('DELETE FROM volunteers WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Volunteer not found' });
  res.status(204).send();
});

module.exports = router;
