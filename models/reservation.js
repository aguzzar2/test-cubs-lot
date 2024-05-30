const mongoose = require('mongoose')
const Reservation = require('./book')
// Create Schema normal table database for Mongoose
const authorSchema = new mongoose.Schema({
    name : {
        type: String,
        required: true
    }
})
