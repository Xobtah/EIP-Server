/*
** @author: Sylvain Garant
** @website: https://github.com/Xobtah
*/

let nodemailer = require('nodemailer');
let config = require('./../config');

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.email || 'contactsportsfun@gmail.com',
        pass: config.email_password || 'sportsfun'
    }
});

module.exports.welcome = function (user, callback) {
    /*let mail = {
        from: config.email || 'contactsportsfun@gmail.com',
        to: user.email,
        subject: 'Welcome to SportsFun :)',
        text: 'Welcome to SportsFun ' + user.username + '!\n\nWe hope you\'ll have fun on our games. You can connect to the SportsFun network using this link: http://sportsfun.shr.ovh/\n\nSee you soon! :)\nThe SportsFun Staff'
    };
    transporter.sendMail(mail, callback);*/
    nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: config.email || 'contactsportsfun@gmail.com',
            pass: config.email_password || 'sportsfun'
        }
    }).sendMail({
        from: config.email || 'contactsportsfun@gmail.com',
        to: user.email,
        subject: 'Bienvenue sur SportsFun :)',
        text: 'Bienvenue sur SportsFun ' + user.username + '!\n\nNous espérons que tu vas t\'amuser avec nos jeux. Tu peux te connecter sur le réseau SportsFun en utilisant ce lien: http://sportsfun.shr.ovh/\n\nA bientôt! :)\nL\'équipe SportsFun'
    }, callback);
};

module.exports.lostPassword = function (user, newPassword, callback) {
    /*let mail = {
        from: config.email || 'contactsportsfun@gmail.com',
        to: user.email,
        subject: 'Here is your temporary password ;)',
        text: 'Hi ' + user.username + '!\n\n'
        + 'I\'ve heard that you\'ve lost your password? Here is your temporary password, you can connect to SportsFun with it, but change it as soon as you can: ' + newPassword
        + '\n\nSee you soon! :)\nThe SportsFun Staff'
    };
    transporter.sendMail(mail, callback);*/
    nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: config.email || 'contactsportsfun@gmail.com',
            pass: config.email_password || 'sportsfun'
        }
    }).sendMail({
        from: config.email || 'contactsportsfun@gmail.com',
        to: user.email,
        subject: 'Voici ton mot de passe temporaire ;)',
        text: 'Salut ' + user.username + '!\n\n'
        + 'J\'ai cru comprendre que tu avais perdu ton mot de passe? Voici un mot de passe temporaire, tu peux te connecter à SportsFun avec, mais n\'oublie pas de le changer dès que tu peux: ' + newPassword
        + '\n\nA bientôt! :)\nL\'équipe SportsFun'
    }, callback);
};
