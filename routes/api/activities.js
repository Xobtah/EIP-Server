/*
** Author: Sylvain Garant
** Website: https://github.com/Xobtah
*/

let router = require('express').Router();
let Activity = require('mongoose').model('Activity');
let mid = require('./../middlewares');

/**
* @api {GET} /api/activity Get all the user's activity
* @apiName GetActivities
* @apiGroup Activity
*
* @apiSuccess {Boolean} success True
* @apiSuccess {String} message Success message.
* @apiSuccess {Object} data Object containing the list of the activities.
*/

router.get('/', mid.token, (req, res) => {
    Activity.find({ user: req.token._id }, (err, activities) => {
        if (err)
            return (res.status(500).send({ success: false, message: err }));
        res.status(200).send({ success: true, message: 'OK', data: activities });
    });
});

/**
* @api {POST} /api/activity Post a new activity
* @apiName PostActivity
* @apiGroup Activity
*
* @apiParam {Number} user The targeted user's ID.
* @apiParam {Number} game If you read this line stp envoie-moi un message et dis moi ce que c'est cette variable.
* @apiParam {Number} type The type of the exercice.
* @apiParam {Number} timeSpent The amount of time spent on the exercice.
*
* @apiSuccess {Boolean} success True
* @apiSuccess {String} message Success message.
*
* @apiError FieldMissing Missing a field.
*/

router.post('/', mid.token, mid.fields([ 'user', 'game', 'type', 'timeSpent' ]), mid.optionalFields([ 'date' ]), (req, res) => {
    let activity = new Activity();
    for (key in req.fields)
        activity[key] = req.fields[key];
    activity.save((err) => {
        if (err)
            return (res.status(500).send({ success: false, message: err }));
        res.status(200).send({ success: true, message: 'Activity saved' });
    });
});

/**
* @api {PUT} /api/activity/:id Update an activity by id
* @apiName UpdateActivity
* @apiGroup Activity
*
* @apiParam {Number} user The targeted user's ID.
* @apiParam {Number} game If you read this line stp envoie-moi un message et dis moi ce que c'est cette variable.
* @apiParam {Number} type The type of the exercice.
* @apiParam {Number} timeSpent The amount of time spent on the exercice.
*
* @apiSuccess {Boolean} success True
* @apiSuccess {String} message Success message.
* @apiSuccess {Object} data Object containing the list of the messages.
*
* @apiError ActivityNotFound Activity not found with the id provided.
* @apiError NoPathParamProvided Path param id wasn't provided.
*/

router.put('/:id', mid.optionalFields([ 'game', 'type', 'timeSpent', 'date' ]), (req, res) => {
    if (!req.params.id)
        return (res.status(500).send({ success: false, message: 'Missing path param ID' }));
    Activity.findOne({ _id: req.params.id }, (err, activity) => {
        if (err)
            return (res.status(500).send({ success: false, message: err }));
        for (key in req.fields)
            activity[key] = req.fields[key];
        activity.save((err) => {
            if (err)
                return (res.status(500).send({ success: false, message: err }));
            res.status(200).send({ success: true, message: 'Activity saved' });
        });
    });
});

module.exports = router;
