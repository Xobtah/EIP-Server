/*
** @author: Sylvain Garant
** @website: https://github.com/Xobtah
*/

let router = require('express').Router();
let mid = require('./../middlewares');

router.put('/', mid.token, mid.fields([ 'qr' ]), (req, res) => {
    if (!qrcodes.has(req.fields.qr))
        return (res.status(404).send({ success: false, message: 'QRCode not found' }));
    qrcodes.get(req.fields.qr).emit('qr', req.token);
    qrcodes.delete(req.fields.qr);
    res.status(200).send({ success: true, message: 'OK' });
});

module.exports = router;
