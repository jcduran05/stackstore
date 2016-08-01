// var router = require('express').Router();
// var passport = require('passport');
// var db = require('../../db')
// var User = db.model('user')

// var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

// passport.use(GoogleStrategy);

// router.get('/', passport.authenticate('google', {
//   scope: 'email'
// }));

// router.get('/callback', passport.authenticate('google', {
//   successRedirect: '/products',
//   failureRedirect: '/login'
// }));

// passport.use(new GoogleStrategy({
//   clientID: '=',
//   clientSecret: '=',
//   callbackURL: 'http://127.0.0.1:8080/auth/google/callback'
// }, function (token, refreshToken, profile, done) {
//   var info = {
//     name: profile.displayName,
//     // google may not provide an email, if so we'll just fake it
//     email: profile.emails ? profile.emails[0].value : [profile.username , 'fake-auther-email.com'].join('@'),
//   };
//   User.findOrCreate({
//     where: {google_id: profile.id},
//     defaults: info
//   })
//   .spread(function (user) {
//     done(null, user);
//   })
//   .catch(done);
// }));



// module.exports = router;