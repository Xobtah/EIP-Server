/*
** Author: Sylvain Garant
** Website: https://github.com/Xobtah
*/

let router = require('express').Router();
let User = require('mongoose').model('User');
let SportsHall = require('mongoose').model('SportsHall');
let mid = require('./../../middlewares');

/**
* @api {PUT} /api/user/sub/:id Subscribe user to a sportshall
* @apiName SubSportsHall
* @apiGroup User
*
* @apiParam {Number} id SportsHall id
*
* @apiSuccess {Boolean} success True
* @apiSuccess {String} message Success message.
*
* @apiError UserNotFound The user have not been found.
* @apiError SportsHallNotFound The sports hall have not been found.
*/

router.put('/:id', mid.checkUser, (req, res) => {
    if (!req.params.id)
        return (res.status(400).send({ success: false, message: 'Missing param id' }));
    SportsHall.findById(req.params.id).then((sh) => {
	if (!sh)
	    return (res.status(404).send({ success: false, message: 'Sports Hall not found' }));
	req.user.sportsHall = req.params.id;
	req.user.save((err) => {
	    if (err)
		return (res.status(500).send({ success: false, message: err }));
	    res.status(200).send({ success: true, message: 'User subscribed to the sports hall' });
	});
    }).catch((err) => res.status(500).send({ success: false, message: err }));
});

module.exports = router;
