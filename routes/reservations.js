const express = require('express')
const router = express.Router()
const Reservation = require('../models/reservation')

// Create Reservation Route
router.get('/', (req, res) => {
    res.send('New Rervation')
})

// Edit Reservation Route
router.get('/', (req, res,) =>{
    res.send('Edit Reservation')
})