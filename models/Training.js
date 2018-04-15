/*
** Author: Sylvain Garant
** Website: https://github.com/Xobtah
*/

let mongoose = require('mongoose');

let TrainingSchema = mongoose.Schema({
    game: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    type: {
        type: String,
        default: 'sport'
    },
    timeSpent: Number,
    date: {
        type: Date,
        default: new Date()
    },
    activity: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
}, { timestamps: true });

mongoose.model('Training', TrainingSchema);
