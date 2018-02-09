/*
** Author: Sylvain Garant
** Website: https://github.com/Xobtah
*/

let mongoose = require('mongoose');

let PostSchema = mongoose.Schema({
    parent: mongoose.Schema.Types.ObjectId,
    creationDate: {
        type: Date,
        required: true
    },
    likes: [ mongoose.Schema.Types.ObjectId ],
    content: {
        type: Object,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    type: String,
    lastModified: {
        type: Date,
        required: true
    }
}, { timestamps: true });

PostSchema.pre('save', function (next) {
    this.lastModified = new Date();
    next();
});

mongoose.model('Post', PostSchema);
