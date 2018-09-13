/*
** Author: Sylvain Garant
** Website: https://github.com/Xobtah
*/

let router = require('express').Router();
let config = require('./../../../config');
let User = require('mongoose').model('User');
let mid = require('./../../middlewares');

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

router.put('/:id', mid.checkUser, (req, res) => {
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
                return (res.status(400).send({ success: false, message: 'User not found' }));
            req.user.links.push(req.params.id);
            req.user.save((err) => {
                if (err)
                    return (res.status(500).send({ success: false, message: err }));
                res.status(200).send({ success: true, message: 'User ' + user.firstName + ' ' + user.lastName + ' has been followed' });
            });
        }).catch((err) => res.status(400).send({ success: false, message: 'User not found' }));
});

module.exports = router;
