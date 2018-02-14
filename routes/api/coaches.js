/*
** Author: Sylvain Garant
** Website: https://github.com/Xobtah
*/

let router = require('express').Router();
let mid = require('./../middlewares');

// Plus users routes

router.post('/edit/username', mid.checkLogin, mid.fields([ 'username' ]), (req, res) => {
    req.user.username = req.fields.username;
    req.user.save((err) => {
        if (err)
            return (res.status(500).send({ success: false, message: err }));
        res.status(200).send({ success: true, message: 'Username changed' });
    });
});

module.exports = router;
