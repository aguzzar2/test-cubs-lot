const mongoose = require('mongoose')

// Create Schema normal table database for Mongoose
const authorSchema = new mongoose.Schema({
    name : {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Author', authorSchema)