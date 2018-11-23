/*
** Author: Sylvain Garant
** Website: https://github.com/Xobtah
*/

let router = require('express').Router();
let config = require('./../../../config');
let User = require('mongoose').model('User');
let Training = require('mongoose').model('Training');
let JWT = require('jsonwebtoken');
let mid = require('./../../middlewares');
let mailer = require('./../../mailer');
let _ = require('lodash');
let async = require('async');

router.use('/', require('./crud'));
router.use('/training', require('./training'));
router.use('/link', require('./link'));

/**
* @api {GET} /api/user/p/:pattern Get list of users by pattern
* @apiName GetUserByPattern
* @apiGroup User
*
* @apiParam {String} pattern The pattern that is contained in the username, the first name or the last name of the user.
*
* @apiSuccess {Boolean} success True
* @apiSuccess {String} message Success message.
* @apiSuccess {Object} data List of users, or empty list.
*/

router.get('/p/:pattern', mid.checkUser, (req, res) => {
    if (!req.params.pattern)
        return (res.status(403).send({ success: false, message: 'Path param :pattern is empty' }));
    let regexp = { $regex: req.params.pattern, $options: 'i' };

    User.find({ $or: [ { username: regexp }, { firstName: regexp }, { lastName: regexp } ] }, (err, users) => {
        if (err)
            return (res.status(403).send({ success: false, message: err }));
        if (!users)
            return (res.status(403).send({ success: false, message: 'Users not found' }));
        res.status(200).send({ success: true, message: 'OK', data: users });
    });
});

/**
* @api {GET} /api/user/q/:query Get user by username
* @apiName GetUserByUsername
* @apiGroup User
*
* @apiParam {String} query The desired user's username.
*
* @apiSuccess {Boolean} success True
* @apiSuccess {String} message Success message.
* @apiSuccess {Object} data The user, or empty object.
*/

router.get('/q/:query', mid.checkUser, (req, res) => {
    if (!req.params.query)
        return (res.status(403).send({ success: false, message: 'Path param :query is empty' }));
    User.getUserByUsername(req.params.query, (err, user) => {
        if (err)
            return (res.status(403).send({ success: false, message: err }));
        if (!user)
            return (res.status(403).send({ success: false, message: 'User ' + req.params.query + ' not found' }));
        res.status(200).send({ success: true, message: 'OK', data: user });
    });
});

/*
* @api {GET} /api/user/new Get form for creating a new user
* @apiName GetNewUserForm
* @apiGroup User
*
* @apiSuccess {Boolean} success True
* @apiSuccess {String} message Success message.
* @apiSuccess {Object} data Object that contains the variables.
*/

// router.get('/new', (req, res) => {
//     res.status(200).send({ success: true, message: 'OK', data: User.schema.paths });
// });

/**
* @api {PUT} /api/user/password Update user's password
* @apiName UpdateUserPassword
* @apiGroup User
*
* @apiParam {String} password User's password.
* @apiParam {String} newPassword User's new password.
*
* @apiSuccess {Boolean} success True
* @apiSuccess {String} message Success message.
*
* @apiError IncorrectPasword The password provided is incorrect.
*/

router.put('/password', mid.checkLogin, mid.fields([ 'newPassword' ]), (req, res) => {
    req.user.setPassword(req.fields.newPassword, (err) => {
        if (err)
            return (res.status(403).send({ success: false, message: err }));
        req.user.save((err) => {
            if (err)
                return (res.status(403).send({ success: false, message: err }));
            res.status(200).send({ success: true, message: 'User ' + req.user.firstName + ' ' + req.user.lastName + '\'s password has been updated' });
        });
    });
});

/**
* @api {LOCK} /api/user/password Recover user's password
* @apiName GetUserPassword
* @apiGroup User
*
* @apiSuccess {Boolean} success True
* @apiSuccess {String} message Success message.
*/

router.lock('/password', mid.fields([ 'username', 'email' ]), (req, res) => {
    let newPassword = Math.random().toString(36).slice(-8);
    User.findOne({ username: req.fields.username, email: req.fields.email }).then((user) => {
        user.setPassword(newPassword, (err) => {
            if (err)
                return (res.status(403).send({ success: false, message: err }));
            req.user.save((err) => {
                if (err)
                    return (res.status(403).send({ success: false, message: err }));
                mailer.lostPassword(user, newPassword, (err, info) => {
                    if (err)
                        return (res.status(500).send({ success: false, message: err }));
                    console.log('Email sent: ' + info.response);
                    res.status(200).send({ success: true, message: 'Recovery email sent' });
                });
            });
        });
    }).catch((err) => res.status(403).send({ success: false, message: err }));
});

/**
* @api {POST} /api/user/login Login
* @apiName Login
* @apiGroup User
*
* @apiParam {String} username User's unique username.
* @apiParam {String} password User's password.
*
* @apiSuccess {Boolean} success True
* @apiSuccess {String} message Success message.
* @apiSuccess {Object} data Object containing the login token.
*
* @apiError IncorrectPassword The password is incorrect.
* @apiError UserDoesNotExist The user doesn't exist.
*/

router.post('/login', mid.fields([ 'username', 'password' ]), (req, res) => {
    User.getUserByUsername(req.fields.username, (err, user) => {
        if (err)
            return (res.status(500).send({ success: false, message: err }));
        if (!user)
            return (res.status(403).send({ success: false, message: 'Username/password combination doesn\'t match any user' }));
        user.tryPassword(req.fields.password).then((samePassword) => {
            if (!samePassword)
                return (res.status(403).send({ success: false, message: 'Username/password combination doesn\'t match any user' }));
            JWT.sign({ _id: user._id }, config.secret || 'secret', (err, token) => {
                if (err)
                    return (res.status(500).send({ success: false, message: err }));
                res.status(200).send({ success: true, message: 'Logged in', data: { token } });
            });
        }).catch((err) => res.status(500).send({ success: false, message: err }));
    });
});

/**
* @api {GET} /api/user/t/:id Get user's training by user id
* @apiName GetUserTraining
* @apiGroup User
*
* @apiParam {ID} id User ID
*
* @apiSuccess {Boolean} success True
* @apiSuccess {String} message Success message.
*
* @apiError UserNotFound The user have not been found.
*/

router.get('/t/:id', (req, res) => {
    if (!req.params.id)
        return (res.status(400).send({ success: false, message: 'Missing param id' }));
    User.findById(req.params.id).then((user) => {
        if (!user)
            return (res.status(400).send({ success: false, message: 'User not found' }));
	Training.find({ _id: { $in: user.trainings } }, { _id: true, name: true }).then((trainings) => {
            res.status(200).send({ success: true, message: 'OK', data: trainings });
	}).catch((err) => res.status(500).send({ success: false, message: err }));
    }).catch((err) => res.status(500).send({ success: false, message: err }));
});

module.exports = router;
