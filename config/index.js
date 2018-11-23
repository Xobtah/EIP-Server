/*
** @author: Sylvain Garant
** @website: https://github.com/Xobtah
*/

module.exports = {
    port: process.env.API_PORT || 8080,
    secret: process.env.API_SECRET || 'Tsar-Bomba is worth 50 Megaton, that\'s 3 333 Hiroshima.',
    saltRounds: process.env.SALT_ROUNDS || 10,
    mongoURL: process.env.MONGODB_URL || 'mongodb://mdb:27017/sportsfun',
    email: 'contactsportsfun@gmail.com',
    email_password: 'sportsfun'
}
