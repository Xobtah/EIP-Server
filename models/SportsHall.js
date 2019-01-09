/*
** Author: Sylvain Garant
** Website: https://github.com/Xobtah
*/

let mongoose = require('mongoose');

let SportsHallSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    }
}, { timestamps: true });

mongoose.model('SportsHall', SportsHallSchema);
