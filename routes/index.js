/*
** @author: Sylvain Garant
** @website: https://github.com/Xobtah
*/

let express = require('express');
let path = require('path');
let router = express.Router();

router.use('/static', express.static(path.join(__dirname, '..', 'public', 'assets')));
router.use('/doc', express.static(path.join(__dirname, '..', 'public', 'doc')));

router.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, token");
    next();
});

router.use('/api', require('./api'));

router.get('/', (req, res) => {
    res.send('It\'s up, my dudes :)');
});

// Error middleware
router.use(function (err, req, res, next) {
    return (res.status(err.status || 500).send({ success: false, message: err.message }));
});

module.exports = router;
