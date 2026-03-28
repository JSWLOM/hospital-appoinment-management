const express = require('express');
const db = require('../database');
const { verifyToken } = require('./auth');

const router = express.Router();

router.use(verifyToken(['Admin', 'Receptionist']));

// Get all appointments
router.get('/', (req, res) => {
    db.all(`
        SELECT a.*, p.name as patient_name, d.name as doctor_name 
        FROM appointments a
        LEFT JOIN patients p ON a.patient_id = p.id
        LEFT JOIN doctors d ON a.doctor_id = d.id
    `, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Book an appointment
router.post('/', (req, res) => {
    const { patient_id, doctor_id, appointment_date, appointment_time } = req.body;
    if (!patient_id || !appointment_date || !appointment_time) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    db.run(`INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time) 
            VALUES (?, ?, ?, ?)`, 
        [patient_id, doctor_id, appointment_date, appointment_time], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: this.lastID, patient_id, doctor_id, appointment_date, appointment_time, status: 'Scheduled' });
    });
});

// Update appointment status
router.patch('/:id/status', (req, res) => {
    const { status } = req.body;
    db.run("UPDATE appointments SET status = ? WHERE id = ?", [status, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Status updated', changes: this.changes });
    });
});

module.exports = router;
