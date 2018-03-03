/*
** Author: Sylvain Garant
** Website: https://github.com/Xobtah
*/

let router = require('express').Router();
let config = require('./../../config');
let User = require('mongoose').model('User');
let JWT = require('jsonwebtoken');
let mid = require('./../middlewares');

/**
** @api {GET} /api/user/ Get user list
** @apiName GetUserList
** @apiGroup User
**
** @apiParam {Number} id Users unique ID.
**
** @apiSuccess {Boolean} success True
** @apiSuccess {String} message Sucess message.
** @apiSuccess {Object} data Object that contains the list.
*/

router.get('/', mid.checkUser, (req, res) => {
    User.find({}, (err, users) => {
        res.status(200).send(users);
    });
});

/**
** @api {GET} /api/user/:id Get user by id
** @apiName GetUserById
** @apiGroup User
**
** @apiParam {ID} id The ID of the desired user.
**
** @apiSuccessExample Success-Response:
**    HTTP/1.1 200 OK
**    {
**        "success": true,
**        "message": "OK",
**        "data": [
**          {
**                // List
**          }
**        ]
**    }
**
** @apiSuccess {String} firstname Firstname of the User.
** @apiSuccess {String} lastname  Lastname of the User.
*/

router.get('/:id', mid.checkUser, (req, res) => {
    if (!req.params.id)
        res.status(403).send({ success: false, message: 'Path param :id is empty' });
    User.findOne({ _id: req.params.id }, (err, user) => {
        res.status(200).send({ success:true, message: 'OK', data: user });
    });
});

/**
** @api {GET} /api/user/new Get form for creating a new user
** @apiName GetNewUserForm
** @apiGroup User
*/

router.get('/new', (req, res) => {
    res.status(200).send(User.schema.paths);
});

/**
** @api {GET} /api/user/self Get current user's info
** @apiName GetUser
** @apiGroup User
**
** @apiSuccess {String} firstname Firstname of the User.
** @apiSuccess {String} lastname  Lastname of the User.
*/

router.get('/self', mid.checkUser, (req, res) => {
    res.status(200).send({ success: true, message: 'OK', data: req.user });
});

/**
** @api {PUT} /api/user Update user's info
** @apiName UpdateUser
** @apiGroup User
**
** @apiParam {String} username User's unique username.
** @apiParam {String} email User's unique email.
** @apiParam {String} firstName User's first name.
** @apiParam {String} lastName User's last name.
** @apiParam {Date} birthDate User's birth date.
** @apiParam {String} password User's password.
** @apiParam {String} bio User's biography.
** @apiParam {String} coverPic Absolute path to user's cover picture hosted in the server without URL.
** @apiParam {String} profilePic Absolute path to user's profile picture hosted in the server without URL.
** @apiParam {[String]} roles List of user's roles.
** @apiParam {ID} sportHall User's sport hall ID.
** @apiParam {Number} goal User's goal (in minutes).
**
** @apiSuccess {String} firstname Firstname of the User.
** @apiSuccess {String} lastname  Lastname of the User.
*/

router.put('/', mid.token, mid.optionalFields([ 'username', 'email', 'firstName', 'lastName', 'birthDate', 'password', 'bio', 'coverPic', 'profilePic', 'roles', 'sportHall', 'goal' ]), (req, res) => {
    User.findById(req.token._id, (err, user) => {
        if (err)
            return (res.status(500).send({ success: false, message: err }));
        for (key in req.fields)
            user[key] = req.fields[key];
        if (req.fields.password)
            user.setPassword(req.fields.password);
        user.save((err) => {
            if (err)
                return (res.status(500).send({ success: false, message: err }));
            res.status(200).send({ success: true, message: 'User ' + user.username + ' has been updated' });
        });
    });
});

/**
** @apiDefine LoginParam
** @apiParam {String} username Your e-mail-address.
** @apiParam {String} password Your password.
*/

/**
** @api {POST} /api/user Register new user
** @apiName Register
** @apiGroup User
**
** @apiParam {String} username User's unique username.
** @apiParam {String} email User's unique email.
** @apiParam {String} firstName User's first name.
** @apiParam {String} lastName User's last name.
** @apiParam {Date} birthDate User's birth date.
** @apiParam {String} password User's password.
** @apiParam {String} bio User's biography.
** @apiParam {String} coverPic Absolute path to user's cover picture hosted in the server without URL.
** @apiParam {String} profilePic Absolute path to user's profile picture hosted in the server without URL.
** @apiParam {[String]} roles List of user's roles.
** @apiParam {ID} sportHall User's sport hall ID.
** @apiParam {Number} goal User's goal (in minutes).
**
** @apiSuccess {String} firstname Firstname of the User.
** @apiSuccess {String} lastname  Lastname of the User.
*/

router.post('/', mid.fields([ 'username', 'email', 'firstName', 'lastName', 'birthDate', 'password' ]), mid.optionalFields([ 'bio', 'coverPic', 'profilePic', 'roles', 'sportHall', 'goal' ]), (req, res) => {
    let user = new User();
    for (key in req.fields)
        user[key] = req.fields[key];
    user.friends = [];
    if (req.body.bio)
        user.bio = req.body.bio;
    user.setPassword(user.password, (err) => {
        if (err)
            return (res.status(500).send({ success: false, message: err }));
        user.save((err) => {
            if (err)
                return (res.status(500).send({ success: false, message: err }));
            res.status(200).send({ success: true, message: 'User ' + req.fields.firstName + ' ' + req.fields.lastName + ' has been inserted' });
        });
    });
});

/**
** @api {POST} /api/user/login Login
** @apiName Login
** @apiGroup User
**
** @apiParam {String} username User's unique username.
** @apiParam {String} password User's password.
**
** @apiSuccess {String} firstname Firstname of the User.
** @apiSuccess {String} lastname  Lastname of the User.
*/

router.post('/login', mid.fields([ 'username', 'password' ]), (req, res) => {
    User.getUserByUsername(req.fields.username, (err, user) => {
        if (err)
            return (res.status(500).send({ success: false, message: err }));
        if (!user)
            return (res.status(500).send({ success: false, message: 'User \'' + req.fields.username + '\' does not exist' }));
        user.tryPassword(req.fields.password).then((samePassword) => {
            if (!samePassword)
                return (res.status(403).send({ success: false, message: 'Incorrect password' }));
            JWT.sign({ _id: user._id }, config.secret || 'secret', (err, token) => {
                if (err)
                    return (res.status(500).send({ success: false, message: err }));
                res.status(200).send({ success: true, message: 'Logged in', data: { token } });
            });
        }).catch((err) => res.status(500).send({ success: false, message: err }));
    });
});

/*router.post('/edit/password', mid.checkLogin, mid.fields([ 'newPassword' ]), (req, res) => {
    req.user.setPassword(req.fields.newPassword, (err) => {
        if (err)
            return (res.status(500).send({ success: false, message: err }));
        res.status(200).send({ success: true, message: 'Password has been changed' });
    });
});

router.post('/edit/email', mid.checkLogin, mid.fields([ 'email' ]), (req, res) => {
    req.user.updateEmail(req.fields.email, (err) => {
        if (err)
            return (res.status(500).send({ success: false, message: err }));
        res.status(200).send({ success: true, message: 'Email has been changed' });
    });
});*/

/**
** @api {DELETE} /api/user Delete current user
** @apiName DeleteUser
** @apiGroup User
**
** @apiParam {String} password User's password.
**
** @apiSuccess {String} firstname Firstname of the User.
** @apiSuccess {String} lastname  Lastname of the User.
*/

router.delete('/', mid.checkLogin, (req, res) => {
    req.user.remove((err, user) => {
        if (err)
            return (res.status(500).send({ success: false, message: err }));
        res.status(200).send({ success: true, message: 'User ' + user.firstName + ' ' + user.lastName + ' has been deleted' });
    });
});

module.exports = router;
