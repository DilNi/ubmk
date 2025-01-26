const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    date: { type: String, required: true },
    type: { type: String, required: true },
    speaker: { type: String, required: false }, 
    description: { type: String, required: false },
    code: { type: String, required: false }, 
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    location: { type: String, required: true },
    sessionChair: { type: String, required: false }, 
    pdf: { type: String, default: null } 
});

module.exports = mongoose.model('Session', sessionSchema);
