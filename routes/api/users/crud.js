/*
** Author: Sylvain Garant
** Website: https://github.com/Xobtah
*/

let router = require('express').Router();
let config = require('./../../../config');
let User = require('mongoose').model('User');
let Training = require('mongoose').model('Training');
let mid = require('./../../middlewares');
let mailer = require('./../../mailer');
let fs = require('fs');
let path = require('path');

/**
* @api {GET} /api/user Get current user's info
* @apiName GetUser
* @apiGroup User
*
* @apiSuccessExample Success-Response:
*    HTTP/1.1 200 OK
*    {
*        "success": true,
*        "message": "OK",
*        "data": {
*           username: 'GotoMars',
*           firstName: 'Elon',
*           lastName: 'Musk'
*        }
*    }
*
* @apiSuccess {Boolean} success True
* @apiSuccess {String} message Success message.
* @apiSuccess {Object} data Object that contains the user.
*/

router.get('/', mid.checkUser, (req, res) => {
    if (!req.user)
        return (res.status(403).send({ success: false, message: 'User not found' }));
    req.user.trainings.forEach((trainingId, index) => Training.findById(trainingId).then((training) => req.user.trainings[index] = training));
    res.status(200).send({ success: true, message: 'OK', data: req.user });
});

/**
* @api {GET} /api/user/:id Get user by id
* @apiName GetUserById
* @apiGroup User
*
* @apiParam {ID} id The ID of the desired user.
* @apiParam {Object} fields The keys of the fields contained in this object will be the fields returned. Each value must be 'true'.
*
* @apiSuccessExample Success-Response:
*    HTTP/1.1 200 OK
*    {
*        "success": true,
*        "message": "OK",
*        "data": {
*           username: 'GotoMars',
*           firstName: 'Elon',
*           lastName: 'Musk',
*           otherFields: []
*        }
*    }
*
* @apiSuccess {Boolean} success True
* @apiSuccess {String} message Success message.
* @apiSuccess {Object} data Object that contains the user.
*
* @apiError UserNotFound No user found with this id.
* @apiError NoPathParamProvided Path param id wasn't provided.
*/

router.get('/:id', mid.checkUser, mid.optionalFields([ 'fields' ]), (req, res) => {
    if (!req.params.id)
        return (res.status(403).send({ success: false, message: 'Path param :id is empty' }));
    User.findOne({ _id: req.params.id }).lean().then((user) => {
        if (!user)
            return (res.status(403).send({ success: false, message: 'User not found' }));
        if (Object.keys(req.query).length && user.links) {
            let funcs = [];
            user.links.forEach((link, i) => {
                funcs.push(function (callback) {
                    User.findById(link, req.query, (err, user2) => {
                        if (!err)
                            user.links[i] = user2;
                        callback();
                    }).catch(callback);
                });
            });
            async.parallel(funcs, (err) => {
                res.status(200).send({ success: true, message: 'OK', data: user });
            });
        }
	else
            res.status(200).send({ success: true, message: 'OK', data: user });
    }).catch((err) => res.status(403).send({ success: false, message: err }));
});

/**
* @api {POST} /api/user Register new user
* @apiName Register
* @apiGroup User
*
* @apiParam {String} username User's unique username.
* @apiParam {String} email User's unique email.
* @apiParam {String} firstName User's first name.
* @apiParam {String} lastName User's last name.
* @apiParam {Date} birthDate User's birth date.
* @apiParam {String} password User's password.
* @apiParam {String} bio User's biography.
* @apiParam {String} coverPic Absolute path to user's cover picture hosted in the server without URL.
* @apiParam {String} profilePic Absolute path to user's profile picture hosted in the server without URL.
* @apiParam {[String]} roles List of user's roles.
* @apiParam {ID} sportHall User's sport hall ID.
* @apiParam {Number} goal User's goal (in minutes).
*
* @apiSuccess {Boolean} success True
* @apiSuccess {String} message Success message.
*
* @apiError UsernameExists The username already exists.
*/

router.post('/', mid.fieldsFromModel(User), (req, res) => {
    let user = new User();
    for (key in req.fields)
        user[key] = req.fields[key];
    /*if (req.fields.profilePic) {
        req.fields.profilePic.mv(path.join('/', 'public', 'assets', req.files.profilePic.name));
        user.profilePic = path.join('/', 'static', req.files.profilePic.name);
    }
    if (req.fields.coverPic) {
        req.fields.coverPic.mv(path.join('/', 'public', 'assets', req.files.coverPic.name));
        user.coverPic = path.join('/', 'static', req.files.coverPic.name);
    }*/
    user.roles = [];
    user.setPassword(user.password, (err) => {
        if (err)
            return (res.status(403).send({ success: false, message: err }));
        user.save((err) => {
            if (err)
                return (res.status(403).send({ success: false, message: err }));
            mailer.welcome(user, (err, info) => {
                if (err)
                    return (res.status(500).send({ success: false, message: err }));
                console.log('Email sent: ' + JSON.stringify(info));
                res.status(200).send({ success: true, message: 'User ' + req.fields.firstName + ' ' + req.fields.lastName + ' has been inserted' });
            });
        });
    });
});

/**
* @api {PUT} /api/user Update user's info
* @apiName UpdateUser
* @apiGroup User
*
* @apiParam {String} username User's unique username.
* @apiParam {String} email User's unique email.
* @apiParam {String} firstName User's first name.
* @apiParam {String} lastName User's last name.
* @apiParam {Date} birthDate User's birth date.
* @apiParam {String} bio User's biography.
* @apiParam {String} coverPic Absolute path to user's cover picture hosted in the server without URL.
* @apiParam {String} profilePic Absolute path to user's profile picture hosted in the server without URL.
* @apiParam {[String]} roles List of user's roles.
* @apiParam {ID} sportHall User's sport hall ID.
* @apiParam {Number} goal User's goal (in minutes).
*
* @apiSuccess {Boolean} success True
* @apiSuccess {String} message Success message.
*
* @apiError UsernameExists The username already exists.
*/

router.put('/', mid.token, mid.fieldsFromModelAllOptional(User), (req, res) => {
    User.findById(req.token._id, (err, user) => {
        if (err)
            return (res.status(500).send({ success: false, message: err }));
        if (!user)
            return (res.status(500).send({ success: false, message: 'Can not find user' }));
        for (key in req.fields)
            if (key !== 'password')
                user[key] = req.fields[key];
        user.save((err) => {
            if (err)
                return (res.status(403).send({ success: false, message: err }));
            res.status(200).send({ success: true, message: 'User ' + user.username + ' has been updated' });
        });
    });
});

/**
* @api {DELETE} /api/user Delete current user (self)
* @apiName DeleteSelf
* @apiGroup User
*
* @apiParam {String} password User's password.
*
* @apiSuccess {Boolean} success True
* @apiSuccess {String} message Success message.
*
* @apiError IncorrectPassword The password is incorrect.
*/

router.delete('/', mid.checkLogin, (req, res) => {
    req.user.remove((err, user) => {
        if (err)
            return (res.status(500).send({ success: false, message: err }));
        res.status(200).send({ success: true, message: 'User ' + user.firstName + ' ' + user.lastName + ' has been deleted' });
    });
});

/**
* @api {DELETE} /api/user/:id Delete user by id
* @apiName DeleteUserById
* @apiGroup User
* @apiDescription User must have at least one of the following roles: [ 'admin' ]
*
* @apiParam {String} password Current user's password (the password of the one who deletes).
*
* @apiSuccess {Boolean} success True
* @apiSuccess {String} message Success message.
*
* @apiError IncorrectPassword The password is incorrect.
*/

router.delete('/:id', mid.oneRole([ 'admin' ]), mid.checkLogin, (req, res) => {
    if (!req.params.id)
        return (res.status(500).send({ success: false, message: 'No params provided' }));
    User.findById(req.params.id, (err, user) => {
        if (err)
            return (res.status(500).send({ success: false, message: err }));
        user.remove((err, user) => {
            if (err)
                return (res.status(500).send({ success: false, message: err }));
            res.status(200).send({ success: true, message: 'User has been deleted' });
        });
    });
});

module.exports = router;
