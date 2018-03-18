/*
** @author: Sylvain Garant
** @website: https://github.com/Xobtah
*/

let router = require('express').Router();

router.use('/user', require('./users'));
router.use('/coach', require('./users').use(require('./coaches')));
router.use('/post', require('./posts'));
router.use('/message', require('./messages'));
router.use('/activity', require('./activities'));
router.use('/notif', require('./notifications'));

module.exports = router;
