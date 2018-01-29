/*
** @author: Sylvain Garant
** @website: https://github.com/Xobtah
*/

let JWT = require('jsonwebtoken');
let bcrypt = require('bcrypt');

module.exports = {
    JWT: JWT,
    bcrypt: bcrypt,
    checkFields (body, fields, success, error) {
        let object = {};
        let operationSuccess = false;

        operationSuccess = fields.every((key) => {
            if (!body[key]) {
                error(key);
                return (false);
            }
            object[key] = body[key];
            return (true);
        });
        if (operationSuccess)
            success(object);
    }
}
