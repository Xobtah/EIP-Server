/*
** Author: Sylvain Garant
** Website: https://github.com/Xobtah
*/

let router = require('express').Router();
let Message = require('mongoose').model('Message');
let mid = require('./../middlewares');

router.get('/:id', mid.checkUser, (req, res) => {
    if (!req.params.id)
        return (req.status(403).send({ success: false, message: 'Missing path param id' }));
    Message.getById(req.params.id, (err, message) => {
        if (err)
            return (res.status(500).send({ success: false, message: err }));
        res.status(200).send({ success: true, message: 'OK', data: message });
    });
});

router.post('/new', mid.checkUser, mid.fields([ 'content', 'to' ]), (req, res) => {
    let message = new Message();
    message.content = req.fields.content;
    message.to = req.fields.to;
    message.author = req.user._id;
    message.save((err) => {
        if (err)
            return (res.status(500).send({ success: false, message: err }));
        res.status(200).send({ success: true, message: 'Message sent' });
    });
});

router.delete('/:id', mid.checkUser, (req, res) => {
    if (!req.params.id)
        return (req.status(403).send({ success: false, message: 'Missing path param id' }));
    Message.remove({ _id: req.params.id }, (err, message) => {
        if (err)
            return (res.status(500).send({ success: false, message: err }));
        res.status(200).send({ success: true, message: 'Message deleted' });
    });
});

module.exports = router;
