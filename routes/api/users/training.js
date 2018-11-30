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
        req.fields.id.forEach((id) => {
	    let add = true;
	    user.trainings.forEach((id2) => {
		if (id2.equals(id))
		    add = false;
	    });
	    if (add == true)
		user.trainings.push(id);
	});
	//user.trainings = _.uniq(user.trainings, req.fields.id);
        user.save((err) => {
            if (err)
                return (res.status(500).send({ success: false, message: err }));
            res.status(200).send({ success: true, message: 'User trainings added' });
        });
    }).catch((err) => res.status(500).send({ success: false, message: err }));
});

/**
* @api {POST} /api/user/training Remove training from user
* @apiName RemoveUserTraining
* @apiGroup User
*
* @apiParam {ID} id Training id to remove
* @apiParam {String} username The username of the user to remove the training from
*
* @apiSuccess {Boolean} success True
* @apiSuccess {String} message Success message.
*
* @apiError UserNotFound The user have not been found.
*/

router.post('/', mid.fields([ 'id', 'username' ]), (req, res) => {
    User.getUserByUsername(req.fields.username).then((user) => {
        if (!user)
            return (res.status(500).send({ success: false, message: 'User not found' }));
	/*user.trainings.forEach((id, idx) => {
	    if (req.fields.id.equals(id))
		user.trainings.splice(idx, 1);
	});*/
	/*req.fields.id.forEach((idRemove) => {
	    user.trainings.forEach((id, idx) => {
		if (id.equals(idRemove))
		    user.trainings.splice(idx, 1);
	    });
	    //if (user.trainings.indexOf(idRemove) >= 0)
	    //user.trainings.splice(user.trainings.indexOf(idRemove), 1);
	    });*/
	if (user.trainings.indexOf(req.fields.id) >= 0)
	    user.trainings.splice(user.trainings.indexOf(req.fields.id), 1);
        user.save((err) => {
            if (err)
                return (res.status(500).send({ success: false, message: 'Failed to save the user' }));
            res.status(200).send({ success: true, message: 'User trainings removed' });
        });
    }).catch((err) => res.status(500).send({ success: false, message: err }));
});

module.exports = router;
