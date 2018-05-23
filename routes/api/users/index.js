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
let _ = require('lodash');
let async = require('async');

/**
* @api {GET} /api/user/debug Get all the users
* @apiName GetAllUsers
* @apiGroup User
*
* @apiSuccess {Boolean} success True
* @apiSuccess {String} message Success message.
* @apiSuccess {Object} data Object that contains the users.
*/

router.get('/debug', mid.checkUser, (req, res) => {
    User.find({}, req.body, (err, users) => {
        if (err)
            return (res.status(403).send({ success: false, message: err }));
        if (!users)
            return (res.status(403).send({ success: false, message: 'User not found' }));
        res.status(200).send({ success:true, message: 'OK', data: users });
    });
});

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
        // if (Object.keys(req.query).length && user.links)
        //     user.links.forEach((link, i) => {
        //         User.findById(link, req.query, (err, user2) => {
        //             if (!err)
        //                 user.links[i] = user2;
        //         });
        //     });
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
                res.status(200).send({ success:true, message: 'OK', data: user });
            });
        }
        // res.status(200).send({ success:true, message: 'OK', data: user });
    }).catch((err) => res.status(403).send({ success: false, message: err }));
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
        // if (req.fields.password)
        //     user.setPassword(req.fields.password);
        user.save((err) => {
            if (err)
                return (res.status(500).send({ success: false, message: err }));
            res.status(200).send({ success: true, message: 'User ' + user.username + ' has been updated' });
        });
    });
});

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
            return (res.status(500).send({ success: false, message: err }));
        req.user.save((err) => {
            if (err)
                return (res.status(500).send({ success: false, message: err }));
            res.status(200).send({ success: true, message: 'User ' + req.user.firstName + ' ' + req.user.lastName + '\'s password has been updated' });
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

/**
* @api {PUT} /api/user/link/:id Follow/Unfollow user
* @apiName FollowUser
* @apiGroup User
*
* @apiParam {Number} id User id
*
* @apiSuccess {Boolean} success True
* @apiSuccess {String} message Success message.
*
* @apiError UserNotFound The user have not been found.
*/

router.put('/link/:id', mid.checkUser, (req, res) => {
    if (!req.params.id)
        return (res.status(400).send({ success: false, message: 'Missing param id' }));
    if (req.user.links.indexOf(req.params.id) >= 0) {
        req.user.links.splice(req.user.links.indexOf(req.params.id), 1);
        req.user.save((err) => {
            if (err)
                return (res.status(500).send({ success: false, message: err }));
            res.status(200).send({ success: true, message: 'User has been unfollowed' });
        });
    }
    else
        User.findOne({ _id: req.params.id }, { firstName: true, lastName: true }).then((user) => {
            if (!user)
                return (res.status(400).send({ success: false, message: 'User does not exist' }));
            req.user.links.push(req.params.id);
            req.user.save((err) => {
                if (err)
                    return (res.status(500).send({ success: false, message: err }));
                res.status(200).send({ success: true, message: 'User ' + user.firstName + ' ' + user.lastName + ' has been followed' });
            });
        });
});

/**
* @api {PUT} /api/user/training Add training to user
* @apiName AddUserTraining
* @apiGroup User
*
* @apiParam {[ID]} id Array of training id to add
* @apiParam {String} username The username of the user to add the training
*
* @apiSuccess {Boolean} success True
* @apiSuccess {String} message Success message.
*
* @apiError UserNotFound The user have not been found.
*/

router.put('/training', mid.checkUser, mid.fields([ 'id', 'username' ]), (req, res) => {
    User.getUserByUsername(req.fields.username).then((user) => {
        if (!user)
            return (res.status(500).send({ success: false, message: 'User not found' }));
        req.fields.id.forEach((id) => user.trainings.push(id));
        user.save((err) => {
            if (err)
                return (res.status(500).send({ success: false, message: err }));
            res.status(200).send({ success: true, message: 'User trainings added' });
        });
    }).catch((err) => res.status(500).send({ success: false, message: err }));
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
        user.trainings.forEach((trainingId, index) => Training.findById(trainingId).then((training) => user.trainings[i] = training));
        res.status(200).send({ success: true, message: 'OK', data: user.trainings });
    }).catch((err) => res.status(500).send({ success: false, message: err }));
});

module.exports = router;
