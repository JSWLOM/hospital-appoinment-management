const express = require('express');
const db = require('../database');
const { verifyToken } = require('./auth');

const router = express.Router();

router.use(verifyToken(['Admin', 'Receptionist']));

// Get all bills
router.get('/', (req, res) => {
    db.all(`
        SELECT b.*, a.appointment_date, p.name as patient_name 
        FROM bills b
        JOIN appointments a ON b.appointment_id = a.id
        LEFT JOIN patients p ON a.patient_id = p.id
    `, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Generate a bill
router.post('/', (req, res) => {
    const { appointment_id, amount } = req.body;
    if (!appointment_id || amount === undefined) {
        return res.status(400).json({ error: 'Appointment ID and amount are required' });
    }

    db.run("INSERT INTO bills (appointment_id, amount) VALUES (?, ?)", 
        [appointment_id, amount], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: this.lastID, appointment_id, amount, status: 'Unpaid' });
    });
});

// Mark bill as paid
router.patch('/:id/pay', (req, res) => {
    db.run("UPDATE bills SET status = 'Paid' WHERE id = ?", [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Bill marked as Paid', changes: this.changes });
    });
});

module.exports = router;
