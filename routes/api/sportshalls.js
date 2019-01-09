/*
** Author: Sylvain Garant
** Website: https://github.com/Xobtah
*/

let router = require('express').Router();
let SportsHall = require('mongoose').model('SportsHall');
let mid = require('./../middlewares');

/**
* @api {GET} /api/sportshall Get all the sports halls
* @apiName GetSportsHalls
* @apiGroup SportsHall
*
* @apiSuccess {Boolean} success True
* @apiSuccess {String} message Success message.
* @apiSuccess {Object} data Array that contains all sports halls.
*/

router.get('/', mid.checkUser, (req, res) => {
    SportsHall.find({}).then((sportshalls) => {
        res.status(200).send({ success: true, message: 'OK', data: sportshalls });
    }).catch((err) => res.status(500).send({ success: false, message: err }));
});

/**
* @api {POST} /api/sportshall Post a new sports hall
* @apiName PostSportsHall
* @apiGroup SportsHall
*
* @apiParam {String} name The name of the sports hall.
*
* @apiSuccess {Boolean} success True
* @apiSuccess {String} message Success message.
*/

router.post('/', mid.checkUser, mid.fieldsFromModel(SportsHall), (req, res) => {
    new SportsHall(req.fields).save((err) => {
        if (err)
            return (res.status(500).send({ success: false, message: err }));
        res.status(200).send({ success: true, message: 'OK' });
    });
});

/**
* @api {PUT} /api/sportshall/:id Update a sports hall
* @apiName UpdateSportsHall
* @apiGroup SportsHall
*
* @apiParam {String} id The id of the sports hall.
* @apiParam {String} name The name of the sports hall.
*
* @apiSuccess {Boolean} success True
* @apiSuccess {String} message Success message.
*/

router.put('/:id', mid.checkUser, mid.fieldsFromModelAllOptional(SportsHall), (req, res) => {
    if (!req.params.id)
        return (res.status(403).send({ success: false, message: 'Missing path param id' }));
    SportsHall.findById(req.params.id).then((sportshall) => {
        if (req.fields.name)
            sportshall.name = req.fields.name;
        sportshall.save((err) => {
            if (err)
                return (res.status(500).send({ success: false, message: err }));
            res.status(200).send({ success: true, message: 'OK' });
        });
    }).catch((err) => res.status(500).send({ success: false, message: err }));
});

/**
* @api {DELETE} /api/sportshall Delete a sportshall by id
* @apiName DeleteSportsHall
* @apiGroup SportsHall
*
* @apiParam {String} id The id of the sportshall.
*
* @apiSuccess {Boolean} success True
* @apiSuccess {String} message Success message.
*/

router.delete('/:id', mid.checkUser, (req, res) => {
    if (!req.params.id)
        return (res.status(403).send({ success: false, message: 'Missing path param id' }));
    SportsHall.findById({ _id: req.params.id }).remove((err) => {
        if (err)
            return (res.status(500).send({ success: false, message: err }));
        res.status(200).send({ success: true, message: 'SportsHall deleted' });
    });
});

module.exports = router;
