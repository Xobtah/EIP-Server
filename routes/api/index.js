/*
** @author: Sylvain Garant
** @website: https://github.com/Xobtah
*/

let router = require('express').Router();

router.use('/user', require('./users.js'));
router.use('/post', require('./posts.js'));

module.exports = router;
