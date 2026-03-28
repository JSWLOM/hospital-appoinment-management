const express = require('express');
const db = require('../database');
const { verifyToken } = require('./auth');

const router = express.Router();

// Only Admins can manage doctors
router.use(verifyToken(['Admin']));

// Get all doctors
router.get('/', (req, res) => {
    db.all("SELECT * FROM doctors", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Add a new doctor
router.post('/', (req, res) => {
    const { name, specialty, phone } = req.body;
    if (!name || !specialty) return res.status(400).json({ error: 'Name and specialty are required' });

    db.run("INSERT INTO doctors (name, specialty, phone) VALUES (?, ?, ?)", 
        [name, specialty, phone], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: this.lastID, name, specialty, phone });
    });
});

// Delete a doctor
router.delete('/:id', (req, res) => {
    db.run("DELETE FROM doctors WHERE id = ?", req.params.id, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Doctor deleted', changes: this.changes });
    });
});

module.exports = router;
