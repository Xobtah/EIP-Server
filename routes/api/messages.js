/*
** Author: Sylvain Garant
** Website: https://github.com/Xobtah
*/

let router = require('express').Router();
let Message = require('mongoose').model('Message');
let mid = require('./../middlewares');

/**
* @api {GET} /api/message Get last messages from each of the user's conversations
* @apiName GetMessageSnapshots
* @apiGroup Message
*
* @apiSuccess {String} firstname Firstname of the User.
* @apiSuccess {String} lastname  Lastname of the User.
*/

router.get('/', mid.checkUser, (req, res) => {
    Message.find({ author: req.token._id }).distinct('to', (error, ids) => {
        //Message.find({ author: req.token._id, to: { $in: ids } }, (err, messages) => {
        Message.find({ author: req.token._id, to: { $in: ids } }).sort('-createdAt').exec((err, messages) => {
            if (err)
                return (res.status(500).send({ success: false, message: err }));
            res.status(200).send({ success: true, message: 'OK', data: messages });
        });
    });
});

/**
* @api {GET} /api/message/:id Get message by id
* @apiName GetMessage
* @apiGroup Message
*
* @apiParam {Number} id The ID of the message to get.
*
* @apiSuccess {String} firstname Firstname of the User.
* @apiSuccess {String} lastname  Lastname of the User.
*/

router.get('/:id', mid.token, mid.checkUser, (req, res) => {
    if (!req.params.id)
        return (req.status(403).send({ success: false, message: 'Missing path param id' }));
    Message.find({ author: req.token._id, to: req.params.id }, (err, messages) => {
        if (err)
            return (res.status(500).send({ success: false, message: err }));
        res.status(200).send({ success: true, message: 'OK', data: messages });
    });
});

/**
* @api {POST} /api/message Post a new message
* @apiName PostMessage
* @apiGroup Message
*
* @apiParam {String} content The content of the message.
* @apiParam {Number} content The ID of the user that's going to get the message.
*
* @apiSuccess {String} firstname Firstname of the User.
* @apiSuccess {String} lastname  Lastname of the User.
*/

router.post('/', mid.checkUser, mid.fields([ 'content', 'to' ]), (req, res) => {
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

/**
* @api {DELETE} /api/message/:id Delete a message by id
* @apiName DeleteMessage
* @apiGroup Message
*
* @apiParam {Number} id The ID of the message to delete.
*
* @apiSuccess {String} firstname Firstname of the User.
* @apiSuccess {String} lastname  Lastname of the User.
*/

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
