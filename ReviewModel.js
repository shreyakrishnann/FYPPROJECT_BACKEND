const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReviewSchema = new Schema({
    comment: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now
    },
    userEmail: {
        type: String,
        required: true
    },
    
    brand: {
        type: Schema.Types.ObjectId,
        ref: 'Brand',
        required: true
    }
});

module.exports = mongoose.model('Review', ReviewSchema);
