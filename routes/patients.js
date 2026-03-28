const express = require('express');
const db = require('../database');
const { verifyToken } = require('./auth');

const router = express.Router();

// Admin and Receptionist can manage patients
router.use(verifyToken(['Admin', 'Receptionist']));

// Get all patients
router.get('/', (req, res) => {
    db.all("SELECT * FROM patients", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Add a patient
router.post('/', (req, res) => {
    const { name, age, gender, phone } = req.body;
    if (!name || !age) return res.status(400).json({ error: 'Name and age are required' });

    db.run("INSERT INTO patients (name, age, gender, phone) VALUES (?, ?, ?, ?)", 
        [name, age, gender, phone], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: this.lastID, name, age, gender, phone });
    });
});

// Delete a patient
router.delete('/:id', (req, res) => {
    db.run("DELETE FROM patients WHERE id = ?", req.params.id, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Patient deleted', changes: this.changes });
    });
});

module.exports = router;
