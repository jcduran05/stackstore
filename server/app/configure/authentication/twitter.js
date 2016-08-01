'use strict';

var passport = require('passport');
var TwitterStrategy = require('passport-twitter').Strategy;

module.exports = function (app, db) {

    var User = db.model('user');

    var twitterConfig = app.getValue('env').TWITTER;

    var twitterCredentials = {
        consumerKey: twitterConfig.consumerKey,
        consumerSecret: twitterConfig.consumerSecret,
        callbackUrl: twitterConfig.callbackUrl
    };

    // var createNewUser = function (token, tokenSecret, profile) {
    //     return User.create({
    //         twitter_id: profile.id,
    //         email: 'testman@gmail.com'
    //     });
    // };

    var verifyCallback = function (token, tokenSecret, profile, done) {
        console.log(profile)

        User.findOne({
            where: {
                twitter_id: profile.id
            }
        }) .then(function (user) {

                if (user) {
                    return user;
                } else {
                    let first = profile.displayName.split(' ');
                    return User.create({

                        firstName: first[0],
                        lastName: first[1],
                        status: 'registered',
                        email: profile.username +'@gmail.com',
                        twitter_id: profile.id,
                    });
                }
            })
            .then(function (userToLogin) {
                done(null, userToLogin);
            })
            .catch(function (err) {
                console.error('Error creating user from Twitter authentication', err);
                done(err);
            });

    };

    passport.use(new TwitterStrategy(twitterCredentials, verifyCallback));

    app.get('/auth/twitter', passport.authenticate('twitter'));

    app.get('/auth/twitter/callback',
        passport.authenticate('twitter', {failureRedirect: '/login'}),
        function (req, res) {
            res.redirect('/');
        });

};
