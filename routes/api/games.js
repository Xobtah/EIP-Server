/*
** Author: Sylvain Garant
** Website: https://github.com/Xobtah
*/

let router = require('express').Router();
let Game = require('mongoose').model('Game');
let mid = require('./../middlewares');

/**
* @api {GET} /api/game Get all the games
* @apiName GetGames
* @apiGroup Game
*
* @apiSuccess {Boolean} success True
* @apiSuccess {String} message Success message.
* @apiSuccess {Object} data Array that contains all games.
*/

router.get('/', mid.checkUser, (req, res) => {
    Game.find({}).then((games) => {
        res.status(200).send({ success: true, message: 'OK', data: games });
    }).catch((err) => res.status(500).send({ success: false, message: err }));
});

/**
* @api {POST} /api/game Post a new game
* @apiName PostGame
* @apiGroup Game
*
* @apiParam {String} name The name of the game.
* @apiParam {String} type The type of the game.
*
* @apiSuccess {Boolean} success True
* @apiSuccess {String} message Success message.
*/

router.post('/', mid.checkUser, mid.fieldsFromModel(Game), (req, res) => {
    new Game(req.fields).save((err) => {
        if (err)
            return (res.status(500).send({ success: false, message: err }));
        res.status(200).send({ success: true, message: 'OK' });
    });
});

/**
* @api {PUT} /api/game/:id Update a game
* @apiName UpdateGame
* @apiGroup Game
*
* @apiParam {String} id The id of the game.
* @apiParam {String} name The name of the game.
* @apiParam {String} type The type of the game.
*
* @apiSuccess {Boolean} success True
* @apiSuccess {String} message Success message.
*/

router.put('/:id', mid.checkUser, mid.fieldsFromModelAllOptional(Game), (req, res) => {
    if (!req.params.id)
        return (res.status(403).send({ success: false, message: 'Missing path param id' }));
    Game.findById(req.params.id).then((game) => {
        if (req.fields.name)
            game.name = req.fields.name;
        if (req.fields.type)
            game.name = req.fields.type;
        game.save((err) => {
            if (err)
                return (res.status(500).send({ success: false, message: err }));
            res.status(200).send({ success: true, message: 'OK' });
        });
    }).catch((err) => res.status(500).send({ success: false, message: err }));
});

/**
* @api {DELETE} /api/notif Delete a game by id
* @apiName DeleteGame
* @apiGroup Game
*
* @apiParam {String} id The id of the game.
*
* @apiSuccess {Boolean} success True
* @apiSuccess {String} message Success message.
*/

router.delete('/:id', mid.checkUser, (req, res) => {
    if (!req.params.id)
        return (res.status(403).send({ success: false, message: 'Missing path param id' }));
    Game.findById({ _id: req.params.id }).remove((err) => {
        if (err)
            return (res.status(500).send({ success: false, message: err }));
        res.status(200).send({ success: true, message: 'Game deleted' });
    });
});

module.exports = router;
