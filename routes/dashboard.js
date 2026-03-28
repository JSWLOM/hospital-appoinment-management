const express = require('express');
const db = require('../database');
const { verifyToken } = require('./auth');

const router = express.Router();

router.use(verifyToken(['Admin', 'Receptionist']));

router.get('/stats', (req, res) => {
    const stats = {
        total_patients: 0,
        total_doctors: 0,
        total_appointments: 0,
        total_revenue: 0,
        recent_patients: [],
        doctors_list: []
    };

    let queriesCompleted = 0;
    const totalQueries = 6;

    const checkDone = () => {
        queriesCompleted++;
        if (queriesCompleted === totalQueries) {
            res.json(stats);
        }
    };

    db.get("SELECT COUNT(*) as count FROM patients", (err, row) => {
        if (!err && row) stats.total_patients = row.count;
        checkDone();
    });

    db.get("SELECT COUNT(*) as count FROM doctors", (err, row) => {
        if (!err && row) stats.total_doctors = row.count;
        checkDone();
    });

    db.get("SELECT COUNT(*) as count FROM appointments", (err, row) => {
        if (!err && row) stats.total_appointments = row.count;
        checkDone();
    });

    db.get("SELECT SUM(amount) as total FROM bills WHERE status = 'Paid'", (err, row) => {
        if (!err && row) stats.total_revenue = row.total || 0;
        checkDone();
    });

    db.all("SELECT id, name, age FROM patients ORDER BY id DESC LIMIT 5", (err, rows) => {
        if (!err && rows) stats.recent_patients = rows;
        checkDone();
    });

    db.all("SELECT id, name, specialty FROM doctors", (err, rows) => {
        if (!err && rows) stats.doctors_list = rows;
        checkDone();
    });
});

module.exports = router;
