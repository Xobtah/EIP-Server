/*
** @author: Sylvain Garant
** @website: https://github.com/Xobtah
*/

let router = require('express').Router();

router.post('/', (req, res) => {
    res.status(200).send({ success: true, message: 'OK' });
});

module.exports = router;
