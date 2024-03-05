var LocalStrategy = require('passport-local');
var userModel = require('../models/user.js').User;
var userSchema = require('../models/user.js').Schema;

module.exports = function (passport) {
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        userModel.findById(id, function (err, user) {
            done(err, user);
        });
    });

    // Local 
    // Signup
    passport.use('local-signup', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    }, function (req, email, password, done) {
        process.nextTick(function () {
            var errors = [];
                if (req.body.username === '') {
                    errors.push('Username is required.');
                }
                if (req.body.email === '') {
                    errors.push('Email is required.');
                }
                if (req.body.password === '') {
                    errors.push('Password is required.');
                }
                if (req.body.conPassword === '') {
                    errors.push('Confirmation Password is required.');
                }
                if (req.body.firstName === '') {
                    errors.push('First Name is required.');
                }
                if (req.body.lastName === '') {
                    errors.push('Last Name is required.');
                }
                
            userModel.findOne({'local.userName': req.body.username}, function (err, user) {
                if (err) {
                    return done(err);
                }
                if (user) {
                    errors.push('That username is already taken.');
                }
            });
            userModel.findOne({'local.email': email.toLowerCase()}, function (err, user) {
                if (err) {
                    return done(err);
                }
                if (user) {
                    errors.push('That email is already taken.');
                } 
                if (req.body.password !== req.body.conPassword) {
                    errors.push('Passwords do not match.');
                }
                if (errors.length > 0) {
                   return done(null, false, req.flash('signupMessage', errors)) 
                } else {
                    var newUser = new userModel();

                    newUser.local.email = email.toLowerCase();
                    newUser.local.password = newUser.generateHash(password);
                    newUser.local.userName = req.body.userName;
                    newUser.local.name.first = req.body.firstName;
                    newUser.local.name.middle = req.body.middleName;
                    newUser.local.name.last = req.body.lastName;
                    newUser.local.gender = req.body.gender;
                    console.log(req.body.gender);
                    newUser.local.address.street = req.body.street;
                    newUser.local.address.city = req.body.city;
                    newUser.local.address.state = req.body.state;
                    newUser.local.address.zipCode = req.body.zipCode;
                    newUser.local.shoeSize = req.body.shoeSize;
                    newUser.local.amputee = req.body.amputee;

                    newUser.save(function (err) {
                        if (err) {
                            throw err;
                        }
                        return done(null, newUser);
                    });
                }
            });
        });
    }));
    // Login
    passport.use('local-login', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    }, function (req, email, password, done) {
        userModel.findOne({'local.email': email.toLowerCase()}, function (err, user) {
            if (err) {
                return done(err);
            }

            if (!user) {
                return done(null, false, req.flash('loginMessage', 'No user found with that Email.'));
            }
            if (!user.validPassword(password)) {
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
            }

            return done(null, user);
        });
    }));
};
