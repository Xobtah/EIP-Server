/*
** Author: Sylvain Garant
** Website: https://github.com/Xobtah
*/

let mongoose = require('mongoose');

let GameSchema = mongoose.Schema({
    name: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    type: {
        type: String,
        default: 'sport'
    }
}, { timestamps: true });

mongoose.model('Game', GameSchema);
