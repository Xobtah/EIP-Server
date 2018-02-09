/*
** Author: Sylvain Garant
** Website: https://github.com/Xobtah
*/

let mongoose = require('mongoose');
let bcrypt = require('bcrypt');
let saltRounds = 10;

let UserSchema = mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: [ true, 'can\'t be blank' ],
        match: [ /^[a-zA-Z0-9]+$/, 'is invalid' ],
        index: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: [ true, 'can\'t be blank' ],
        match: [ /\S+@\S+\.\S+/, 'is invalid' ],
        index: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    birthDate: {
        type: Date,
        required: true
    },
    friends: [ mongoose.Schema.Types.ObjectId ]
}, { timestamps: true });

UserSchema.statics.getUserByUsername = function (username, callbalk) {
    this.model('User').findOne({ username: username }, callbalk);
};

UserSchema.methods.tryPassword = function (password, callback) {
    return (bcrypt.compare(password, this.password, callback));
}

UserSchema.methods.setPassword = function (password, callback) {
    return (bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err)
            return (callback('Failed to hash password'));
        this.password = hash;
        this.save(callback);
    }));
}

UserSchema.methods.updateEmail = function (email, callback) {
    this.email = email;
    this.save(callback);
}

/*UserSchema.pre('save', function (next) {
    bcrypt.hash(this.password, saltRounds, (err, hash) => {
        if (err)
            next({ success: false, message: 'Failed to hash password' });
        this.password = hash;
        next();
    });
});*/

mongoose.model('User', UserSchema);
