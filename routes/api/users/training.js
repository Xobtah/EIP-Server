/*
** Author: Sylvain Garant
** Website: https://github.com/Xobtah
*/

let router = require('express').Router();
let config = require('./../../../config');
let User = require('mongoose').model('User');
let mid = require('./../../middlewares');

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

router.put('/', mid.checkUser, mid.fields([ 'id', 'username' ]), (req, res) => {
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

module.exports = router;
