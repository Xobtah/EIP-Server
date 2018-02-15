/*
** @author: Sylvain Garant
** @website: https://github.com/Xobtah
*/

let router = require('express').Router();

router.use('/api', require('./api'));

// Error middleware
router.use(function (err, req, res, next) {
    return (res.status(err.status || 500).send({ success: false, message: err.message }));
});

module.exports = router;
