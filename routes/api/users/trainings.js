/*
** Author: Sylvain Garant
** Website: https://github.com/Xobtah
*/

let router = require('express').Router();
let Training = require('mongoose').model('Training');
let mid = require('./../../middlewares');

/**
* @api {GET} /api/user/training Get all training sessions for a user
* @apiName GetUserTraining
* @apiGroup User
*
* @apiSuccess {Boolean} success True
* @apiSuccess {String} message Success message.
*/

router.get('/', mid.checkUser, (req, res) => {
    Training.find({ _id: { $in: req.user.trainings } })
        .then((trainings) => res.status(200).send({ success: true, message: 'OK', data: trainings }))
        .catch((err) => res.status(500).send({ success: false, message: err }));
});

/**
* @api {POST} /api/user/training Add a training session for a user
* @apiName TrainUser
* @apiGroup User
*
* @apiParam {String} name Name of training
* @apiParam {String} description Description of training
* @apiParam {[Object]} sequences Array containing the sequences
*
* @apiSuccess {Boolean} success True
* @apiSuccess {String} message Success message.
*
* @apiError ServerError The server encountered an unexpected error.
*/

router.post('/', mid.checkUser, mid.fieldsFromModel(Training), (req, res) => {
    let training = new Training(req.fields);
    training.save((err, training) => {
        if (err)
            return (res.status(500).send({ success: false, message: err }));
        req.user.trainings.push(training._id);
        req.user.save((err) => {
            if (err)
                return (res.status(500).send({ success: false, message: err }));
            res.status(200).send({ success: true, message: 'Training added to user' });
        });
    });
});

module.exports = router;
