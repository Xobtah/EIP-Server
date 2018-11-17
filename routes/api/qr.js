/*
** @author: Sylvain Garant
** @website: https://github.com/Xobtah
*/

let router = require('express').Router();
let mid = require('./../middlewares');

/**
* @api {PUT} /api/qr Register a QRCode
* @apiName RegisterQR
* @apiGroup QRCode
*
* @apiParam {String} qr The QRCode
*
* @apiSuccess {Boolean} success True
* @apiSuccess {String} message Success message.
*
* @apiError NoParamProvided QRCode wasn't provided.
*/

router.put('/', mid.checkUser, mid.fields([ 'qr' ]), (req, res) => {
    console.log('QRCode request: ' + req.fields.qr);
    if (!qrcodes.has(req.fields.qr))
        return (res.status(404).send({ success: false, message: 'QRCode not found' }));
    qrcodes.get(req.fields.qr).emit('qr', { _id: req.token._id });
    qrcodes.delete(req.fields.qr);
    res.status(200).send({ success: true, message: 'OK' });
});

module.exports = router;
