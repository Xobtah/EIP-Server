/*
** Author: Sylvain Garant
** Website: https://github.com/Xobtah
*/

let router = require('express').Router();
let mid = require('./../middlewares');

// Plus users routes

/**
* @api {POST} /api/coach/activities Add activities to a coach
* @apiName AddCoachActivities
* @apiGroup Coach
*
* @apiParam {[ ID ]} activities An array of activities ID
*
* @apiSuccess {Boolean} success True
* @apiSuccess {String} message Success message.
*/

router.post('/activities', mid.checkUser, mid.fields([ 'activities' ]), (req, res) => {
    req.fields.activities.forEach((act) => {
        if (req.user.activities.indexOf(act) < 0)
            req.user.activities.push(act);
    });
    req.user.save((err) => {
        if (err)
            return (res.status(500).send({ success: true, message: err }));
        res.status(200).send({ success: true, message: 'OK' });
    });
});

/**
* @api {DELETE} /api/coach/activities Remove activities from a coach
* @apiName DeleteCoachActivities
* @apiGroup Coach
*
* @apiParam {[ID]} activities An array of activities ID
*
* @apiSuccess {Boolean} success True
* @apiSuccess {String} message Success message.
*/

router.delete('/activities', mid.checkUser, mid.fields([ 'activities' ]), (req, res) => {
    req.fields.activities.forEach((act) => {
        let index = req.user.activities.indexOf(act);
        if (index > -1)
            req.user.activities.splice(index, 1);
    });
    req.user.save((err) => {
        if (err)
            return (res.status(500).send({ success: true, message: err }));
        res.status(200).send({ success: true, message: 'OK' });
    });
});

module.exports = router;
