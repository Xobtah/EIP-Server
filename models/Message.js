/*
** Author: Sylvain Garant
** Website: https://github.com/Xobtah
*/

let mongoose = require('mongoose');

let MessageSchema = mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    to: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    content: {
        type: Object,
        required: true
    }
}, { timestamps: true });

MessageSchema.pre('save', function (next) {
    if (!this.content.length)
        return (next('Cannot save an empty message'));
});

mongoose.model('Message', MessageSchema);
