/*
1;4601;0c** Author: Sylvain Garant
** Website: https://github.com/Xobtah
*/

let router = require('express').Router();
let Message = require('mongoose').model('Message');
let User = require('mongoose').model('User');
let mid = require('./../middlewares');
let _ = require('lodash');
let async = require('async');

let usrData = { firstName: true, lastName: true, profilePic: true, _id: true };

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
    Message.find({ author: req.user._id }).distinct('to', (err, toIds) => {
        if (err)
            return (res.status(500).send({ success: false, message: err }));
        Message.find({ to: req.user._id }).distinct('author', (err, fromIds) => {
            if (err)
                return (res.status(500).send({ success: false, message: err }));
            let ids = _.union(fromIds, toIds);
            let messages = [];
            let tasks = [];
            
            ids.forEach((id) => {
                tasks.push(function (callback) {
                    Message.find({ $or: [ { author: req.user._id, to: id }, { author: id, to: req.user._id } ] }).sort('-createdAt').limit(1).lean().exec((err, message) => {
                        if (err)
                            return (callback(err));
                        messages.push(message);
                        callback();
                    });
                });
            });
            
            async.parallel(tasks, (err) => {
                if (err)
                    return (res.status(500).send({ success: false, message: err }));
                tasks = [];
                messages.forEach((elem, i) => {
                    tasks.push(function (callback) {
                        User.findById(elem.author, usrData).then((author) => {
                            User.findById(elem.to, usrData).then((to) => {
                                messages[i].author = author;
                                messages[i].to = to;
                                callback();
                            }).catch(callback);
                        }).catch(callback);
                    });
                });
                async.parallel(tasks, (err) => {
                    if (err)
                        return (res.status(500).send({ success: false, message: err }));
                    res.status(200).send({ success: true, message: 'OK', data: messages });
                });
            });
        });
    });
});

/**
* @api {GET} /api/message/:id Get messages by corresponding id
* @apiName GetMessageTo
* @apiGroup Message
*
* @apiParam {Number} id The ID of the person you're talking to.
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
    Message.find({ author: req.token._id, to: req.params.id }).lean().then((messagesTo) => {
        Message.find({ author: req.params.id, to: req.token._id }).lean().then((messagesFrom) => {
            let messages = _.union(messagesTo, messagesFrom);
            let tasks = [];
            messages.forEach((elem, i) => {
                tasks.push(function (callback) {
                    User.findById(elem.author, usrData).then((author) => {
                        User.findById(elem.to, usrData).then((to) => {
                            messages[i].author = author;
                            messages[i].to = to;
                            callback();
                        }).catch(callback);
                    }).catch(callback);
                });
            });
            async.parallel(tasks, (err) => {
                if (err)
                    return (res.status(500).send({ success: false, message: err }));
                res.status(200).send({ success: true, message: 'OK', data: messages });
            });
        }).catch((err) => res.status(500).send({ success: false, message: err }));
    }).catch((err) => res.status(500).send({ success: false, message: err }));
});

/**
* @api {GET} /api/message/last/:id Get last messages from the last ID
* @apiName GetLastMessages
* @apiGroup Message
*
* @apiParam {Number} id The ID of the message
*
* @apiSuccess {Boolean} success True
* @apiSuccess {String} message Success message.
* @apiSuccess {Object} data Object containing the list of the messages.
*
* @apiError UserNotFound User not found with the id provided.
* @apiError NoPathParamProvided Path param id wasn't provided.
*/

router.get('/last/:id', mid.checkUser, (req, res) => {
    if (!req.params.id)
        return (res.status(403).send({ success: false, message: 'Missing param id' }));
    Message.findById(req.params.id).then((message) => {
        Message.find({ author: message.author, to: message.to, createdAt: { $gte: message.createdAt } }).then((messagesByAuthor) => {
            Message.find({ author: message.to, to: message.author, createdAt: { $gte: message.createdAt } }).then((messagesByDestinator) => {
                res.status(200).send({ success: true, message: 'OK', data: _.union(messagesByAuthor, messagesByDestinator) });
            }).catch((err) => res.status(404).send({ success: false, message: err }));
        }).catch((err) => res.status(404).send({ success: false, message: err }));
    }).catch((err) => res.status(404).send({ success: false, message: err }));
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

router.post('/', mid.checkUser, mid.fields(['content', 'to']), (req, res) => {
    if (req.fields.to == req.user._id)
        return (res.status(403).send({ success: false, message: 'You cannot send a message to yourself' }));
    let message = new Message();
    message.content = req.fields.content;
    message.to = req.fields.to;
    message.author = req.user._id;
    message.save((err) => {
        if (err)
            return (res.status(403).send({ success: false, message: err }));
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
        if (message.author == req.user._id)
            res.status(200).send({ success: true, message: 'Message deleted' });
        else
            res.status(403).send({ success: false, message: 'You cannot delete a message that is not yours' });
    });
});

module.exports = router;
