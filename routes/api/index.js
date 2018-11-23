/*
** @author: Sylvain Garant
** @website: https://github.com/Xobtah
*/

let router = require('express').Router();

router.get('/mail', (req, res) => {
    require('./../mailer').welcome({ username: 'Oui', email: 'sylvain.garant@epitech.eu' }, console.log);
    res.send('OK' );
});

router.use('/user', require('./users'));
router.use('/coach', require('./users').use(require('./coaches')));
router.use('/post', require('./posts'));
router.use('/message', require('./messages'));
router.use('/activity', require('./activities'));
router.use('/notif', require('./notifications'));
router.use('/training', require('./trainings'));
router.use('/qr', require('./qr'));

module.exports = router;
