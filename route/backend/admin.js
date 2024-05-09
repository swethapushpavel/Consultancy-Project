const express = require('express');
const router = express.Router();
const Package = require('../models/package');

router.get('/', async (req, res) => {
    const packages = await Package.find();
    res.render('adminDashboard', { packages });
});

router.post('/update-package/:id', async (req, res) => {
    const { name, description, duration, maxCapacity, location, cost } = req.body;
    await Package.findByIdAndUpdate(req.params.id, { name, description, duration, maxCapacity, location, cost });
    res.redirect('/admin');
});

module.exports = router;
