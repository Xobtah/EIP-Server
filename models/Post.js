/*
** Author: Sylvain Garant
** Website: https://github.com/Xobtah
*/

let mongoose = require('mongoose');

let PostSchema = mongoose.Schema({
    parent: mongoose.Schema.Types.ObjectId,
    likes: [ mongoose.Schema.Types.ObjectId ],
    content: {
        type: Object,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    type: String
}, { timestamps: true });

mongoose.model('Post', PostSchema);
