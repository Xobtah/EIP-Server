/*
** @author: Sylvain Garant
** @website: https://github.com/Xobtah
*/

let express = require('express');
let path = require('path');
let router = express.Router();

router.use('/static', express.static(path.join(__dirname, '..', 'assets')));

router.use('/api', require('./api'));

// Error middleware
router.use(function (err, req, res, next) {
    return (res.status(err.status || 500).send({ success: false, message: err.message }));
});

module.exports = router;
