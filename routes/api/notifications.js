/*
** Author: Sylvain Garant
** Website: https://github.com/Xobtah
*/

let router = require('express').Router();
let Notification = require('mongoose').model('Notification');
let mid = require('./../middlewares');

/**
* @api {GET} /api/notif Get all notifications for the current user
* @apiName GetNotification
* @apiGroup Notification
*
* @apiSuccess {Boolean} success True
* @apiSuccess {String} message Success message.
* @apiSuccess {Object} data Array that contains all notifications.
*/

router.get('/', mid.checkUser, (req, res) => {
    Notification.find({ to: req.user._id }, (err, notifs) => {
        if (err)
            return (res.status(500).send({ success: false, message: err }));
        res.status(200).send({ success: true, message: 'OK', data: notifs });
    });
});

/**
* @api {DELETE} /api/notif Delete all notifications for the current user
* @apiName DeleteNotification
* @apiGroup Notification
*
* @apiSuccess {Boolean} success True
* @apiSuccess {String} message Success message.
*/

router.delete('/', mid.checkUser, (req, res) => {
    Notification.find({ to: req.user._id }).remove((err) => {
        if (err)
            return (res.status(500).send({ success: false, message: err }));
        res.status(200).send({ success: true, message: 'Notifications deleted' });
    });
});

module.exports = router;
