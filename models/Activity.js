/*
** Author: Sylvain Garant
** Website: https://github.com/Xobtah
*/

// User's activity

let mongoose = require('mongoose');

let ActivitySchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    game: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    type: {
        type: String,
        default: 'sport'
    },
    timeSpent: Number,
    score: Number,
    date: {
        type: Date,
        default: new Date()
    }
}, { timestamps: true });

mongoose.model('Activity', ActivitySchema);
