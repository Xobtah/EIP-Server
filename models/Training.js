/*
** Author: Sylvain Garant
** Website: https://github.com/Xobtah
*/

let mongoose = require('mongoose');

let TrainingSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: 'sport'
    },
    sequences: [ {
        type: {
            type: String,
            required: true
        },
        totalLength: {
            type: Number,
            required: true
        },
        effortLength: Number,
        restLength: Number,
        iteration: Number

    } ]
}, { timestamps: true });

mongoose.model('Training', TrainingSchema);
