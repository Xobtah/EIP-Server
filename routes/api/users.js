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
    res.status(200).send({ success: true, message: 'OK', data: req.user });
});

/**
* @api {GET} /api/user/:id Get user by id
* @apiName GetUserById
* @apiGroup User
*
* @apiParam {ID} id The ID of the desired user.
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

router.get('/:id', mid.checkUser, (req, res) => {
    if (!req.params.id)
        return (res.status(403).send({ success: false, message: 'Path param :id is empty' }));
    User.findOne({ _id: req.params.id }, (err, user) => {
        if (err)
            return (res.status(403).send({ success: false, message: err }));
        if (!user)
            return (res.status(403).send({ success: false, message: 'User not found' }));
        res.status(200).send({ success:true, message: 'OK', data: user });
    });
});

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
    // User.find({ $or: [ { username: /req.params.pattern/i }, { firstName: /req.params.pattern/i }, { lastName: /req.params.pattern/i } ] }, (err, users) => {
    //     if (err)
    //         return (res.status(403).send({ success: false, message: err }));
    //     if (!users)
    //         return (res.status(403).send({ success: false, message: 'Users not found' }));
    //     res.status(200).send({ success: true, message: 'OK', data: users });
    // });
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
* @api {PUT} /api/user Update user's info
* @apiName UpdateUser
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

router.put('/', mid.token, mid.fieldsFromModelAllOptional(User), (req, res) => {
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

// router.post('/edit/password', mid.checkLogin, mid.fields([ 'newPassword' ]), (req, res) => {
//     req.user.setPassword(req.fields.newPassword, (err) => {
//         if (err)
//             return (res.status(500).send({ success: false, message: err }));
//         res.status(200).send({ success: true, message: 'Password has been changed' });
//     });
// });
//
// router.post('/edit/email', mid.checkLogin, mid.fields([ 'email' ]), (req, res) => {
//     req.user.updateEmail(req.fields.email, (err) => {
//         if (err)
//             return (res.status(500).send({ success: false, message: err }));
//         res.status(200).send({ success: true, message: 'Email has been changed' });
//     });
// });

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
*
* @apiParam {String} password Current user's password (the password of the one who deletes).
*
* @apiSuccess {Boolean} success True
* @apiSuccess {String} message Success message.
*
* @apiError IncorrectPassword The password is incorrect.
*/

router.delete('/:id', mid.checkLogin, (req, res) => {
    if (!req.params.id)
        return (res.status(500).send({ success: false, message: 'No params provided' }));
    User.findById(req.params.id, (err, user) => {
        if (err)
            return (res.status(500).send({ success: false, message: err }));
        user.remove((err, user) => {
            if (err)
                return (res.status(500).send({ success: false, message: err }));
            res.status(200).send({ success: true, message: 'User ' + user.firstName + ' ' + user.lastName + ' has been deleted' });
        });
    });
});

module.exports = router;
