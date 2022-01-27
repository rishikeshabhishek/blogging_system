const mongoose = require('mongoose')
const Schema = mongoose.Schema

const contactSchema = new Schema({
    text: {
        type: String,
        required: true,
    },

});
const contactModel = new mongoose.model('contact', contactSchema)
module.exports = contactModel