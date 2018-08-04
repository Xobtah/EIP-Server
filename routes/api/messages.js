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
* @apiSuccess {Boolean} success True
* @apiSuccess {String} message Success message.
* @apiSuccess {Object} data Object containing the list of the latest messages.
*/

router.get('/', mid.checkUser, (req, res) => {
    // Message.find({ author: req.token._id }).distinct('to', (error, ids) => {
    //     //Message.find({ author: req.token._id, to: { $in: ids } }, (err, messages) => {
    //     Message.find({ author: req.token._id, to: { $in: ids } }).sort('-createdAt').exec((err, messages) => {
    //         if (err)
    //             return (res.status(500).send({ success: false, message: err }));
    //         res.status(200).send({ success: true, message: 'OK', data: messages });
    //     });
    // });
    Message.find({ author: req.token._id }).distinct('to', (err, toIds) => {
        if (err)
            return (res.status(500).send({ success: false, message: err }));
        Message.find({ to: req.token._id }).distinct('author', (err, fromIds) => {
            if (err)
                return (res.status(500).send({ success: false, message: err }));
            Message.find({ author: req.token._id, to: { $in: toIds } }).sort('-createdAt').exec((err, toMessages) => {
                if (err)
                    return (res.status(500).send({ success: false, message: err }));
                Message.find({ to: req.token._id, author: { $in: fromIds } }).sort('-createdAt').exec((err, fromMessages) => {
                    if (err)
                        return (res.status(500).send({ success: false, message: err }));
                    res.status(200).send({ success: true, message: 'OK', data: _.union(toMessages, fromMessages) });
                });
            });
        });
    });
});

/**
* @api {GET} /api/message/:id Get messages by receiver id
* @apiName GetMessageTo
* @apiGroup Message
*
* @apiParam {Number} id The ID of the receiver.
*
* @apiSuccess {Boolean} success True
* @apiSuccess {String} message Success message.
* @apiSuccess {Object} data Object containing the list of the messages.
*
* @apiError UserNotFound User not found with the id provided.
* @apiError NoPathParamProvided Path param id wasn't provided.
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
* @apiParam {Number} to The ID of the user that's going to get the message.
*
* @apiSuccess {Boolean} success True
* @apiSuccess {String} message Success message.
*
* @apiError FieldMissing Missing a field.
* @apiError UserNotFound User not find with provided id.
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
* @apiSuccess {Boolean} success True
* @apiSuccess {String} message Success message.
*
* @apiError UserNotFound User not found with the id provided.
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
