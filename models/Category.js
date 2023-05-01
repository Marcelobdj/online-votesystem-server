const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    options: [{ type: String, required: true }],
    votes: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            option: { type: String, required: true },
        },
    ],
    isClosed: { type: Boolean, default: false },
});

module.exports = mongoose.model('Category', categorySchema);