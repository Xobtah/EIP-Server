/*
** Author: Sylvain Garant
** Website: https://github.com/Xobtah
*/

let router = require('express').Router();
let Training = require('mongoose').model('Training');
let mid = require('./../middlewares');
let _ = require('lodash');

/**
* @api {GET} /api/training Get all training sessions
* @apiName GetTraining
* @apiGroup Training
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
* @api {GET} /api/training/:id Get training sessions by id
* @apiName GetTrainingById
* @apiGroup Training
*
* @apiParam {Number} id The training's id
*
* @apiSuccess {Boolean} success True
* @apiSuccess {String} message Success message.
*
* @apiError TrainingNotFound No training found with this id.
* @apiError NoPathParamProvided Path param id wasn't provided.
*/

router.get('/:id', mid.checkUser, (req, res) => {
    if (!req.params.id)
        return (res.status(400).send({ success: false, message: 'Path param id not provided' }));
    Training.findOne({ _id: req.params.id })
        .then((training) => res.status(200).send({ success: true, message: 'OK', data: training }))
        .catch((err) => res.status(500).send({ success: false, message: err }));
});

/**
* @api {POST} /api/training Add a training session
* @apiName PostTraining
* @apiGroup Training
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

/**
* @api {PUT} /api/training/:id Update training sessions by id
* @apiName UpdateTraining
* @apiGroup Training
*
* @apiParam {Number} id The training's id
*
* @apiSuccess {Boolean} success True
* @apiSuccess {String} message Success message.
*
* @apiError TrainingNotFound No training found with this id.
* @apiError NoPathParamProvided Path param id wasn't provided.
*/

router.put('/:id', mid.checkUser, mid.fieldsFromModelAllOptional(Training), (req, res) => {
    if (!req.params.id)
        return (res.status(400).send({ success: false, message: 'Path param id not provided' }));
    Training.update({ _id: req.params.id }, req.fields)
        .then(() => res.status(200).send({ success: true, message: 'Training updated' }))
        .catch((err) => res.status(500).send({ success: false, message: err }));
});

/**
* @api {DELETE} /api/training Remove trainings
* @apiName RemoveTraining
* @apiGroup Training
*
* @apiParam {[ID]} id Array of id
*
* @apiSuccess {Boolean} success True
* @apiSuccess {String} message Success message.
*/

router.delete('/', mid.checkUser, mid.fields('id'), (req, res) => {
    req.user.trainings = _.difference(req.user.trainings, req.fields.id);
    Training.find({ _id: { $in: req.fields.id } }).remove().exec();
    res.status(200).send({ success: true, message: 'OK' });
});

module.exports = router;
