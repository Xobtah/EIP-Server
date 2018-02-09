/*
** @author: Sylvain Garant
** @website: https://github.com/Xobtah
*/

let router = require('express').Router();

router.use('/api', require('./api'));

module.exports = router;
